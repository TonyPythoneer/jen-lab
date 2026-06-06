import { chromium } from "playwright";
const b = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);
await p.click(".theme-menu__trigger");
await p.waitForTimeout(400);
// raster1x URL check (DSR=2 so raster2x would have @2x; raster1x must NOT)
await p.selectOption(".theme-menu__select", "raster2x");
await p.waitForTimeout(1200);
const src2x = await p.evaluate(() => document.querySelector(".leaflet-tile-pane img")?.src);
await p.selectOption(".theme-menu__select", "raster1x");
await p.waitForTimeout(1200);
const src1x = await p.evaluate(() => document.querySelector(".leaflet-tile-pane img")?.src);
console.log("2x:", src2x);
console.log("1x:", src1x);
// GL screenshot
await p.selectOption(".theme-menu__select", "vectorGL");
await p.waitForTimeout(4500);
await p.click(".theme-menu__backdrop").catch(() => {});
await p.waitForTimeout(500);
await p.screenshot({ path: ".planning/debug/gl-mode.png" });
console.log("gl shot saved");
await b.close();
