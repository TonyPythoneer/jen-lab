// Reports the initial download weight of each prerendered page.
//
// Each dist/<route>.html lists the JS and CSS it loads up front (the entry
// script, its modulepreload links, and stylesheets). Summing those files —
// raw and gzipped — gives the real "what does this page cost" number, per page.
//
// Run after `pnpm build`. Used locally and in CI (see .github/workflows).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "dist";
const ASSET_RE = /(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g;

const kb = (bytes: number) => (bytes / 1024).toFixed(1) + " KB";

interface Row {
  page: string;
  htmlGz: number; // the prerendered .html document itself
  jsGz: number;
  cssGz: number;
  totalGz: number; // JS + CSS (assets) — kept separate from HTML on purpose
}

const rows: Row[] = readdirSync(DIST)
  .filter((f) => f.endsWith(".html"))
  .map((html) => {
    const buf = readFileSync(join(DIST, html));
    const htmlGz = gzipSync(buf).length;
    const assets = new Set<string>();
    for (const match of buf.toString("utf8").matchAll(ASSET_RE)) assets.add(match[1]!);

    let jsGz = 0;
    let cssGz = 0;
    for (const asset of assets) {
      const path = join(DIST, asset);
      let gz: number;
      try {
        gz = gzipSync(readFileSync(path)).length;
      } catch {
        continue; // referenced asset missing — skip rather than crash the report
      }
      if (asset.endsWith(".css")) cssGz += gz;
      else jsGz += gz;
    }
    return { page: html, htmlGz, jsGz, cssGz, totalGz: jsGz + cssGz };
  })
  .sort((a, b) => b.totalGz - a.totalGz);

// `--json` emits the raw rows so a second build can be diffed against this one
// (see scripts/github/bundle-diff.ts). Default stays the human-readable table.
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows));
} else {
  const name = (p: string) => p.replace(/\.html$/, "");
  const sum = (k: "htmlGz" | "jsGz" | "cssGz" | "totalGz") => rows.reduce((a, r) => a + r[k], 0);

  const NAME = 18;
  const col = (s: string) => s.padStart(11);
  const head = "Page".padEnd(NAME) + col("HTML") + col("JS") + col("CSS") + col("JS+CSS");
  const rule = "─".repeat(head.length);

  console.log("");
  console.log(head);
  console.log(rule);
  for (const row of rows) {
    console.log(
      name(row.page).padEnd(NAME) +
        col(kb(row.htmlGz)) +
        col(kb(row.jsGz)) +
        col(kb(row.cssGz)) +
        col(kb(row.totalGz)),
    );
  }
  console.log(rule);
  console.log(
    "Total".padEnd(NAME) +
      col(kb(sum("htmlGz"))) +
      col(kb(sum("jsGz"))) +
      col(kb(sum("cssGz"))) +
      col(kb(sum("totalGz"))),
  );
}
