// Verify the prerendered SSG output is real content, not an empty shell.
//
// WHY: a broken SFC compiler can still exit 0 while every page collapses to a
// ~957-byte shell with an empty <div id="app">. We hit exactly this when vize's
// CJS-interop duplicated vue-router and broke provide/inject in SSR. A green build
// is NOT proof the pages rendered. This gate reads the built HTML and fails loudly
// when content is missing, so the VIZE feature flag can't regress silently.
//
// Usage: jiti scripts/ci/assert-ssg-output.ts [distDir]   (distDir defaults to "dist")

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = process.argv[2] ?? "dist";

// Each prerendered route + the proof it actually rendered.
// minBytes catches the empty shell; mustContain proves real app content, not just bytes.
const pages = [
  { file: "index.html", minBytes: 8000, mustContain: 'href="/jen-knows"' },
  { file: "jen-knows.html", minBytes: 8000, mustContain: 'href="/jen-knows"' },
  { file: "jen-liu.html", minBytes: 8000, mustContain: 'href="/jen-knows"' },
  { file: "blogs.html", minBytes: 8000, mustContain: 'href="/jen-knows"' },
  // food-map uses layout:false (no nav) + a ClientOnly Leaflet stage, so it is tiny
  // by design. Its proof is the page root div, which is absent when SSR crashes.
  { file: "sydney-food-map.html", minBytes: 900, mustContain: 'class="food-map-page"' },
];

const failures: string[] = [];

for (const page of pages) {
  const path = join(DIST, page.file);
  if (!existsSync(path)) {
    failures.push(`${page.file}: missing`);
    console.log(`  ✗ ${page.file.padEnd(22)} missing`);
    continue;
  }
  const html = readFileSync(path, "utf-8");
  const bytes = Buffer.byteLength(html);
  const tooSmall = bytes < page.minBytes;
  const noMarker = !html.includes(page.mustContain);
  if (tooSmall)
    failures.push(`${page.file}: ${bytes}B < ${page.minBytes}B (looks like an empty shell)`);
  if (noMarker) failures.push(`${page.file}: missing marker ${page.mustContain} (did not render)`);
  console.log(`  ${tooSmall || noMarker ? "✗" : "✓"} ${page.file.padEnd(22)} ${bytes}B`);
}

// neon-arc.css is imported through the `~` alias in SectionBlog3D.vue's <script setup>.
// Confirm it shipped, i.e. the alias resolved under whichever compiler ran.
const cssDir = join(DIST, "assets");
const neonShipped =
  existsSync(cssDir) &&
  readdirSync(cssDir)
    .filter((f) => f.endsWith(".css"))
    .some((f) => readFileSync(join(cssDir, f), "utf-8").includes(".neon-arc"));
console.log(`  ${neonShipped ? "✓" : "✗"} neon-arc CSS (~ alias import)`);
if (!neonShipped) failures.push("neon-arc CSS missing (the ~ <script> import did not resolve)");

if (failures.length > 0) {
  console.error("\nSSG output check FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nSSG output check passed — all routes rendered real content.");
