// Builds per-pack icon subsets with only the icons the site references. Icon.vue
// renders OFFLINE (a missing icon is blank), so callers must FAIL loudly on missing.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fingerprint, isFresh, saveCache } from "./codegenCache";

export const OUT_DIR = "generated/icons";
const SCAN_DIRS = ["src", "content"];
const SCAN_EXT = /\.(vue|ts|md|ya?ml|json)$/;

// Each pack: the iconify prefix as written in `i-<prefix>-<name>`, and its data
// file. Keep this list in sync with the prefixes Icon.vue knows how to parse.
const PACKS = [
  { prefix: "lucide", pack: "node_modules/@iconify-json/lucide/icons.json" },
  { prefix: "simple-icons", pack: "node_modules/@iconify-json/simple-icons/icons.json" },
  {
    prefix: "streamline-freehand",
    pack: "node_modules/@iconify-json/streamline-freehand/icons.json",
  },
];

// The files this module writes — used by the cache to confirm outputs still
// exist before trusting a fingerprint hit.
export const OUTPUT_FILES = PACKS.map(({ prefix }) => join(OUT_DIR, `${prefix}.json`));

export interface IconScan {
  // prefix → the icon names referenced for that pack
  used: Map<string, Set<string>>;
  // changes only when the referenced icons or the source packs change
  fingerprint: string;
}

// Scan src/ + content/ for `i-<prefix>-<name>` references. The fingerprint folds
// in each pack's size+mtime, so a pack upgrade also busts the cache.
export function scanUsedIcons(): IconScan {
  const sources: string[] = [];
  for (const dir of SCAN_DIRS) {
    for (const rel of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
      const path = join(dir, rel);
      if (SCAN_EXT.test(path) && statSync(path).isFile()) sources.push(readFileSync(path, "utf8"));
    }
  }
  const allText = sources.join("\n");

  const used = new Map<string, Set<string>>();
  const packStamps: string[] = [];
  for (const { prefix, pack } of PACKS) {
    // Icon.vue accepts both the hyphen form (i-lucide-x) and the colon form
    // (i-streamline-freehand:foo), so match either separator after the prefix.
    const re = new RegExp(`i-${prefix}[-:]([a-z0-9-]+)`, "g");
    const names = new Set<string>();
    for (const match of allText.matchAll(re)) names.add(match[1]!);
    used.set(prefix, names);
    const stat = statSync(pack);
    packStamps.push(`${prefix}:${stat.size}:${stat.mtimeMs}`);
  }

  const tokens = [...used].map(([prefix, names]) => `${prefix}:${[...names].sort().join(",")}`);
  return { used, fingerprint: fingerprint(tokens, packStamps) };
}

export interface IconWrite {
  written: { prefix: string; count: number; total: number; changed: boolean }[];
  missing: string[];
}

// Write each subset only when its content changed — a no-op run must not churn
// the file and trigger a needless dev reload of main.ts's static JSON import.
export function writeIconSubsets(used: Map<string, Set<string>>): IconWrite {
  mkdirSync(OUT_DIR, { recursive: true });
  const written: IconWrite["written"] = [];
  const missing: string[] = [];

  for (const { prefix, pack } of PACKS) {
    const names = used.get(prefix) ?? new Set<string>();
    const full = JSON.parse(readFileSync(pack, "utf8"));
    const icons: Record<string, unknown> = {};
    const aliases: Record<string, unknown> = {};
    for (const name of names) {
      if (full.icons[name]) {
        icons[name] = full.icons[name];
      } else if (full.aliases?.[name]) {
        // Some packs ship names as aliases (a pointer to a parent icon), so
        // resolve those and keep the parent too.
        aliases[name] = full.aliases[name];
        const parent = full.aliases[name].parent;
        if (full.icons[parent]) icons[parent] = full.icons[parent];
      } else {
        missing.push(`${prefix}:${name}`);
      }
    }

    const outFile = join(OUT_DIR, `${prefix}.json`);
    const next = JSON.stringify({ ...full, icons, aliases });
    const changed = !existsSync(outFile) || readFileSync(outFile, "utf8") !== next;
    if (changed) writeFileSync(outFile, next);
    written.push({
      prefix,
      count: Object.keys(icons).length,
      total: Object.keys(full.icons).length,
      changed,
    });
  }

  return { written, missing };
}

export const CACHE_NAME = "icons";

export interface IconCodegen {
  regenerated: boolean;
  written: IconWrite["written"];
  missing: string[];
}

// Cached generate: scan → skip on fresh fingerprint → write changed subsets.
// Missing icons are returned, not thrown — each caller fails its own way.
export function runIconCodegen(): IconCodegen {
  const { used, fingerprint: fp } = scanUsedIcons();
  if (isFresh(CACHE_NAME, fp, OUTPUT_FILES)) {
    return { regenerated: false, written: [], missing: [] };
  }
  const { written, missing } = writeIconSubsets(used);
  if (!missing.length) saveCache(CACHE_NAME, fp);
  return { regenerated: true, written, missing };
}
