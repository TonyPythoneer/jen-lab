// Screenshot the simplified suburb boundary at two zooms for visual verification.
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);

// Zoom out a touch so many suburb outlines are in frame.
await p.evaluate(() => {
  window.__foodMapDebug.map.setZoom(13, { animate: false });
});
await p.waitForTimeout(1200);
await p.screenshot({ path: ".planning/debug/boundary-z13.png" });

await p.evaluate(() => {
  window.__foodMapDebug.map.setZoom(15, { animate: false });
});
await p.waitForTimeout(1200);
await p.screenshot({ path: ".planning/debug/boundary-z15.png" });

console.log("shots saved");
await b.close();
