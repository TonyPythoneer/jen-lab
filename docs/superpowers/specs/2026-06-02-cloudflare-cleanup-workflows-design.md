# Cloudflare deployment cleanup workflows — design

Date: 2026-06-02

## Problem

Cloudflare Pages keeps every deployment forever. Feature-branch previews and
old main/develop builds pile up. We need automated and on-demand cleanup that
never deletes the live site.

## Goals

1. Delete a feature branch's preview deployments automatically when its PR
   merges (never touch `main` or `develop`).
2. Weekly, prune the whole project down to one deployment each for `main` and
   `develop`; delete everything else.
3. An owner-only chat command that runs the same global prune on demand, usable
   from any issue or PR.
4. Report what happened in a fixed human-readable format.

## Non-goals

- Age-based or count-based retention. The weekly/command prune keeps **only**
  the newest `main` deployment and the newest `develop` deployment.
- Cleaning any cloud other than Cloudflare Pages.

## Context (existing repo patterns)

- `.github/workflows/cmd-preview.yml` — owner-only `/preview` command;
  template for the command-style workflows (👀 reaction → checkout → pnpm →
  wrangler → upsert PR comment).
- `.github/workflows/cmd-delete-preview.yml` — deletes a branch's preview
  deployments via `wrangler pages deployment list/delete` and
  `scripts/preview-deployment-ids.ts`.
- `.github/workflows/cd-cloudflare.yml` — deploys on PR merge into main/develop.
- `scripts/preview-deployment-ids.ts` — pure function + CLI; filters deployment
  JSON by `deployment_trigger.metadata.branch`. **Reused as-is** by the merge
  cleanup.
- `scripts/wrangler-summary.ts` — pure function + CLI pattern to mirror for the
  new shared script.

Cloudflare environments: `main` deploys to **production**, `develop` and all
feature branches deploy to **preview**. The global prune must list both
environments and merge them.

Required secrets (already configured): `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`. Wrangler reads both from the environment.

## Architecture

Thin workflows over one shared, unit-tested planning function. The retention
rule and report format live in exactly one place.

### Shared helper — `scripts/cleanup-deployments.ts`

Pure function plus a CLI, mirroring `wrangler-summary.ts`.

```ts
type Deployment = {
  id?: string;
  created_on?: string;
  deployment_trigger?: { metadata?: { branch?: string } };
};

type BranchRow = {
  branch: string;
  total: number;
  kept: number;
  deleted: number;
  keptId?: string;
  keptDate?: string;
};

type CleanupReport = {
  total: number;
  deletedCount: number;
  rows: BranchRow[];
  protectedBranches: string[];
};

export function planCleanup(
  deployments: Deployment[],
  protectedBranches: string[],
): { toDelete: string[]; report: CleanupReport };

export function renderReport(report: CleanupReport): string;
```

Behaviour of `planCleanup`:

- Group deployments by branch (unknown branch → `"(unknown)"`).
- Sort each group by `created_on` descending.
- For a protected branch (`main`, `develop`): keep the newest one, mark the rest
  to delete. Record `keptId` / `keptDate`.
- For every other branch: mark all to delete.
- Return `toDelete` (flat list of ids) and the `report`.

`renderReport` produces the fixed message (see Report format below).

CLI mode (`process.argv[1]?.endsWith("cleanup-deployments.ts")`):

```
node --experimental-strip-types scripts/cleanup-deployments.ts <json-file> <branch...>
```

- Reads the merged deployments JSON.
- Writes `ids.txt` (one id per line) for the shell delete loop.
- Writes `report.md` (the rendered report) for the comment/issue step.

### Test — `scripts/cleanup-deployments.test.ts` (Vitest)

Cover with fixture deployment arrays:

- Protected branch keeps only its newest; older ones deleted.
- Non-protected branch fully deleted.
- Empty input → `toDelete: []`, total 0.
- Missing `created_on` / missing branch handled without throwing.
- `report` counts (total, per-branch kept/deleted, deletedCount) are correct.

## Workflows

### 1. `cd-cloudflare-cleanup.yml`

Auto-delete a merged feature branch's preview deployments.

- `on: pull_request: [closed]`.
- Job guard:
  `if: github.event.pull_request.merged == true && github.event.pull_request.head.ref != 'main' && github.event.pull_request.head.ref != 'develop'`.
- Steps mirror `cmd-delete-preview.yml`:
  - checkout → pnpm/action-setup → setup-node → `pnpm install --frozen-lockfile`.
  - `BRANCH` = `github.event.pull_request.head.ref`.
  - `wrangler pages deployment list --environment preview --json > deployments.json`.
  - `scripts/preview-deployment-ids.ts deployments.json "$BRANCH" > ids.txt`.
  - delete loop (`wrangler pages deployment delete "$id" --force`), counting
    `deleted` / `failed`.
- Upsert a comment on the merged PR (marker `<!-- cd-cloudflare-cleanup -->`):
  `🗑️ Deleted N preview deployment(s) for merged branch \`X\`.` plus failure note
  if any. On step failure, link the workflow run.
- `permissions: contents: read, pull-requests: write` (matches `cd-cloudflare.yml`;
  PR comments go through the issues API but only need `pull-requests: write`).

### 2. `cronjob-cloudflare-cleanup.yml`

Weekly global prune, keep latest `main` + latest `develop`.

- `on: schedule: - cron: "0 3 * * 1"` (Mon 03:00 UTC) and `workflow_dispatch`.
- Steps: checkout → pnpm → setup-node → install.
- List both environments and merge:
  ```bash
  pnpm exec wrangler pages deployment list --environment production --json > prod.json
  pnpm exec wrangler pages deployment list --environment preview --json > preview.json
  node -e 'const fs=require("fs");const a=JSON.parse(fs.readFileSync("prod.json","utf8"));const b=JSON.parse(fs.readFileSync("preview.json","utf8"));fs.writeFileSync("deployments.json",JSON.stringify([...a,...b]))'
  ```
- `node --experimental-strip-types scripts/cleanup-deployments.ts deployments.json main develop`
  → produces `ids.txt` and `report.md`.
- Delete loop over `ids.txt`.
- **Upsert a GitHub issue** (marker `<!-- cloudflare-cleanup-report -->`, label
  `cloudflare-cleanup`, title `Cloudflare deployment cleanup`): search open
  issues for the marker; update if found, else create. Body = contents of
  `report.md`.
- `permissions: contents: read, issues: write`.

### 3. `cmd-cloudflare-cleanup.yml`

On-demand global prune via `/all-cleanup`.

- `on: issue_comment: [created]`.
- Job guard (note: **no** `issue.pull_request` check — works on issues and PRs):
  ```yaml
  if: >
    github.event.comment.user.login == github.repository_owner &&
    startsWith(github.event.comment.body, '/all-cleanup')
  ```
- 👀 reaction acknowledge (like `cmd-preview`).
- checkout → pnpm → setup-node → install.
- Same list-both-environments + `cleanup-deployments.ts` + delete loop as the
  cron job.
- Upsert a comment on the triggering issue/PR
  (marker `<!-- cmd-all-cleanup -->`), body = `report.md`. On failure, link run.
- `permissions: contents: read, pull-requests: write, issues: write`.

### 4. `pr-command-guide.yml` update

Add one bullet after `/delete-preview`:

```
"- `/all-cleanup` — Prune ALL Cloudflare Pages deployments project-wide, keeping only the latest `main` and latest `develop` build. Posts a report.",
```

## Report format

Emitted by `renderReport`; used verbatim as the cron issue body and the
`/all-cleanup` comment body.

```
## Cloudflare deployment cleanup

You had a total of **42** deployments in Cloudflare. The detail was the following:

| Branch        | Total | Kept | Deleted |
| ------------- | ----- | ---- | ------- |
| main          | 12    | 1    | 11      |
| develop       | 8     | 1    | 7       |
| feat/foo      | 5     | 0    | 5       |

---

Except the branches:
- `main`    → kept latest deployment `<id>` (<created_on>)
- `develop` → kept latest deployment `<id>` (<created_on>)

So, we have deleted **40** deployments.
```

Rows sorted protected-first (`main`, `develop`), then the rest by deleted count
descending. If a protected branch has no deployments, its "Except" line reads
`→ no deployments found`.

## Edge cases

- **Nothing to delete:** `toDelete` empty → skip the delete loop; report still
  posts with `deleted **0**`.
- **Delete failure on one id:** loop continues, counts `failed`; the report
  reflects actual deletions. Wrangler refuses to delete the live production /
  aliased deployment, which is exactly the newest `main` we already keep.
- **Unknown branch metadata:** grouped under `(unknown)` and fully deleted (not
  protected).
- **Concurrent runs:** cron + manual could overlap; deletes are idempotent
  (already-deleted id just fails the loop and is counted). No locking needed.

## Decisions (locked)

- Retention: only newest `main` + newest `develop` survive; everything else
  deleted project-wide. (User choice.)
- Cron report destination: GitHub issue, upserted weekly. (User choice.)
- Command name: `/all-cleanup` (not `/cleanup`), owner-only, issues + PRs.
- Approach A: shared pure script + thin workflows, over inline JS or bash+jq.
