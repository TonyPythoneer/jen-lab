# Cloudflare Cleanup Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three GitHub Actions that clean up Cloudflare Pages deployments (auto on merge, weekly cron, on-demand command), backed by one shared tested script, and group all CI scripts under `scripts/github/`.

**Architecture:** Thin workflows call a single pure TypeScript planner (`planCleanup` + `renderReport`). The merge-time workflow reuses the existing per-branch filter. The cron and command workflows share the global "keep newest main + develop, delete everything else" planner and a fixed report message.

**Tech Stack:** GitHub Actions, `actions/github-script@v7`, wrangler (Cloudflare Pages CLI), Node 24 `--experimental-strip-types`, pnpm, Vitest.

---

## File Structure

**Move (CI-only scripts → new folder):**

- `scripts/preview-deployment-ids.ts` → `scripts/github/preview-deployment-ids.ts`
- `scripts/wrangler-summary.ts` → `scripts/github/wrangler-summary.ts`

**Create:**

- `scripts/github/cleanup-deployments.ts` — pure `planCleanup` + `renderReport` + CLI.
- `scripts/github/cleanup-deployments.test.ts` — Vitest unit tests.
- `.github/workflows/cd-cloudflare-cleanup.yml` — delete merged branch's previews.
- `.github/workflows/cronjob-cloudflare-cleanup.yml` — weekly global prune → issue.
- `.github/workflows/cmd-cloudflare-cleanup.yml` — `/all-cleanup` global prune → comment.

**Modify:**

- `.github/workflows/cmd-delete-preview.yml` — script path.
- `.github/workflows/cd-cloudflare.yml` — script path.
- `.github/workflows/cmd-preview.yml` — script path.
- `.github/workflows/pr-command-guide.yml` — add `/all-cleanup` bullet.

---

## Task 1: Move CI scripts into `scripts/github/`

**Files:**

- Move: `scripts/preview-deployment-ids.ts` → `scripts/github/preview-deployment-ids.ts`
- Move: `scripts/wrangler-summary.ts` → `scripts/github/wrangler-summary.ts`
- Modify: `.github/workflows/cmd-delete-preview.yml:61`
- Modify: `.github/workflows/cd-cloudflare.yml:46`
- Modify: `.github/workflows/cmd-preview.yml:73`

- [ ] **Step 1: Create the folder and move the two scripts with git**

```bash
mkdir -p scripts/github
git mv scripts/preview-deployment-ids.ts scripts/github/preview-deployment-ids.ts
git mv scripts/wrangler-summary.ts scripts/github/wrangler-summary.ts
```

- [ ] **Step 2: Update the path in `cmd-delete-preview.yml`**

In `.github/workflows/cmd-delete-preview.yml`, change line 61 from:

```
          node --experimental-strip-types scripts/preview-deployment-ids.ts deployments.json "$BRANCH" > ids.txt || true
```

to:

```
          node --experimental-strip-types scripts/github/preview-deployment-ids.ts deployments.json "$BRANCH" > ids.txt || true
```

- [ ] **Step 3: Update the path in `cd-cloudflare.yml`**

In `.github/workflows/cd-cloudflare.yml`, change line 46 from:

```
        run: node --experimental-strip-types scripts/wrangler-summary.ts deploy.log > wrangler-summary.txt || true
```

to:

```
        run: node --experimental-strip-types scripts/github/wrangler-summary.ts deploy.log > wrangler-summary.txt || true
```

- [ ] **Step 4: Update the path in `cmd-preview.yml`**

In `.github/workflows/cmd-preview.yml`, change line 73 from:

```
        run: node --experimental-strip-types scripts/wrangler-summary.ts deploy.log > wrangler-summary.txt || true
```

to:

```
        run: node --experimental-strip-types scripts/github/wrangler-summary.ts deploy.log > wrangler-summary.txt || true
```

- [ ] **Step 5: Verify no stale references remain**

Run: `grep -rn "scripts/preview-deployment-ids.ts\|scripts/wrangler-summary.ts" .github`
Expected: no output (all references now use `scripts/github/...`).

- [ ] **Step 6: Verify the moved CLIs still self-detect**

Run: `node --experimental-strip-types scripts/github/preview-deployment-ids.ts`
Expected: prints `usage: preview-deployment-ids.ts <json-file> <branch>` and exits non-zero (the filename-based CLI guard still fires after the move).

- [ ] **Step 7: Commit**

```bash
git add scripts/github .github/workflows/cmd-delete-preview.yml .github/workflows/cd-cloudflare.yml .github/workflows/cmd-preview.yml
git commit -m "refactor(ci): group CI scripts under scripts/github/"
```

---

## Task 2: Shared planner `scripts/github/cleanup-deployments.ts`

**Files:**

- Create: `scripts/github/cleanup-deployments.ts`
- Test: `scripts/github/cleanup-deployments.test.ts`

- [ ] **Step 1: Write the failing test**

Create `scripts/github/cleanup-deployments.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { planCleanup, renderReport } from "./cleanup-deployments";

function dep(id: string, branch: string, createdOn: string) {
  return {
    id,
    created_on: createdOn,
    deployment_trigger: { metadata: { branch } },
  };
}

describe("planCleanup", () => {
  it("keeps only the newest deployment of a protected branch", () => {
    const deployments = [
      dep("m1", "main", "2026-01-01T00:00:00Z"),
      dep("m2", "main", "2026-02-01T00:00:00Z"),
      dep("m3", "main", "2026-03-01T00:00:00Z"),
    ];
    const { toDelete, report } = planCleanup(deployments, ["main", "develop"]);
    expect([...toDelete].sort()).toEqual(["m1", "m2"]);
    const main = report.rows.find((r) => r.branch === "main")!;
    expect(main.kept).toBe(1);
    expect(main.keptId).toBe("m3");
    expect(main.deleted).toBe(2);
  });

  it("deletes all deployments of a non-protected branch", () => {
    const deployments = [
      dep("f1", "feat/foo", "2026-01-01T00:00:00Z"),
      dep("f2", "feat/foo", "2026-02-01T00:00:00Z"),
    ];
    const { toDelete } = planCleanup(deployments, ["main", "develop"]);
    expect([...toDelete].sort()).toEqual(["f1", "f2"]);
  });

  it("handles empty input", () => {
    const { toDelete, report } = planCleanup([], ["main", "develop"]);
    expect(toDelete).toEqual([]);
    expect(report.total).toBe(0);
    expect(report.deletedCount).toBe(0);
  });

  it("does not throw on missing created_on or branch", () => {
    const deployments = [
      { id: "x1" },
      { id: "x2", deployment_trigger: { metadata: { branch: "main" } } },
    ];
    const { toDelete, report } = planCleanup(deployments, ["main"]);
    expect(toDelete).toEqual(["x1"]);
    expect(report.deletedCount).toBe(1);
  });

  it("reports correct totals and counts", () => {
    const deployments = [
      dep("m1", "main", "2026-01-01T00:00:00Z"),
      dep("m2", "main", "2026-02-01T00:00:00Z"),
      dep("d1", "develop", "2026-01-01T00:00:00Z"),
      dep("f1", "feat/foo", "2026-01-01T00:00:00Z"),
    ];
    const { report } = planCleanup(deployments, ["main", "develop"]);
    expect(report.total).toBe(4);
    expect(report.deletedCount).toBe(2);
  });
});

describe("renderReport", () => {
  it("renders the fixed message format", () => {
    const deployments = [
      dep("m1", "main", "2026-01-01T00:00:00Z"),
      dep("m2", "main", "2026-02-01T00:00:00Z"),
      dep("f1", "feat/foo", "2026-01-01T00:00:00Z"),
    ];
    const { report } = planCleanup(deployments, ["main", "develop"]);
    const md = renderReport(report);
    expect(md).toContain("You had a total of **3** deployments");
    expect(md).toContain("So, we have deleted **2** deployments.");
    expect(md).toContain("- `main` → kept latest deployment `m2`");
    expect(md).toContain("- `develop` → no deployments found");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run scripts/github/cleanup-deployments.test.ts`
Expected: FAIL — cannot resolve `./cleanup-deployments` (module does not exist yet).

- [ ] **Step 3: Write the implementation**

Create `scripts/github/cleanup-deployments.ts`:

```ts
import { readFileSync, writeFileSync } from "node:fs";

export type Deployment = {
  id?: string;
  created_on?: string;
  deployment_trigger?: { metadata?: { branch?: string } };
};

export type BranchRow = {
  branch: string;
  total: number;
  kept: number;
  deleted: number;
  keptId?: string;
  keptDate?: string;
};

export type CleanupReport = {
  total: number;
  deletedCount: number;
  rows: BranchRow[];
  protectedBranches: string[];
};

// Deployments with no branch metadata land here; never protected.
const UNKNOWN_BRANCH = "(unknown)";

// Turn an ISO date into a sortable number. Missing/bad dates sort oldest.
function toTime(createdOn?: string): number {
  const t = createdOn ? Date.parse(createdOn) : Number.NaN;
  return Number.isNaN(t) ? 0 : t;
}

// Protected branches first (in the order given), then the rest by most deleted.
function sortRows(rows: BranchRow[], protectedBranches: string[]): void {
  const order = new Map(protectedBranches.map((b, i) => [b, i]));
  rows.sort((a, b) => {
    const pa = order.get(a.branch) ?? Number.POSITIVE_INFINITY;
    const pb = order.get(b.branch) ?? Number.POSITIVE_INFINITY;
    if (pa !== pb) return pa - pb;
    return b.deleted - a.deleted;
  });
}

export function planCleanup(
  deployments: Deployment[],
  protectedBranches: string[],
): { toDelete: string[]; report: CleanupReport } {
  // Group every deployment under its branch name.
  const groups = new Map<string, Deployment[]>();
  for (const d of deployments) {
    const branch = d.deployment_trigger?.metadata?.branch ?? UNKNOWN_BRANCH;
    const list = groups.get(branch) ?? [];
    list.push(d);
    groups.set(branch, list);
  }

  const protectedSet = new Set(protectedBranches);
  const toDelete: string[] = [];
  const rows: BranchRow[] = [];

  for (const [branch, list] of groups) {
    // Newest first so the protected branch keeps its latest build.
    const sorted = [...list].sort((a, b) => toTime(b.created_on) - toTime(a.created_on));
    const isProtected = protectedSet.has(branch);
    const keep = isProtected ? sorted.slice(0, 1) : [];
    const drop = isProtected ? sorted.slice(1) : sorted;

    const dropIds = drop.map((d) => d.id).filter((id): id is string => typeof id === "string");
    toDelete.push(...dropIds);

    const kept = keep[0];
    rows.push({
      branch,
      total: list.length,
      kept: keep.length,
      deleted: dropIds.length,
      keptId: kept?.id,
      keptDate: kept?.created_on,
    });
  }

  sortRows(rows, protectedBranches);

  return {
    toDelete,
    report: {
      total: deployments.length,
      deletedCount: toDelete.length,
      rows,
      protectedBranches,
    },
  };
}

export function renderReport(report: CleanupReport): string {
  const lines: string[] = [
    "## Cloudflare deployment cleanup",
    "",
    `You had a total of **${report.total}** deployments in Cloudflare. The detail was the following:`,
    "",
    "| Branch | Total | Kept | Deleted |",
    "| ------ | ----- | ---- | ------- |",
  ];
  for (const r of report.rows) {
    lines.push(`| ${r.branch} | ${r.total} | ${r.kept} | ${r.deleted} |`);
  }
  lines.push("", "---", "", "Except the branches:");
  for (const branch of report.protectedBranches) {
    const row = report.rows.find((r) => r.branch === branch);
    lines.push(
      row?.keptId
        ? `- \`${branch}\` → kept latest deployment \`${row.keptId}\` (${row.keptDate})`
        : `- \`${branch}\` → no deployments found`,
    );
  }
  lines.push("", `So, we have deleted **${report.deletedCount}** deployments.`);
  return lines.join("\n");
}

// CLI: `node --experimental-strip-types scripts/github/cleanup-deployments.ts <json-file> <protected-branch...>`
// Writes ids.txt (one id per line) and report.md (the rendered message).
if (process.argv[1]?.endsWith("cleanup-deployments.ts")) {
  const [, , jsonPath, ...protectedBranches] = process.argv;
  if (!jsonPath || protectedBranches.length === 0) {
    console.error("usage: cleanup-deployments.ts <json-file> <protected-branch...>");
    process.exit(1);
  }
  const deployments = JSON.parse(readFileSync(jsonPath, "utf8")) as Deployment[];
  const { toDelete, report } = planCleanup(deployments, protectedBranches);
  writeFileSync("ids.txt", toDelete.length ? `${toDelete.join("\n")}\n` : "");
  writeFileSync("report.md", renderReport(report));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run scripts/github/cleanup-deployments.test.ts`
Expected: PASS — all tests in both `describe` blocks green.

- [ ] **Step 5: Smoke-test the CLI**

```bash
cat > /tmp/deps.json <<'JSON'
[
  {"id":"m1","created_on":"2026-01-01T00:00:00Z","deployment_trigger":{"metadata":{"branch":"main"}}},
  {"id":"m2","created_on":"2026-02-01T00:00:00Z","deployment_trigger":{"metadata":{"branch":"main"}}},
  {"id":"f1","created_on":"2026-01-01T00:00:00Z","deployment_trigger":{"metadata":{"branch":"feat/foo"}}}
]
JSON
node --experimental-strip-types scripts/github/cleanup-deployments.ts /tmp/deps.json main develop
cat ids.txt
cat report.md
```

Expected: `ids.txt` contains `m1` and `f1`; `report.md` shows `total of **3**`, `deleted **2**`, `- \`main\` → kept latest deployment \`m2\``, `- \`develop\` → no deployments found`.

- [ ] **Step 6: Clean up scratch files and commit**

```bash
rm -f ids.txt report.md /tmp/deps.json
git add scripts/github/cleanup-deployments.ts scripts/github/cleanup-deployments.test.ts
git commit -m "feat(ci): add cleanup-deployments planner with tests"
```

---

## Task 3: Workflow `cd-cloudflare-cleanup.yml` (delete merged branch's previews)

**Files:**

- Create: `.github/workflows/cd-cloudflare-cleanup.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/cd-cloudflare-cleanup.yml`:

```yaml
# When a PR merges, delete the head branch's Cloudflare Pages preview
# deployments. main and develop are never touched.
#
# REQUIRED REPO SECRETS (Settings -> Secrets and variables -> Actions):
#   CLOUDFLARE_API_TOKEN   token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Both are read automatically by wrangler from the environment.

name: CD Cloudflare Cleanup

on:
  pull_request:
    types: [closed]

permissions:
  contents: read
  pull-requests: write

jobs:
  cleanup:
    if: >
      github.event.pull_request.merged == true &&
      github.event.pull_request.head.ref != 'main' &&
      github.event.pull_request.head.ref != 'develop'
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

      - id: delete
        env:
          BRANCH: ${{ github.event.pull_request.head.ref }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          pnpm exec wrangler pages deployment list --environment preview --json > deployments.json
          node --experimental-strip-types scripts/github/preview-deployment-ids.ts deployments.json "$BRANCH" > ids.txt || true
          deleted=0; failed=0
          while read -r id; do
            if [ -n "$id" ] && pnpm exec wrangler pages deployment delete "$id" --force; then
              deleted=$((deleted+1))
            else
              failed=$((failed+1))
            fi
          done < ids.txt
          echo "deleted=$deleted" >> "$GITHUB_ENV"
          echo "failed=$failed" >> "$GITHUB_ENV"

      - name: Upsert PR comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const marker = "<!-- cd-cloudflare-cleanup -->";
            const success = "${{ steps.delete.outcome }}" === "success";
            const runUrl =
              `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}` +
              `/actions/runs/${context.runId}`;
            const branch = context.payload.pull_request.head.ref;
            const deleted = process.env.deleted || "0";
            const failed = process.env.failed || "0";

            const body = success
              ? `${marker}\n🗑️ Deleted ${deleted} preview deployment(s) for ` +
                `merged branch \`${branch}\`.` +
                (failed !== "0" ? ` ${failed} could not be deleted.` : "")
              : `${marker}\n❌ Cleanup failed. ` +
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

- [ ] **Step 2: Validate the YAML parses**

Run: `node -e "const yaml=require('js-yaml');yaml.load(require('fs').readFileSync('.github/workflows/cd-cloudflare-cleanup.yml','utf8'));console.log('ok')"`
Expected: `ok`. (If `js-yaml` is not installed, instead run `python3 -c "import yaml,sys;yaml.safe_load(open('.github/workflows/cd-cloudflare-cleanup.yml'));print('ok')"`.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/cd-cloudflare-cleanup.yml
git commit -m "feat(ci): delete merged branch previews on PR merge"
```

---

## Task 4: Workflow `cronjob-cloudflare-cleanup.yml` (weekly global prune → issue)

**Files:**

- Create: `.github/workflows/cronjob-cloudflare-cleanup.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/cronjob-cloudflare-cleanup.yml`:

```yaml
# Weekly prune of Cloudflare Pages deployments. Keeps only the newest main
# deployment and the newest develop deployment; deletes everything else.
# Posts a report to a tracking GitHub issue.
#
# REQUIRED REPO SECRETS (Settings -> Secrets and variables -> Actions):
#   CLOUDFLARE_API_TOKEN   token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Both are read automatically by wrangler from the environment.

name: Cron Cloudflare Cleanup

on:
  schedule:
    - cron: "0 3 * * 1"
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  cleanup:
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

      - id: prune
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          pnpm exec wrangler pages deployment list --environment production --json > prod.json
          pnpm exec wrangler pages deployment list --environment preview --json > preview.json
          node -e 'const fs=require("node:fs");const a=JSON.parse(fs.readFileSync("prod.json","utf8"));const b=JSON.parse(fs.readFileSync("preview.json","utf8"));fs.writeFileSync("deployments.json",JSON.stringify([...a,...b]))'
          node --experimental-strip-types scripts/github/cleanup-deployments.ts deployments.json main develop
          deleted=0; failed=0
          while read -r id; do
            if [ -n "$id" ] && pnpm exec wrangler pages deployment delete "$id" --force; then
              deleted=$((deleted+1))
            else
              failed=$((failed+1))
            fi
          done < ids.txt
          echo "deleted=$deleted" >> "$GITHUB_ENV"
          echo "failed=$failed" >> "$GITHUB_ENV"

      - name: Upsert tracking issue
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require("node:fs");
            const marker = "<!-- cloudflare-cleanup-report -->";
            const title = "Cloudflare deployment cleanup";
            const runUrl =
              `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}` +
              `/actions/runs/${context.runId}`;

            let report = "";
            try {
              report = fs.readFileSync("report.md", "utf8").trim();
            } catch {}

            const failed = process.env.failed || "0";
            const failNote =
              failed !== "0" ? `\n\n⚠️ ${failed} deployment(s) could not be deleted.` : "";
            const body =
              `${marker}\n${report || `Cleanup ran but produced no report. See the [workflow run](${runUrl}).`}` +
              failNote;

            const { data: issues } = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: "open",
              per_page: 100,
            });
            const existing = issues.find((i) => i.body?.includes(marker));

            if (existing) {
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: existing.number,
                body,
              });
            } else {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title,
                body,
                labels: ["cloudflare-cleanup"],
              });
            }
```

- [ ] **Step 2: Validate the YAML parses**

Run: `python3 -c "import yaml;yaml.safe_load(open('.github/workflows/cronjob-cloudflare-cleanup.yml'));print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/cronjob-cloudflare-cleanup.yml
git commit -m "feat(ci): weekly Cloudflare cleanup cron reporting to an issue"
```

---

## Task 5: Workflow `cmd-cloudflare-cleanup.yml` (`/all-cleanup` → comment)

**Files:**

- Create: `.github/workflows/cmd-cloudflare-cleanup.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/cmd-cloudflare-cleanup.yml`:

```yaml
# Owner-only command: comment "/all-cleanup" on any issue or PR to prune
# Cloudflare Pages deployments project-wide, keeping only the newest main and
# newest develop deployment. Posts the report back as a comment.
#
# REQUIRED REPO SECRETS (Settings -> Secrets and variables -> Actions):
#   CLOUDFLARE_API_TOKEN   token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Both are read automatically by wrangler from the environment.

name: Command - All Cleanup

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  all-cleanup:
    if: >
      github.event.comment.user.login == github.repository_owner &&
      startsWith(github.event.comment.body, '/all-cleanup')
    runs-on: ubuntu-latest
    steps:
      - name: Acknowledge with reaction
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.reactions.createForIssueComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              comment_id: context.payload.comment.id,
              content: "eyes",
            });

      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11.0.3

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - id: prune
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          pnpm exec wrangler pages deployment list --environment production --json > prod.json
          pnpm exec wrangler pages deployment list --environment preview --json > preview.json
          node -e 'const fs=require("node:fs");const a=JSON.parse(fs.readFileSync("prod.json","utf8"));const b=JSON.parse(fs.readFileSync("preview.json","utf8"));fs.writeFileSync("deployments.json",JSON.stringify([...a,...b]))'
          node --experimental-strip-types scripts/github/cleanup-deployments.ts deployments.json main develop
          deleted=0; failed=0
          while read -r id; do
            if [ -n "$id" ] && pnpm exec wrangler pages deployment delete "$id" --force; then
              deleted=$((deleted+1))
            else
              failed=$((failed+1))
            fi
          done < ids.txt
          echo "deleted=$deleted" >> "$GITHUB_ENV"
          echo "failed=$failed" >> "$GITHUB_ENV"

      - name: Upsert command comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require("node:fs");
            const marker = "<!-- cmd-all-cleanup -->";
            const success = "${{ steps.prune.outcome }}" === "success";
            const runUrl =
              `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}` +
              `/actions/runs/${context.runId}`;

            let report = "";
            try {
              report = fs.readFileSync("report.md", "utf8").trim();
            } catch {}

            const failed = process.env.failed || "0";
            const failNote =
              failed !== "0" ? `\n\n⚠️ ${failed} deployment(s) could not be deleted.` : "";
            const body = success
              ? `${marker}\n${report || "Cleanup ran but produced no report."}${failNote}`
              : `${marker}\n❌ All-cleanup failed. ` +
                `See the [workflow run](${runUrl}).`;

            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
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
                issue_number: context.issue.number,
                body,
              });
            }
```

- [ ] **Step 2: Validate the YAML parses**

Run: `python3 -c "import yaml;yaml.safe_load(open('.github/workflows/cmd-cloudflare-cleanup.yml'));print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/cmd-cloudflare-cleanup.yml
git commit -m "feat(ci): add /all-cleanup command workflow"
```

---

## Task 6: Add `/all-cleanup` to the PR command guide

**Files:**

- Modify: `.github/workflows/pr-command-guide.yml:29`

- [ ] **Step 1: Add the bullet**

In `.github/workflows/pr-command-guide.yml`, find this line (line 29):

```
              "- `/delete-preview` — Delete all Cloudflare Pages preview deployments for this PR's branch.",
```

Add a new line directly after it:

```
              "- `/all-cleanup` — Prune ALL Cloudflare Pages deployments project-wide, keeping only the latest `main` and latest `develop` build. Posts a report.",
```

- [ ] **Step 2: Validate the YAML parses**

Run: `python3 -c "import yaml;yaml.safe_load(open('.github/workflows/pr-command-guide.yml'));print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pr-command-guide.yml
git commit -m "docs(ci): list /all-cleanup in the PR command guide"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run the full check + test suite**

Run: `pnpm check && pnpm test`
Expected: lint/format/typecheck pass; all tests including `cleanup-deployments.test.ts` pass.

- [ ] **Step 2: Confirm no stale script paths anywhere**

Run: `grep -rn "scripts/preview-deployment-ids\|scripts/wrangler-summary" .github scripts`
Expected: no output (every reference uses `scripts/github/...`).

- [ ] **Step 3: Confirm all five workflows are present**

Run: `ls .github/workflows/`
Expected: includes `cd-cloudflare-cleanup.yml`, `cronjob-cloudflare-cleanup.yml`, `cmd-cloudflare-cleanup.yml`, plus the pre-existing files.
