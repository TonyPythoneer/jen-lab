// Fingerprint cache for codegen steps: skip the work when inputs are unchanged.
// Lives in node_modules/.cache/; a miss is always safe — it just regenerates.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const CACHE_DIR = "node_modules/.cache/codegen";

// Stable hash of whatever decides the output — same string means the run can be skipped.
export function fingerprint(...parts: unknown[]): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

// Fresh = fingerprint matches AND every output still exists — wiping generated/
// or public/fonts/ must trigger a regenerate even with a matching fingerprint.
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
