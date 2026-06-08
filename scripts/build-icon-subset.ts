// Builds a small lucide icon collection holding only the icons the site uses.
//
// WHY: main.ts bundles the lucide collection so icons render in the prerendered
// SSG HTML. The full pack is ~543 KB / 1774 icons, but the site uses ~23. This
// scans the source for `i-lucide-*` names and writes a subset, cutting the main
// bundle by roughly half. Any icon the scan misses still renders — the Icon
// component's @iconify/vue render falls back to the Iconify CDN at runtime.
//
// Runs before `velite build` / `vp dev` (see package.json). Output is generated,
// so it lives under generated/ (gitignored).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const LUCIDE_PACK = "node_modules/@iconify-json/lucide/icons.json";
const OUT_DIR = "generated/icons";
const OUT_FILE = join(OUT_DIR, "lucide.json");
const SCAN_DIRS = ["app", "content"];
const SCAN_EXT = /\.(vue|ts|md|ya?ml|json)$/;
const ICON_RE = /i-lucide-([a-z0-9-]+)/g;

// Collect every `i-lucide-<name>` referenced in the source.
const used = new Set<string>();
for (const dir of SCAN_DIRS) {
  for (const rel of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    const path = join(dir, rel);
    if (!SCAN_EXT.test(path) || !statSync(path).isFile()) continue;
    for (const match of readFileSync(path, "utf8").matchAll(ICON_RE)) used.add(match[1]!);
  }
}

// Pull each used name out of the full pack. Lucide ships some names as aliases
// (a pointer to a parent icon), so resolve those and keep the parent too.
const full = JSON.parse(readFileSync(LUCIDE_PACK, "utf8"));
const icons: Record<string, unknown> = {};
const aliases: Record<string, unknown> = {};
const missing: string[] = [];
for (const name of used) {
  if (full.icons[name]) {
    icons[name] = full.icons[name];
  } else if (full.aliases?.[name]) {
    aliases[name] = full.aliases[name];
    const parent = full.aliases[name].parent;
    if (full.icons[parent]) icons[parent] = full.icons[parent];
  } else {
    missing.push(name);
  }
}

const subset = { ...full, icons, aliases };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(subset));

console.log(
  `[icons] lucide subset: ${Object.keys(icons).length} of ${Object.keys(full.icons).length} icons → ${OUT_FILE}`,
);
if (missing.length) {
  console.warn(`[icons] not found in lucide (these CDN-load at runtime): ${missing.join(", ")}`);
}
