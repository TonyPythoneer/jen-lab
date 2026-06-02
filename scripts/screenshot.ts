import { chromium } from "playwright";
import { DEV_PORT } from "../app/config/app.ts";

const route = process.argv[2] ?? "/";
const out = process.argv[3] ?? "/tmp/verify.png";
const url = `http://localhost:${DEV_PORT}${route}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log(`Screenshot of ${url} → ${out}`);
