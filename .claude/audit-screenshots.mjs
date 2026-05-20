/**
 * UI audit screenshot script — captures each homepage section at rest,
 * interactive states, and mobile viewport.
 * Run: node .claude/audit-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const BASE = "http://localhost:3000";
const OUT = ".claude/screenshots";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 }; // iPhone 14 Pro

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

// ─── helper ────────────────────────────────────────────────────────────────

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`  ✓ ${name}`);
}

async function fullShot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`  ✓ ${name} (full)`);
}

async function scrollToSection(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  }, selector);
  await page.waitForTimeout(400);
}

// ─── Desktop: homepage sections ────────────────────────────────────────────

console.log("\n── Desktop (1440px) ──");
const desk = await browser.newPage();
await desk.setViewportSize(DESKTOP);
await desk.goto(BASE, { waitUntil: "networkidle" });
await desk.waitForTimeout(800);

// 1. Header — top (bar state)
await shot(desk, "01_header_top");

// 2. Header — scrolled (pill state)
await desk.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
await desk.waitForTimeout(700);
await shot(desk, "02_header_scrolled_pill");

// 3. Hero section
await desk.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await desk.waitForTimeout(400);
await scrollToSection(desk, "section");
await shot(desk, "03_hero");

// 4. Stats
await scrollToSection(desk, "section:nth-of-type(2)");
await shot(desk, "04_stats");

// 5. ProductDots
await scrollToSection(desk, ".product_dots");
await shot(desk, "05_product_dots");

// 6. Features grid
const featureSections = await desk.$$("section");
if (featureSections[3]) {
  await featureSections[3].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "06_features_grid");
}

// 7. Bringing — accordion default (Food)
await scrollToSection(desk, "section:has(.bg-digital-orange .bg-cyber-violet)");
// fallback: just grab the one after features
const allSections = await desk.$$("section");
if (allSections[4]) {
  await allSections[4].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "07_bringing_default");

  // click Code tab
  const codeItem = await desk.$("text=Code");
  if (codeItem) {
    await codeItem.click();
    await desk.waitForTimeout(350);
    await shot(desk, "07b_bringing_code");
  }

  // click Writing tab
  const writingItem = await desk.$("text=Writing");
  if (writingItem) {
    await writingItem.click();
    await desk.waitForTimeout(350);
    await shot(desk, "07c_bringing_writing");
  }
}

// 8. UseCases tabs
if (allSections[5]) {
  await allSections[5].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "08_usecases_food");

  const tabLabels = ["Code", "Writing", "Wander"];
  for (const label of tabLabels) {
    const btn = await desk.$$(`button:has-text("${label}")`);
    for (const b of btn) {
      const role = await b.getAttribute("role");
      if (role === "tab" || role === null) {
        await b.click();
        await desk.waitForTimeout(350);
        await shot(desk, `08_usecases_${label.toLowerCase()}`);
        break;
      }
    }
  }
}

// 9. BuiltOn
if (allSections[6]) {
  await allSections[6].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "09_built_on");
}

// 10. Testimonials
if (allSections[7]) {
  await allSections[7].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "10_testimonials");
}

// 11. Blog carousel
const blogSection = await desk.$("#blog");
if (blogSection) {
  await blogSection.scrollIntoViewIfNeeded();
  await desk.waitForTimeout(1200); // wait for WP fetch
  await shot(desk, "11_blog_carousel");

  // scroll carousel right
  const nextBtn = await desk.$('[aria-label="Next"]');
  if (nextBtn) {
    await nextBtn.click();
    await desk.waitForTimeout(500);
    await shot(desk, "11b_blog_carousel_next");
  }
}

// 12. Community section
if (allSections[9]) {
  await allSections[9].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "12_community");
}

// 13. Contact section
if (allSections[10]) {
  await allSections[10].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "13_contact");
}

// 14. Newsletter section
if (allSections[11]) {
  await allSections[11].scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);
  await shot(desk, "14_newsletter");
}

// 15. Footer
await desk.evaluate(() =>
  window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
);
await desk.waitForTimeout(500);
await shot(desk, "15_footer");

// 16. Full page (desktop)
await desk.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await desk.waitForTimeout(300);
await fullShot(desk, "00_full_page_desktop");

// ─── Mobile: key states ────────────────────────────────────────────────────

console.log("\n── Mobile (390px) ──");
const mob = await browser.newPage();
await mob.setViewportSize(MOBILE);
await mob.goto(BASE, { waitUntil: "networkidle" });
await mob.waitForTimeout(800);

await shot(mob, "m01_hero_mobile");

// open hamburger menu
const burger = await mob.$('[aria-label="Toggle menu"]');
if (burger) {
  await burger.click();
  await mob.waitForTimeout(300);
  await shot(mob, "m02_mobile_menu_open");
  await burger.click();
  await mob.waitForTimeout(200);
}

// scroll to stats
const mobSections = await mob.$$("section");
if (mobSections[1]) {
  await mobSections[1].scrollIntoViewIfNeeded();
  await mob.waitForTimeout(400);
  await shot(mob, "m03_stats_mobile");
}

// footer mobile
await mob.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await mob.waitForTimeout(500);
await shot(mob, "m04_footer_mobile");

// full page mobile
await mob.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await mob.waitForTimeout(300);
await fullShot(mob, "m00_full_page_mobile");

// ─── Other pages ───────────────────────────────────────────────────────────

console.log("\n── Other pages ──");
const aboutPage = await browser.newPage();
await aboutPage.setViewportSize(DESKTOP);
await aboutPage.goto(`${BASE}/about`, { waitUntil: "networkidle" });
await aboutPage.waitForTimeout(800);
await fullShot(aboutPage, "page_about");

const blogsPage = await browser.newPage();
await blogsPage.setViewportSize(DESKTOP);
await blogsPage.goto(`${BASE}/blogs`, { waitUntil: "networkidle" });
await blogsPage.waitForTimeout(1500);
await fullShot(blogsPage, "page_blogs");

const restaurantPage = await browser.newPage();
await restaurantPage.setViewportSize(DESKTOP);
await restaurantPage.goto(`${BASE}/my-best-restaurants-search-in-sydney`, {
  waitUntil: "networkidle",
});
await restaurantPage.waitForTimeout(2000);
await fullShot(restaurantPage, "page_restaurants");

await browser.close();
console.log(`\n✅ Done — screenshots saved to ${OUT}/`);
