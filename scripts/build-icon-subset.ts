// Builds small icon collections holding only the icons the site uses.
//
// WHY: Icon.vue renders through @iconify/vue's OFFLINE entry (no CDN runtime),
// so every referenced icon MUST be bundled — a missing one renders blank, there
// is no network fallback. This scans the source for `i-<prefix>-<name>` and
// writes one subset per pack that main.ts addCollection()s. The full packs are
// large (lucide ~1774 icons, simple-icons ~3300); the site uses ~30, so the
// subsets are tiny. The build FAILS if a referenced icon isn't in its pack, so a
// typo can't ship as an invisible gap.
//
// Runs before `velite build` / `vp dev` (see package.json). Output is generated,
// so it lives under generated/ (gitignored).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "generated/icons";
const SCAN_DIRS = ["src", "content"];
const SCAN_EXT = /\.(vue|ts|md|ya?ml|json)$/;

// Each pack: the iconify prefix as written in `i-<prefix>-<name>`, and its data
// file. Keep this list in sync with the prefixes Icon.vue knows how to parse.
const PACKS = [
  { prefix: "lucide", pack: "node_modules/@iconify-json/lucide/icons.json" },
  { prefix: "simple-icons", pack: "node_modules/@iconify-json/simple-icons/icons.json" },
];

// Read every scannable source file once, then match each pack against the lot.
const sources: string[] = [];
for (const dir of SCAN_DIRS) {
  for (const rel of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    const path = join(dir, rel);
    if (SCAN_EXT.test(path) && statSync(path).isFile()) sources.push(readFileSync(path, "utf8"));
  }
}
const allText = sources.join("\n");

mkdirSync(OUT_DIR, { recursive: true });
const missing: string[] = [];

for (const { prefix, pack } of PACKS) {
  // Collect every `i-<prefix>-<name>` referenced in the source.
  const re = new RegExp(`i-${prefix}-([a-z0-9-]+)`, "g");
  const used = new Set<string>();
  for (const match of allText.matchAll(re)) used.add(match[1]!);

  // Pull each used name out of the full pack. Some packs ship names as aliases
  // (a pointer to a parent icon), so resolve those and keep the parent too.
  const full = JSON.parse(readFileSync(pack, "utf8"));
  const icons: Record<string, unknown> = {};
  const aliases: Record<string, unknown> = {};
  for (const name of used) {
    if (full.icons[name]) {
      icons[name] = full.icons[name];
    } else if (full.aliases?.[name]) {
      aliases[name] = full.aliases[name];
      const parent = full.aliases[name].parent;
      if (full.icons[parent]) icons[parent] = full.icons[parent];
    } else {
      missing.push(`${prefix}:${name}`);
    }
  }

  const subset = { ...full, icons, aliases };
  const outFile = join(OUT_DIR, `${prefix}.json`);
  writeFileSync(outFile, JSON.stringify(subset));
  console.log(
    `[icons] ${prefix}: ${Object.keys(icons).length} of ${Object.keys(full.icons).length} icons → ${outFile}`,
  );
}

// Offline rendering has NO CDN fallback, so a missing icon is an invisible gap.
// Fail the build loudly rather than ship blanks.
if (missing.length) {
  console.error(`[icons] referenced icons missing from their pack: ${missing.join(", ")}`);
  process.exit(1);
}
