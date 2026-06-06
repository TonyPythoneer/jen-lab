import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const check = async (url) => {
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.click(".theme-menu__trigger").catch(() => {});
  await p.waitForTimeout(500);
  return p.evaluate(() => ({
    panelHeadings: [...document.querySelectorAll(".theme-menu__heading")].map(e => e.textContent).filter(t => /Dev/.test(t)),
    switches: document.querySelectorAll(".theme-menu__switch").length,
    selects: document.querySelectorAll(".theme-menu__select").length,
  }));
};
console.log("prod NO ?debug:", JSON.stringify(await check("http://localhost:3700/sydney-food-map/")));
console.log("prod WITH ?debug:", JSON.stringify(await check("http://localhost:3700/sydney-food-map/?debug")));
await b.close();
