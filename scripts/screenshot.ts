import { chromium } from "playwright";

// Same port the dev server uses — DEV_PORT env, default 3500 (see package.json "dev").
const DEV_PORT = Number(process.env.DEV_PORT) || 3500;
const route = process.argv[2] ?? "/";
const out = process.argv[3] ?? "/tmp/verify.png";
const url = `http://localhost:${DEV_PORT}${route}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log(`Screenshot of ${url} → ${out}`);
