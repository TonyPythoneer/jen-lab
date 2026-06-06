import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);
// Count total boundary vertices currently on the map.
const countPts = () => p.evaluate(() => {
  const m = window.__foodMapDebug.map; let pts = 0;
  const walk = (a) => { if (Array.isArray(a)) { if (a.length && a[0] && a[0].lat != null) {} a.forEach(walk); } else if (a && a.lat != null) pts++; };
  m.eachLayer((l) => { if (l.feature && l.getLatLngs) walk(l.getLatLngs()); });
  return pts;
});
const simplified = await countPts();
await p.click(".theme-menu__trigger");
await p.waitForTimeout(400);
// switches order: boats(0), boundary(1), boundarySimplified(2), course(3), wharf(4)
await p.locator(".theme-menu__switch").nth(2).click(); // simplify OFF -> raw CDN
await p.waitForTimeout(1500);
const raw = await countPts();
await p.locator(".theme-menu__switch").nth(2).click(); // back ON
await p.waitForTimeout(1500);
const backSimplified = await countPts();
console.log(JSON.stringify({ simplified, raw, backSimplified }));
await b.close();
