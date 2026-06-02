import { readFileSync } from "node:fs";

const MARKERS = ["✨", "🌎"];

export function extractWranglerSummary(log: string): string {
  return log
    .split("\n")
    .map((line) => line.trimStart())
    .filter((line) => MARKERS.some((marker) => line.startsWith(marker)))
    .join("\n");
}

// CLI: `node --experimental-strip-types scripts/github/wrangler-summary.ts <logfile>`
// Prints the extracted summary to stdout.
if (process.argv[1]?.endsWith("wrangler-summary.ts")) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: wrangler-summary.ts <logfile>");
    process.exit(1);
  }
  process.stdout.write(extractWranglerSummary(readFileSync(path, "utf8")));
}
