import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const errs = [];
p.on("pageerror", (e) => errs.push(e.message.slice(0, 140)));
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);
// Select the SOUTHERNMOST restaurant (hardest to centre — map must pan far up).
const target = await p.evaluate(() => {
  const m = window.__foodMapDebug.map;
  // read restaurants from the rendered pins isn't exposed; use the list store via a tap.
  return { z: m.getZoom() };
});
// Tap the lowest visible pin: click near bottom-centre of the map.
await p.mouse.click(195, 620);
await p.waitForTimeout(1500);
const res = await p.evaluate(() => {
  const h = window.innerHeight;
  const roomCentre = (64 + h * 0.38) / 2;
  const sel = window.__foodMapDebug?.map;
  return {
    h,
    roomCentre: Math.round(roomCentre),
    zoom: sel?.getZoom(),
    detail: !!document.querySelector(".food-map-app--detail"),
  };
});
await p.screenshot({ path: ".planning/debug/mobile-select.png" });
console.log("res:", JSON.stringify(res));
console.log("errors:", errs.length ? JSON.stringify(errs.slice(0, 4)) : "none");
await b.close();
