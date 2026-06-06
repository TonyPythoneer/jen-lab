import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);
const countBoundary = () =>
  p.evaluate(() => {
    const m = window.__foodMapDebug.map;
    let n = 0;
    m.eachLayer((l) => {
      if (l.feature && l.getLatLngs) n++;
    });
    return n;
  });
const before = await countBoundary();
await p.click(".theme-menu__trigger");
await p.waitForTimeout(400);
// dev switches order: boats(0), boundary(1), course(2), wharf(3)
await p.locator(".theme-menu__switch").nth(1).click();
await p.waitForTimeout(500);
const afterOff = await countBoundary();
await p.locator(".theme-menu__switch").nth(1).click();
await p.waitForTimeout(500);
const afterOn = await countBoundary();
console.log(JSON.stringify({ before, afterOff, afterOn }));
await b.close();
