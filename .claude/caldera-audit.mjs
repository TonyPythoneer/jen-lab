/**
 * Caldera.xyz design audit — captures buttons, interactions, highlights, layout patterns.
 * Run: node .claude/caldera-audit.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const BASE = "https://caldera.xyz";
const OUT = ".claude/screenshots/caldera";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`  ✓ ${name}`);
}
async function fullShot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`  ✓ ${name} (full)`);
}
async function zoomShot(page, selector, name) {
  try {
    const el = await page.$(selector);
    if (el) {
      await el.screenshot({ path: `${OUT}/${name}.png` });
      console.log(`  ✓ ${name} (element)`);
    } else {
      console.log(`  ✗ ${name} — selector not found`);
    }
  } catch (e) {
    console.log(`  ✗ ${name} — ${e.message}`);
  }
}

// ─── Desktop ──────────────────────────────────────────────────────────────────
console.log("\n── Desktop (1440px) ──");
const page = await browser.newPage();
await page.setViewportSize(DESKTOP);
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// 1. Hero — top of page (nav + hero)
await shot(page, "01_hero_top");

// 2. Full hero section
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(300);
await fullShot(page, "00_full_desktop");

// 3. Nav bar close-up
await zoomShot(page, "nav, header, [class*='nav'], [class*='header']", "02_nav_closeup");

// 4. Hero buttons close-up
await zoomShot(
  page,
  "[class*='hero'] [class*='button'], [class*='hero'] a[href], [class*='cta']",
  "03_hero_buttons",
);

// Scroll through the page capturing each section
const sections = [
  { scroll: 900, name: "04_section_community_stats" },
  { scroll: 1800, name: "05_section_features" },
  { scroll: 2700, name: "06_section_rollups" },
  { scroll: 3600, name: "07_section_mid" },
  { scroll: 4500, name: "08_section_lower" },
  { scroll: 5400, name: "09_section_newsletter" },
];

for (const { scroll, name } of sections) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scroll);
  await page.waitForTimeout(600);
  await shot(page, name);
}

// Footer
await page.evaluate(() =>
  window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
);
await page.waitForTimeout(600);
await shot(page, "10_footer");

// ─── Hover states — buttons ───────────────────────────────────────────────────
console.log("\n── Hover states ──");
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(400);

// Primary CTA button hover
const primaryBtn = await page.$("a[class*='primary'], button[class*='primary'], [class*='cta'] a");
if (primaryBtn) {
  await primaryBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, "h01_btn_before_hover");
  await primaryBtn.hover();
  await page.waitForTimeout(400);
  await shot(page, "h02_btn_primary_hover");
}

// Nav link hover
const navLink = await page.$("nav a:not([class*='logo']):not([class*='cta'])");
if (navLink) {
  await navLink.hover();
  await page.waitForTimeout(300);
  await shot(page, "h03_nav_link_hover");
}

// Social icon hover (if any)
const socialIcon = await page.$(
  "[class*='social'] a, footer a[href*='twitter'], footer a[href*='discord']",
);
if (socialIcon) {
  await socialIcon.scrollIntoViewIfNeeded();
  await socialIcon.hover();
  await page.waitForTimeout(300);
  await shot(page, "h04_social_hover");
}

// ─── Scroll animation states ───────────────────────────────────────────────────
console.log("\n── Scroll states ──");
// Scrolled nav (sticky)
await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
await page.waitForTimeout(500);
await shot(page, "s01_nav_scrolled");

await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
await page.waitForTimeout(500);
await shot(page, "s02_scrolled_mid");

// ─── Mobile ───────────────────────────────────────────────────────────────────
console.log("\n── Mobile (390px) ──");
const mob = await browser.newPage();
await mob.setViewportSize(MOBILE);
await mob.goto(BASE, { waitUntil: "networkidle" });
await mob.waitForTimeout(1500);

await shot(mob, "m01_mobile_hero");

// Mobile nav open
const mobileMenuBtn = await mob.$(
  "[class*='burger'], [class*='menu-btn'], [class*='hamburger'], button[aria-label*='menu' i], button[aria-label*='Menu' i]",
);
if (mobileMenuBtn) {
  await mobileMenuBtn.click();
  await mob.waitForTimeout(400);
  await shot(mob, "m02_mobile_nav_open");
}

// Scroll mobile
await mob.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
await mob.waitForTimeout(500);
await shot(mob, "m03_mobile_mid");

await mob.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await mob.waitForTimeout(500);
await shot(mob, "m04_mobile_footer");

await fullShot(mob, "m00_mobile_full");

// ─── Component close-ups ───────────────────────────────────────────────────────
console.log("\n── Component close-ups ──");
const desk2 = await browser.newPage();
await desk2.setViewportSize(DESKTOP);
await desk2.goto(BASE, { waitUntil: "networkidle" });
await desk2.waitForTimeout(1500);

// Cards / feature tiles
const card = await desk2.$("[class*='card'], [class*='tile'], [class*='feature']");
if (card) {
  await card.scrollIntoViewIfNeeded();
  await desk2.waitForTimeout(400);
  await card.screenshot({ path: `${OUT}/c01_card.png` });
  console.log("  ✓ c01_card");

  // Hover on card
  await card.hover();
  await desk2.waitForTimeout(400);
  await card.screenshot({ path: `${OUT}/c02_card_hover.png` });
  console.log("  ✓ c02_card_hover");
}

// Badge / pill / tag
const badge = await desk2.$("[class*='badge'], [class*='pill'], [class*='tag'], [class*='chip']");
if (badge) {
  await badge.scrollIntoViewIfNeeded();
  await badge.screenshot({ path: `${OUT}/c03_badge.png` });
  console.log("  ✓ c03_badge");
}

// Input / form
await desk2.evaluate(() =>
  window.scrollTo({ top: document.body.scrollHeight - 1000, behavior: "instant" }),
);
await desk2.waitForTimeout(500);
const input = await desk2.$("input[type='email'], input[type='text']");
if (input) {
  await input.scrollIntoViewIfNeeded();
  await desk2.waitForTimeout(300);
  await shot(desk2, "c04_form_default");
  await input.click();
  await desk2.waitForTimeout(300);
  await shot(desk2, "c05_form_focused");
}

await browser.close();
console.log(`\n✅ Done — screenshots saved to ${OUT}/`);
