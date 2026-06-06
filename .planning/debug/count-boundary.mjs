// Count the suburb-boundary vertices the map projects on every zoom. Reads the
// already-rendered Leaflet layers via the dev handle (no extra network access).
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage();
p.on("console", (m) => {
  if (m.text().includes("boundary simplified")) console.log("CONSOLE:", m.text());
});
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);

const stats = await p.evaluate(() => {
  const m = window.__foodMapDebug.map;
  let features = 0;
  let rings = 0;
  let points = 0;
  m.eachLayer((l) => {
    if (!l.feature || !l.getLatLngs) return; // boundary paths carry .feature; skip tiles/course lines
    features++;
    const walk = (a) => {
      if (Array.isArray(a)) {
        if (a.length && a[0] && a[0].lat != null) rings++;
        a.forEach(walk);
      } else if (a && a.lat != null) points++;
    };
    walk(l.getLatLngs());
  });
  return { features, rings, points };
});
console.log(JSON.stringify(stats));
await b.close();
