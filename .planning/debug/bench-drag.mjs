// Drag/zoom cost bench for /sydney-food-map vector layers.
//
// WHY: the residual drag jank on low-end Android is a compositor/raster +
// main-thread-reproject problem. Desktop GPUs are too strong to reproduce it, so
// we (1) throttle CPU 6x via CDP to amplify cost, then measure two signals per
// layer config:
//   - zoomCost  : time of a SYNCHRONOUS setZoom round-trip (animate:false). This
//                 reprojects every vector vertex on the main thread — a clean,
//                 deterministic proxy for how heavy the SVG vector layers are.
//   - dragStats : requestAnimationFrame interval distribution during a scripted
//                 drag. rAF is vsync-aligned, so dropped frames widen the gaps —
//                 a proxy for the actual "dragging feels janky" complaint.
//
// Run: node .planning/debug/bench-drag.mjs   (dev server must be on :3500)
//   THROTTLE=6 HEADED=1 node .planning/debug/bench-drag.mjs

import { chromium } from "playwright";

const URL = process.env.URL || "http://localhost:3500/sydney-food-map";
const THROTTLE = Number(process.env.THROTTLE || 6);
const HEADED = process.env.HEADED === "1";
const ZOOM_REPS = 6;

// Each config fully specifies the 4 layers so every row is a single-variable
// delta from the baseline (no cumulative leakage between rows).
const CONFIGS = [
  { label: "baseline_all_on", boats: true, course: true, wharf: true, boundary: true },
  { label: "boats_off", boats: false, course: true, wharf: true, boundary: true },
  { label: "course_off", boats: true, course: false, wharf: true, boundary: true },
  { label: "wharf_off", boats: true, course: true, wharf: false, boundary: true },
  { label: "boundary_off", boats: true, course: true, wharf: true, boundary: false },
  { label: "all_vectors_off", boats: true, course: false, wharf: false, boundary: false },
  { label: "everything_off", boats: false, course: false, wharf: false, boundary: false },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function applyConfig(page, c) {
  await page.evaluate((cfg) => {
    const d = window.__foodMapDebug;
    d.setBoats(cfg.boats);
    d.setCourseLines(cfg.course);
    d.setWharfDots(cfg.wharf);
    d.setBoundary(cfg.boundary);
  }, c);
  await sleep(700);
}

async function zoomCost(page, reps) {
  return page.evaluate((n) => {
    const m = window.__foodMapDebug.map;
    const z = m.getZoom();
    // warm up once (first reproject builds caches)
    m.setZoom(z + 1, { animate: false });
    m.setZoom(z, { animate: false });
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      m.setZoom(z + 1, { animate: false });
      m.setZoom(z, { animate: false });
    }
    return +((performance.now() - t0) / (n * 2)).toFixed(2); // ms per single setZoom
  }, reps);
}

async function dragStats(page) {
  // Install a rAF sampler.
  await page.evaluate(() => {
    window.__frames = [];
    window.__rafOn = true;
    let last = performance.now();
    const tick = (t) => {
      window.__frames.push(t - last);
      last = t;
      if (window.__rafOn) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Scripted drag: hold and sweep the pointer around the map centre.
  const box = page.viewportSize();
  const cx = Math.round(box.width / 2);
  const cy = Math.round(box.height / 2);
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const STEPS = 70;
  for (let i = 0; i < STEPS; i++) {
    const dx = Math.round(Math.sin(i / 6) * 130);
    const dy = Math.round(Math.cos(i / 9) * 90);
    await page.mouse.move(cx + dx, cy + dy);
    await sleep(16);
  }
  await page.mouse.up();
  await sleep(250);

  return page.evaluate(() => {
    window.__rafOn = false;
    const f = window.__frames.slice(5).sort((a, b) => a - b); // drop warm-up frames
    if (!f.length) return null;
    const sum = f.reduce((a, b) => a + b, 0);
    const q = (p) => +f[Math.floor(p * (f.length - 1))].toFixed(1);
    return {
      n: f.length,
      mean: +(sum / f.length).toFixed(1),
      median: q(0.5),
      p95: q(0.95),
      max: +f[f.length - 1].toFixed(1),
      long33: f.filter((x) => x > 33).length, // missed 30fps
      long50: f.filter((x) => x > 50).length, // missed 20fps (visible stutter)
    };
  });
}

// NOGPU=1 forces software compositing so pan/raster cost lands on the throttled
// CPU — this is what lets a desktop reproduce a weak phone's pan-compositor jank.
const launchArgs = process.env.NOGPU === "1"
  ? ["--disable-gpu", "--disable-gpu-compositing", "--disable-software-rasterizer"]
  : [];
const browser = await chromium.launch({ headless: !HEADED, args: launchArgs });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const client = await page.context().newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

console.log(`[bench] throttle=${THROTTLE}x headed=${HEADED} url=${URL}`);
await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await sleep(2500); // let boats spawn + tiles settle

const rows = [];
for (const c of CONFIGS) {
  await applyConfig(page, c);
  const zoom = await zoomCost(page, ZOOM_REPS);
  const drag = await dragStats(page);
  const row = { label: c.label, zoomMs: zoom, ...drag };
  rows.push(row);
  console.log(JSON.stringify(row));
}

console.log("\n=== SUMMARY (throttle " + THROTTLE + "x) ===");
console.table(rows);
await browser.close();
