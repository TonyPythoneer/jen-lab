import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message.slice(0, 140)));
p.on("console", (m) => {
  if (m.type() === "error") errs.push("C:" + m.text().slice(0, 120));
});
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);

const counts = await p.evaluate(() => ({
  domPins: document.querySelectorAll(".r-pin,.r-dot").length,
  domBoats: document.querySelectorAll(".river-boat").length,
  canvasLayers: document.querySelectorAll(".food-canvas-layer").length,
  labels: document.querySelectorAll(".suburb-label").length,
}));

// hover a pin region (desktop tooltip)
await p.mouse.move(560, 380);
await p.waitForTimeout(400);
const hover = await p.evaluate(() => {
  const t = document.querySelector(".food-tip");
  return { tipShown: t && getComputedStyle(t).display !== "none", tipText: t?.textContent || "" };
});

// zoom in to test canvas zoom-anim alignment, screenshot
await p.evaluate(() => {
  window.__foodMapDebug.map.setZoom(16, { animate: true });
});
await p.waitForTimeout(1400);
await p.screenshot({ path: ".planning/debug/final-zoom16.png" });

// pan via drag
await p.mouse.move(550, 400);
await p.mouse.down();
for (let i = 0; i < 20; i++) {
  await p.mouse.move(550 - i * 8, 400 - i * 4);
  await p.waitForTimeout(12);
}
await p.mouse.up();
await p.waitForTimeout(800);
await p.screenshot({ path: ".planning/debug/final-pan.png" });

console.log("counts:", JSON.stringify(counts));
console.log("hover:", JSON.stringify(hover));
console.log("errors:", errs.length ? JSON.stringify(errs.slice(0, 6)) : "none");
await b.close();
