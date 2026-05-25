import { describe, it, expect } from "vite-plus/test";
import { extractWranglerSummary } from "../scripts/wrangler-summary";

const SAMPLE_LOG = `> jen-lab@ deploy
> npm run build && wrangler pages deploy

Nuxt 4.4.4 with Nitro
✔ Client built in 4200ms
ℹ Building Nitro server
✔ Nitro server built
✨ Compiled Worker successfully
✨ Uploading Worker bundle
✨ Uploading _routes.json
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://6c88162a.jen-lab.pages.dev
✨ Deployment alias URL: https://chore-cleanup.jen-lab.pages.dev`;

describe("extractWranglerSummary", () => {
  it("keeps only the wrangler marker lines", () => {
    expect(extractWranglerSummary(SAMPLE_LOG)).toBe(
      [
        "✨ Compiled Worker successfully",
        "✨ Uploading Worker bundle",
        "✨ Uploading _routes.json",
        "🌎 Deploying...",
        "✨ Deployment complete! Take a peek over at https://6c88162a.jen-lab.pages.dev",
        "✨ Deployment alias URL: https://chore-cleanup.jen-lab.pages.dev",
      ].join("\n"),
    );
  });

  it("ignores leading whitespace before a marker", () => {
    expect(extractWranglerSummary("  ✨ Indented line\nplain line")).toBe("✨ Indented line");
  });

  it("returns an empty string when there are no marker lines", () => {
    expect(extractWranglerSummary("just\nbuild\noutput")).toBe("");
  });
});
