// Builds the app once per SFC compiler (plugin-vue vs vize), prints a weight/time
// table, and fails loudly unless every route rendered real content (not an empty shell).
// Usage: jiti scripts/ci/compare-ssg-output.ts

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { runIconCodegen } from "../lib/iconSubset";

const DIST = "dist";

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

type Stats = { html: number; js: number; css: number; buildMs: number };
type Result = { label: string; vize: string } & Stats;

// Run a sub-command, streaming its output. Abort the whole compare on failure —
// a broken build makes the numbers meaningless.
function run(cmd: string, args: string[], extraEnv: Record<string, string> = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...extraEnv } });
  if (res.status !== 0) {
    console.error(`\n✗ \`${cmd} ${args.join(" ")}\` failed (exit ${res.status ?? "signal"})`);
    process.exit(res.status ?? 1);
  }
}

// Every file under dist, recursively (assets are flat, but blog slug pages nest).
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const sumBytes = (files: string[]) => files.reduce((total, f) => total + statSync(f).size, 0);

// Weigh the current dist by output type. Called after each build, before the
// next compiler overwrites dist.
function measure(): Pick<Stats, "html" | "js" | "css"> {
  const all = walk(DIST);
  return {
    html: sumBytes(all.filter((f) => f.endsWith(".html"))),
    js: sumBytes(all.filter((f) => f.endsWith(".js"))),
    css: sumBytes(all.filter((f) => f.endsWith(".css"))),
  };
}

// The content gate: prove every route rendered real content under this compiler.
function assertContent(label: string): string[] {
  const failures: string[] = [];
  for (const page of pages) {
    const path = join(DIST, page.file);
    if (!existsSync(path)) {
      failures.push(`${page.file}: missing`);
      continue;
    }
    const html = readFileSync(path, "utf-8");
    const bytes = Buffer.byteLength(html);
    if (bytes < page.minBytes)
      failures.push(`${page.file}: ${bytes}B < ${page.minBytes}B (looks like an empty shell)`);
    if (!html.includes(page.mustContain))
      failures.push(`${page.file}: missing marker ${page.mustContain} (did not render)`);
  }
  // neon-arc.css is imported through the `~` alias in SectionBlog3D.vue's <script setup>.
  // Confirm it shipped, i.e. the alias resolved under whichever compiler ran.
  const cssDir = join(DIST, "assets");
  const neonShipped =
    existsSync(cssDir) &&
    readdirSync(cssDir)
      .filter((f) => f.endsWith(".css"))
      .some((f) => readFileSync(join(cssDir, f), "utf-8").includes(".neon-arc"));
  if (!neonShipped) failures.push("neon-arc CSS missing (the ~ <script> import did not resolve)");
  if (failures.length) console.log(`  ✗ ${label}: content gate failed`);
  else console.log(`  ✓ ${label}: all routes rendered real content`);
  return failures;
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
const sec = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
// Δ of vize vs vue: negative = vize is smaller / faster (the win we hope for).
const delta = (vue: number, vize: number) => {
  if (vue === 0) return "n/a";
  const pct = ((vize - vue) / vue) * 100;
  return `${pct >= 0 ? "+" : "-"}${Math.abs(pct).toFixed(1)}%`;
};

function printTable(vue: Result, vize: Result) {
  const header = ["Metric", "Vue", "Vize", "Δ vize/vue"];
  const rows = [
    ["HTML", kb(vue.html), kb(vize.html), delta(vue.html, vize.html)],
    ["JS", kb(vue.js), kb(vize.js), delta(vue.js, vize.js)],
    ["CSS", kb(vue.css), kb(vize.css), delta(vue.css, vize.css)],
    ["vite-ssg build", sec(vue.buildMs), sec(vize.buildMs), delta(vue.buildMs, vize.buildMs)],
  ];
  const widths = header.map((_, col) =>
    Math.max(...[header, ...rows].map((r) => (r[col] ?? "").length)),
  );
  // Metric column left-aligned; numeric columns right-aligned (header stays left).
  const renderRow = (cells: string[], isHeader: boolean) =>
    `  ${cells
      .map((c, col) => {
        const w = widths[col] ?? 0;
        return col === 0 || isHeader ? c.padEnd(w) : c.padStart(w);
      })
      .join("   ")}`;

  console.log(`\nSSG output — plugin-vue (stable) vs vize (Rust)\n`);
  console.log(renderRow(header, true));
  console.log(`  ${widths.map((w) => "─".repeat(w)).join("───")}`);
  for (const row of rows) console.log(renderRow(row, false));
}

// Build one compiler, time only its `vite-ssg build`, weigh dist, gate content.
// Each build overwrites dist, so measure immediately, before the next build runs.
function buildAndMeasure(label: string, vize: string): { result: Result; failures: string[] } {
  console.log(`\n→ vite-ssg build with ${label} (VIZE=${vize || "<unset>"})`);
  const start = performance.now();
  run("pnpm", ["exec", "vite-ssg", "build"], { VIZE: vize });
  const buildMs = performance.now() - start;
  const stats = measure();
  const failures = assertContent(label).map((f) => `[${label}] ${f}`);
  return { result: { label, vize, ...stats, buildMs }, failures };
}

// --- preflight: VIZE-invariant, run once, not timed --------------------------
console.log("→ preflight: icon codegen + velite build (output does not depend on VIZE)");
const icons = runIconCodegen();
if (icons.missing.length) {
  console.error(
    `[compare:ssg] referenced icons missing from their pack: ${icons.missing.join(", ")}`,
  );
  process.exit(1);
}
run("pnpm", ["exec", "velite", "build", "--strict"]);

// --- build + measure each compiler (VIZE="" → plugin-vue; "true" → vize) ------
const vue = buildAndMeasure("Vue", "");
const vize = buildAndMeasure("Vize", "true");

printTable(vue.result, vize.result);

const allFailures = [...vue.failures, ...vize.failures];
if (allFailures.length > 0) {
  console.error("\nSSG content gate FAILED:");
  for (const f of allFailures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nSSG content gate passed — both compilers rendered real content.");
