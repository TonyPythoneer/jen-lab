# /preview and /delete-preview Command Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two owner-only PR comment commands — `/preview` (deploy the PR branch as a Cloudflare Pages preview) and `/delete-preview` (delete all preview deployments for the PR branch) — that report results back on the PR.

**Architecture:** Both are `issue_comment` workflows gated to PR comments from the repo owner. `/preview` checks out the PR branch, deploys with `wrangler --branch`, and reuses `scripts/wrangler-summary.ts` to build the result comment. `/delete-preview` lists preview deployments, filters IDs by branch via a new unit-tested module `scripts/preview-deployment-ids.ts`, and deletes them.

**Tech Stack:** GitHub Actions (`issue_comment`, `actions/github-script@v7`), pnpm, wrangler (Cloudflare Pages), Node 24 (`--experimental-strip-types`), Vitest (`vite-plus/test`).

---

## File Structure

- Create: `scripts/preview-deployment-ids.ts` — `previewDeploymentIds(json, branch)` parses `wrangler pages deployment list --json` output and returns IDs whose deployment branch matches; plus a CLI that prints one ID per line.
- Create: `tests/preview-deployment-ids.test.ts` — unit tests for that module.
- Create: `.github/workflows/cmd-preview.yml` — the `/preview` command workflow.
- Create: `.github/workflows/cmd-delete-preview.yml` — the `/delete-preview` command workflow.
- Reused, not modified: `scripts/wrangler-summary.ts`, `.github/workflows/cd-cloudflare.yml` (upsert pattern copied).

---

## Task 1: preview-deployment-ids module

**Files:**

- Create: `scripts/preview-deployment-ids.ts`
- Test: `tests/preview-deployment-ids.test.ts`

The `wrangler pages deployment list --json` output is an array of deployment
objects. Each carries its source branch at
`deployment_trigger.metadata.branch`. We keep entries whose branch matches the
requested branch and return their `id`. Entries missing that nested field are
skipped (not matched).

- [ ] **Step 1: Write the failing test**

Create `tests/preview-deployment-ids.test.ts`:

```ts
import { describe, it, expect } from "vite-plus/test";
import { previewDeploymentIds } from "../scripts/preview-deployment-ids";

const SAMPLE = JSON.stringify([
  {
    id: "aaa",
    deployment_trigger: { metadata: { branch: "feat/x" } },
  },
  {
    id: "bbb",
    deployment_trigger: { metadata: { branch: "feat/y" } },
  },
  {
    id: "ccc",
    deployment_trigger: { metadata: { branch: "feat/x" } },
  },
  { id: "ddd" }, // missing nested field — must be skipped
]);

describe("previewDeploymentIds", () => {
  it("returns ids whose deployment branch matches", () => {
    expect(previewDeploymentIds(SAMPLE, "feat/x")).toEqual(["aaa", "ccc"]);
  });

  it("returns an empty array when no branch matches", () => {
    expect(previewDeploymentIds(SAMPLE, "feat/none")).toEqual([]);
  });

  it("skips entries missing the nested branch field", () => {
    expect(previewDeploymentIds(SAMPLE, "feat/y")).toEqual(["bbb"]);
  });

  it("returns an empty array for an empty list", () => {
    expect(previewDeploymentIds("[]", "feat/x")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../scripts/preview-deployment-ids` / `previewDeploymentIds` is not a function.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/preview-deployment-ids.ts`:

```ts
import { readFileSync } from "node:fs";

type Deployment = {
  id?: string;
  deployment_trigger?: { metadata?: { branch?: string } };
};

export function previewDeploymentIds(json: string, branch: string): string[] {
  const list = JSON.parse(json) as Deployment[];
  return list
    .filter((d) => d.deployment_trigger?.metadata?.branch === branch)
    .map((d) => d.id)
    .filter((id): id is string => typeof id === "string");
}

// CLI: `node --experimental-strip-types scripts/preview-deployment-ids.ts <json-file> <branch>`
// Prints one matching deployment id per line.
if (process.argv[1]?.endsWith("preview-deployment-ids.ts")) {
  const [, , path, branch] = process.argv;
  if (!path || !branch) {
    console.error("usage: preview-deployment-ids.ts <json-file> <branch>");
    process.exit(1);
  }
  const ids = previewDeploymentIds(readFileSync(path, "utf8"), branch);
  if (ids.length > 0) process.stdout.write(ids.join("\n") + "\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS (4 tests in `tests/preview-deployment-ids.test.ts`).

- [ ] **Step 5: Verify the CLI entry works end-to-end**

Run:

```bash
printf '[{"id":"aaa","deployment_trigger":{"metadata":{"branch":"feat/x"}}},{"id":"bbb","deployment_trigger":{"metadata":{"branch":"feat/y"}}}]' > /tmp/deployments.json
node --experimental-strip-types scripts/preview-deployment-ids.ts /tmp/deployments.json feat/x
```

Expected stdout: `aaa`

- [ ] **Step 6: Run full check**

Run: `pnpm check`
Expected: PASS (lint + format + typecheck clean).

- [ ] **Step 7: Commit**

```bash
git add scripts/preview-deployment-ids.ts tests/preview-deployment-ids.test.ts
git commit -m "feat(scripts): add preview deployment id filter"
```

---

## Task 2: cmd-preview workflow

**Files:**

- Create: `.github/workflows/cmd-preview.yml`
- Reference (do not modify): `.github/workflows/cd-cloudflare.yml`, `scripts/wrangler-summary.ts`.

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/cmd-preview.yml`:

```yaml
# Owner-only PR command: comment "/preview" to deploy the PR's branch to
# Cloudflare Pages as a preview, then post the wrangler summary on the PR.
#
# REQUIRED REPO SECRETS (Settings -> Secrets and variables -> Actions):
#   CLOUDFLARE_API_TOKEN   token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Both are read automatically by wrangler from the environment.

name: Command - Preview

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  issues: write

concurrency:
  group: preview-${{ github.event.issue.number }}
  cancel-in-progress: true

jobs:
  preview:
    if: >
      github.event.issue.pull_request &&
      github.event.comment.user.login == github.repository_owner &&
      startsWith(github.event.comment.body, '/preview')
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

      - name: Checkout PR branch
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr checkout ${{ github.event.issue.number }}
          echo "BRANCH=$(git rev-parse --abbrev-ref HEAD)" >> "$GITHUB_ENV"

      - id: deploy
        run: |
          pnpm build
          pnpm exec wrangler pages deploy --branch "$BRANCH" 2>&1 | tee deploy.log
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
            const marker = "<!-- cmd-preview -->";
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
              : `${marker}\n❌ Preview deploy failed. ` +
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

- [ ] **Step 2: Verify the workflow YAML parses**

Run:

```bash
node --experimental-strip-types -e "import('node:fs').then(fs=>import('yaml').then(y=>{const d=y.parse(fs.readFileSync('.github/workflows/cmd-preview.yml','utf8'));const on=d.on??d[true];console.log('on:',Object.keys(on));console.log('if includes owner+preview:',d.jobs.preview.if.includes('repository_owner')&&d.jobs.preview.if.includes(\"'/preview'\"));console.log('perms:',JSON.stringify(d.permissions));console.log('concurrency:',JSON.stringify(d.concurrency));console.log('YAML OK')}))"
```

Expected: `on: [ 'issue_comment' ]`, `if includes owner+preview: true`, perms with `pull-requests: write` + `issues: write`, a concurrency block, then `YAML OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/cmd-preview.yml
git commit -m "feat(ci): add /preview command workflow"
```

---

## Task 3: cmd-delete-preview workflow

**Files:**

- Create: `.github/workflows/cmd-delete-preview.yml`
- Reference (do not modify): `scripts/preview-deployment-ids.ts` (from Task 1).

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/cmd-delete-preview.yml`:

```yaml
# Owner-only PR command: comment "/delete-preview" to delete all Cloudflare
# Pages preview deployments for the PR's branch, then report the count on the PR.
#
# REQUIRED REPO SECRETS (Settings -> Secrets and variables -> Actions):
#   CLOUDFLARE_API_TOKEN   token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Both are read automatically by wrangler from the environment.

name: Command - Delete Preview

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  delete-preview:
    if: >
      github.event.issue.pull_request &&
      github.event.comment.user.login == github.repository_owner &&
      startsWith(github.event.comment.body, '/delete-preview')
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

      - name: Resolve PR branch
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "BRANCH=$(gh pr view ${{ github.event.issue.number }} --json headRefName -q .headRefName)" >> "$GITHUB_ENV"

      - id: delete
        run: |
          pnpm exec wrangler pages deployment list --environment preview --json > deployments.json
          node --experimental-strip-types scripts/preview-deployment-ids.ts deployments.json "$BRANCH" > ids.txt || true
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
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Upsert PR comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const marker = "<!-- cmd-delete-preview -->";
            const success = "${{ steps.delete.outcome }}" === "success";
            const runUrl =
              `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}` +
              `/actions/runs/${context.runId}`;
            const branch = process.env.BRANCH || "(unknown)";
            const deleted = process.env.deleted || "0";
            const failed = process.env.failed || "0";

            const body = success
              ? `${marker}\n🗑️ Deleted ${deleted} preview deployment(s) for ` +
                `branch \`${branch}\`.` +
                (failed !== "0" ? ` ${failed} could not be deleted.` : "")
              : `${marker}\n❌ Delete-preview failed. ` +
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

- [ ] **Step 2: Verify the workflow YAML parses**

Run:

```bash
node --experimental-strip-types -e "import('node:fs').then(fs=>import('yaml').then(y=>{const d=y.parse(fs.readFileSync('.github/workflows/cmd-delete-preview.yml','utf8'));const on=d.on??d[true];console.log('on:',Object.keys(on));console.log('if includes owner+delete:',d.jobs['delete-preview'].if.includes('repository_owner')&&d.jobs['delete-preview'].if.includes(\"'/delete-preview'\"));console.log('perms:',JSON.stringify(d.permissions));const ids=d.jobs['delete-preview'].steps.find(s=>s.id==='delete');console.log('delete step env:',Object.keys(ids.env));console.log('YAML OK')}))"
```

Expected: `on: [ 'issue_comment' ]`, `if includes owner+delete: true`, perms with `pull-requests: write` + `issues: write`, delete step env has both `CLOUDFLARE_*`, then `YAML OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/cmd-delete-preview.yml
git commit -m "feat(ci): add /delete-preview command workflow"
```

---

## Notes on verification limits

`issue_comment` triggers, the 👀 reaction, secrets, deploy/delete, and PR
comments only run on GitHub, and both workflow files must be on the default
branch (`main`) before the commands work. Local verification is limited to:
the `previewDeploymentIds` unit tests (Task 1) and YAML parse + invariant
checks (Tasks 2 & 3).
