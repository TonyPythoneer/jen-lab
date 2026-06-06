import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message.slice(0, 140)));
p.on("console", (m) => {
  if (m.type() === "error") errs.push("C:" + m.text().slice(0, 120));
});
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);
const before = await p.evaluate(() => ({
  domPins: document.querySelectorAll(".r-pin").length,
  pinCanvas: document.querySelectorAll(".food-canvas-layer").length,
  canvasPane: !!document.querySelector(".leaflet-pane.leaflet-food-pins-pane, [class*=food-pins]"),
}));
await p.screenshot({ path: ".planning/debug/pincanvas.png" });
// click near center cluster to test hit-test
await p.mouse.click(500, 360);
await p.waitForTimeout(1200);
const afterClick = await p.evaluate(() => ({
  detailOpen: !!document.querySelector(".food-map-app--detail, [class*=detail]"),
}));
await p.screenshot({ path: ".planning/debug/pincanvas-click.png" });
console.log("before:", JSON.stringify(before));
console.log("afterClick:", JSON.stringify(afterClick));
console.log("errors:", errs.length ? JSON.stringify(errs.slice(0, 5)) : "none");
await b.close();
