import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2500);
await p.click(".theme-menu__trigger");
await p.waitForTimeout(400);

const state = () =>
  p.evaluate(() => ({
    fancyPins: document.querySelectorAll(".r-pin").length,
    dots: document.querySelectorAll(".r-dot").length,
    fxOff: document.querySelector(".map-surface")?.classList.contains("fx-off") ?? null,
    vignette: document.querySelectorAll(".map-vignette").length,
    switches: document.querySelectorAll(".theme-menu__switch").length,
  }));

console.log("before:", JSON.stringify(await state()));
// switches order: boats(0), parchmentFx(1), fancyPins(2), maxBounds(3), idleTiles(4), boundary(5)...
await p.locator(".theme-menu__switch").nth(2).click(); // fancyPins off
await p.locator(".theme-menu__switch").nth(1).click(); // parchmentFx off
await p.waitForTimeout(1000);
console.log("after off:", JSON.stringify(await state()));
await b.close();
