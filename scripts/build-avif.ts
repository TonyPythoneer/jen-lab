// Generates AVIF siblings for the site's content images and a manifest of which
// ones won.
//
// WHY: the gallery / product / hero images are authored as .webp in public/.
// AVIF is typically 20-30% smaller, but not always — tiny images can come out
// larger. So we convert, KEEP the .avif only when it actually beats the .webp,
// and record the winners in a manifest. The <Picture> component reads that
// manifest and only emits an <picture><source type="image/avif"> when a real,
// smaller .avif exists — so the browser never fetches a missing or worse file.
//
// Run via `pnpm gen:avif`. Re-run after adding/replacing images. Output (.avif
// files + manifest) is committed so the deploy doesn't need sharp.
import { writeFileSync, readdirSync, statSync, existsSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
// @ts-ignore — sharp's package.json "exports" hides its bundled types from tsc
import sharp from "sharp";

const PUBLIC_DIR = "public";
// Committed (not under generated/) so the deploy build needs neither sharp nor a
// gen step — <Picture> imports this list directly. Re-run `pnpm gen:avif` after
// changing images; commit the new .avif files and this manifest together.
const MANIFEST = "src/lib/avifManifest.json";
// Below this, AVIF's win is marginal and its encode cost / larger-than-webp risk
// isn't worth it (avatars, tiny portraits). Convert only the heavy content set.
const MIN_BYTES = 40 * 1024;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (path.endsWith(".webp")) out.push(path);
  }
  return out;
}

const winners: string[] = [];
let converted = 0;
let skippedLarger = 0;

for (const webp of walk(PUBLIC_DIR)) {
  if (statSync(webp).size < MIN_BYTES) continue;
  const avif = webp.replace(/\.webp$/, ".avif");
  // Incremental: reuse an up-to-date .avif rather than re-encoding every run.
  const fresh = existsSync(avif) && statSync(avif).mtimeMs >= statSync(webp).mtimeMs;
  if (!fresh) {
    await sharp(webp).avif({ quality: 55, effort: 4 }).toFile(avif);
    converted++;
  }
  // Keep the .avif only if it's actually smaller than the source .webp.
  if (statSync(avif).size < statSync(webp).size) {
    // Manifest holds the PUBLIC URL of the .webp (leading slash, posix).
    winners.push("/" + relative(PUBLIC_DIR, webp).split("\\").join("/"));
  } else {
    rmSync(avif);
    skippedLarger++;
  }
}

writeFileSync(MANIFEST, JSON.stringify(winners.sort(), null, 2) + "\n");
console.log(
  `[avif] ${winners.length} webp have a smaller .avif (encoded ${converted}, dropped ${skippedLarger} larger) → ${MANIFEST}`,
);
