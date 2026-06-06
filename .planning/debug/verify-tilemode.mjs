import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
p.on("pageerror", (e) => errs.push("PAGEERR: " + e.message.slice(0, 140)));
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);
await p.click(".theme-menu__trigger");
await p.waitForTimeout(400);

const probe = () => p.evaluate(() => ({
  rasterImgs: document.querySelectorAll(".leaflet-tile-pane img").length,
  glCanvas: document.querySelectorAll("canvas.maplibregl-canvas, .leaflet-pane canvas").length,
}));

for (const mode of ["raster2x", "raster1x", "vectorGL"]) {
  await p.selectOption(".theme-menu__select", mode);
  await p.waitForTimeout(mode === "vectorGL" ? 4000 : 1500);
  const r = await probe();
  console.log(mode, JSON.stringify(r));
}
console.log("ERRORS:", errs.length ? JSON.stringify(errs.slice(0, 6)) : "none");
await b.close();
