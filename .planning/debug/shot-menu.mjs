// Open the map style menu and screenshot it to verify the dev layer toggles show.
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForFunction(() => !!window.__foodMapDebug, null, { timeout: 30000 });
await p.waitForTimeout(2000);
await p.click(".theme-menu__trigger");
await p.waitForTimeout(500);
await p.screenshot({ path: ".planning/debug/theme-menu.png" });
console.log("menu shot saved");
await b.close();
