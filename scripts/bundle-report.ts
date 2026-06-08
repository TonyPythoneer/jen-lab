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
  jsGz: number;
  cssGz: number;
  totalGz: number;
}

const rows: Row[] = readdirSync(DIST)
  .filter((f) => f.endsWith(".html"))
  .map((html) => {
    const text = readFileSync(join(DIST, html), "utf8");
    const assets = new Set<string>();
    for (const match of text.matchAll(ASSET_RE)) assets.add(match[1]!);

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
    return { page: html, jsGz, cssGz, totalGz: jsGz + cssGz };
  })
  .sort((a, b) => b.totalGz - a.totalGz);

// `--json` emits the raw rows so a second build can be diffed against this one
// (see scripts/bundle-diff.ts). Default stays the human-readable table.
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows));
} else {
  const header =
    "Page".padEnd(26) + "JS".padStart(11) + "CSS".padStart(11) + "Total".padStart(11);
  console.log("\nPer-page initial load (gzipped):\n");
  console.log(header);
  console.log("-".repeat(header.length));
  for (const row of rows) {
    console.log(
      row.page.padEnd(26) +
        kb(row.jsGz).padStart(11) +
        kb(row.cssGz).padStart(11) +
        kb(row.totalGz).padStart(11),
    );
  }
}
