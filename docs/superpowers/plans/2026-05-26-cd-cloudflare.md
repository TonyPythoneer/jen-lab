# CD Cloudflare Pages Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions workflow that deploys to Cloudflare Pages when a PR is merged into `main`/`develop`, and posts the wrangler deployment summary back to the PR.

**Architecture:** The noisy `pnpm deploy` log is parsed by a small, unit-tested TypeScript module (`scripts/wrangler-summary.ts`) that keeps only the wrangler marker lines. The workflow runs deploy → extracts the summary to a file → upserts a PR comment via `actions/github-script`.

**Tech Stack:** GitHub Actions, pnpm, wrangler (Cloudflare Pages), Node 24 (`--experimental-strip-types`), Vitest (`vite-plus/test`).

---

## File Structure

- Create: `scripts/wrangler-summary.ts` — pure `extractWranglerSummary(log)` function + a CLI entry that reads a log file path from argv and prints the summary to stdout. One responsibility: turn a raw deploy log into the comment body.
- Create: `tests/wrangler-summary.test.ts` — unit tests for `extractWranglerSummary`.
- Create: `.github/workflows/cd-cloudflare.yml` — the workflow. Mirrors `.github/workflows/ci.yml` for the setup steps.

---

## Task 1: Wrangler summary extraction module

**Files:**

- Create: `scripts/wrangler-summary.ts`
- Test: `tests/wrangler-summary.test.ts`

Extraction rule: keep every line whose first non-whitespace character is `✨`
or `🌎`. In the wrangler output those are the "Compiled / Uploading /
Deploying / Deployment complete / alias URL" lines, including the two
`*.pages.dev` URLs. Everything else (the `nuxt build` noise) is dropped.

- [ ] **Step 1: Write the failing test**

Create `tests/wrangler-summary.test.ts`:

```ts
import { describe, it, expect } from "vite-plus/test";
import { extractWranglerSummary } from "../scripts/wrangler-summary.ts";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../scripts/wrangler-summary.ts` / `extractWranglerSummary` is not a function.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/wrangler-summary.ts`:

```ts
import { readFileSync } from "node:fs";

const MARKERS = ["✨", "🌎"];

export function extractWranglerSummary(log: string): string {
  return log
    .split("\n")
    .filter((line) => {
      const trimmed = line.trimStart();
      return MARKERS.some((marker) => trimmed.startsWith(marker));
    })
    .map((line) => line.trimStart())
    .join("\n");
}

// CLI: `node --experimental-strip-types scripts/wrangler-summary.ts <logfile>`
// Prints the extracted summary to stdout.
if (process.argv[1]?.endsWith("wrangler-summary.ts")) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: wrangler-summary.ts <logfile>");
    process.exit(1);
  }
  process.stdout.write(extractWranglerSummary(readFileSync(path, "utf8")));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS (3 tests in `tests/wrangler-summary.test.ts`).

- [ ] **Step 5: Verify the CLI entry works end-to-end**

Run:

```bash
printf 'noise\n\xe2\x9c\xa8 Deployment complete! https://x.jen-lab.pages.dev\n' > /tmp/deploy.log
node --experimental-strip-types scripts/wrangler-summary.ts /tmp/deploy.log
```

Expected stdout: `✨ Deployment complete! https://x.jen-lab.pages.dev`

- [ ] **Step 6: Run full check**

Run: `pnpm check`
Expected: PASS (lint + format + typecheck clean).

- [ ] **Step 7: Commit**

```bash
git add scripts/wrangler-summary.ts tests/wrangler-summary.test.ts
git commit -m "feat(scripts): add wrangler deploy summary extractor"
```

---

## Task 2: The cd-cloudflare workflow

**Files:**

- Create: `.github/workflows/cd-cloudflare.yml`
- Reference (do not modify): `.github/workflows/ci.yml` for setup-step style.

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/cd-cloudflare.yml`:

```yaml
# Deploys to Cloudflare Pages when a PR is merged into main or develop,
# then posts the wrangler deployment summary back to the PR.
#
# REQUIRED REPO SECRETS (Settings -> Secrets and variables -> Actions):
#   CLOUDFLARE_API_TOKEN   token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Both are read automatically by wrangler from the environment.

name: CD Cloudflare

on:
  pull_request:
    types: [closed]
    branches: [main, develop]

permissions:
  contents: read
  pull-requests: write

jobs:
  deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11.0.3

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - id: deploy
        run: pnpm deploy 2>&1 | tee deploy.log
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Extract wrangler summary
        if: always()
        run: node --experimental-strip-types scripts/wrangler-summary.ts deploy.log > wrangler-summary.txt || true

      - name: Upsert PR comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require("node:fs");
            const marker = "<!-- cd-cloudflare -->";
            const success = "${{ steps.deploy.outcome }}" === "success";
            const runUrl =
              `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}` +
              `/actions/runs/${context.runId}`;

            let summary = "";
            try {
              summary = fs.readFileSync("wrangler-summary.txt", "utf8").trim();
            } catch {}

            const body = success
              ? `${marker}\n\`\`\`\n${summary || "Deployed."}\n\`\`\``
              : `${marker}\n❌ Cloudflare Pages deploy failed. ` +
                `See the [workflow run](${runUrl}).`;

            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
            });
            const existing = comments.find((c) => c.body?.includes(marker));

            if (existing) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: existing.id,
                body,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                body,
              });
            }
```

- [ ] **Step 2: Verify the workflow YAML parses**

Run:

```bash
node --experimental-strip-types -e "import('node:fs').then(fs=>import('yaml').then(y=>{y.parse(fs.readFileSync('.github/workflows/cd-cloudflare.yml','utf8'));console.log('YAML OK')}))"
```

Expected stdout: `YAML OK` (no parse error).

- [ ] **Step 3: Sanity-check key invariants by reading the file**

Confirm by reading `.github/workflows/cd-cloudflare.yml`:

- `on.pull_request.types` is `[closed]` and `branches` is `[main, develop]`.
- The job has `if: github.event.pull_request.merged == true`.
- `permissions.pull-requests` is `write`.
- The deploy step id is `deploy`; the comment step references `steps.deploy.outcome`.
- Extract + comment steps both have `if: always()`.
- The secrets note block is at the top of the file.

Expected: all present.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/cd-cloudflare.yml
git commit -m "feat(ci): add cd-cloudflare deploy-and-comment workflow"
```

---

## Notes on verification limits

The workflow cannot be fully exercised locally — `pull_request` triggers,
repo secrets, and PR comment APIs only run on GitHub. End-to-end verification
happens on the first real merged PR. Local checks are limited to: the
extraction module's unit tests (Task 1) and YAML parse + invariant read
(Task 2).
