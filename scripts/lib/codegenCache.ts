// Tiny fingerprint cache for codegen steps, so a generator can skip its work
// when nothing it depends on has changed since the last run.
//
// The cache lives under node_modules/.cache/ (gitignored, the conventional spot
// alongside vite's own .vite cache). A miss is always safe — it just regenerates.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const CACHE_DIR = "node_modules/.cache/codegen";

// Stable hash of any inputs. Pass the things that decide the output (config,
// file sizes/mtimes, scanned tokens) — when this string is unchanged, the
// output would be identical, so the run can be skipped.
export function fingerprint(...parts: unknown[]): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

// Fresh = the saved fingerprint matches AND every output file still exists.
// A matching fingerprint with a deleted output must still regenerate, so the
// outputs check guards against someone wiping generated/ or public/fonts/.
export function isFresh(name: string, fp: string, outputs: string[] = []): boolean {
  const file = join(CACHE_DIR, `${name}.json`);
  if (!existsSync(file)) return false;
  if (outputs.some((out) => !existsSync(out))) return false;
  try {
    return JSON.parse(readFileSync(file, "utf8")).fingerprint === fp;
  } catch {
    return false; // unreadable / corrupt cache → treat as a miss
  }
}

export function saveCache(name: string, fp: string): void {
  const file = join(CACHE_DIR, `${name}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ fingerprint: fp }) + "\n");
}
