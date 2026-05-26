# Comment commands: /preview and /delete-preview

**Date:** 2026-05-26
**Files to create:**

- `.github/workflows/cmd-preview.yml`
- `.github/workflows/cmd-delete-preview.yml`
- `scripts/preview-deployment-ids.ts` (+ test)

## Goal

Let the repo owner manage Cloudflare Pages preview deployments from a PR by
commenting a slash command:

- `/preview` — deploy the PR's branch as a preview and report the deployment
  info back on the PR.
- `/delete-preview` — delete all preview deployments for the PR's branch and
  report how many were removed.

## Shared design (both workflows)

### Trigger

```yaml
on:
  issue_comment:
    types: [created]
```

`issue_comment` fires for both issues and PRs, so the job guard filters to PRs
and to the owner.

### Permissions

```yaml
permissions:
  contents: read
  pull-requests: write # upsert the result comment
  issues: write # add the 👀 acknowledgement reaction
```

### Job guard

```yaml
if: >
  github.event.issue.pull_request &&
  github.event.comment.user.login == github.repository_owner &&
  startsWith(github.event.comment.body, '/preview')
```

(`/delete-preview` uses `startsWith(... , '/delete-preview')`.)

- Owner-only: `comment.user.login == repository_owner`.
- PR-only: `github.event.issue.pull_request` is truthy only on PR comments.
- Command match is `startsWith` (loose: `/preview please` still triggers —
  accepted).

### Acknowledgement

First step adds a 👀 reaction to the triggering comment via
`actions/github-script@v7` (`github.rest.reactions.createForIssueComment`).

### Required secrets (note block at top of each file)

- `CLOUDFLARE_API_TOKEN` — token with "Cloudflare Pages: Edit" permission.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.

`gh` uses the built-in `GITHUB_TOKEN` (passed as `GH_TOKEN`).

### Comment upsert

Same pattern as `.github/workflows/cd-cloudflare.yml`: find an existing
`github-actions[bot]` comment carrying a hidden marker and edit it, else create
one. Markers: `<!-- cmd-preview -->` and `<!-- cmd-delete-preview -->`.
Runs with `if: always()` so failures are reported too.

## cmd-preview.yml

Important: `issue_comment` workflows run detached, so the PR branch must be
checked out explicitly and passed to wrangler with `--branch`.

Steps:

1. Gate (job `if`) + 👀 react.
2. `actions/checkout@v4`.
3. `pnpm/action-setup@v4` (version 11.0.3).
4. `actions/setup-node@v4` (node 24, `cache: pnpm`).
5. `pnpm install --frozen-lockfile`.
6. `gh pr checkout ${{ github.event.issue.number }}` (env `GH_TOKEN`), then
   `BRANCH=$(git rev-parse --abbrev-ref HEAD)` exported to `$GITHUB_ENV`.
7. Deploy, capturing output:
   ```bash
   pnpm build
   pnpm exec wrangler pages deploy --branch "$BRANCH" 2>&1 | tee deploy.log
   ```
   with `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` in env. Step id
   `deploy`. (`wrangler pages deploy` reads the output dir from
   `wrangler.jsonc` `pages_build_output_dir`.)
8. Extract summary with the existing `scripts/wrangler-summary.ts`
   (`if: always()`).
9. Upsert PR comment with marker `<!-- cmd-preview -->`. Success body is the
   wrangler summary in a code block; failure body links to the workflow run.

Concurrency (avoid overlapping previews for the same PR):

```yaml
concurrency:
  group: preview-${{ github.event.issue.number }}
  cancel-in-progress: true
```

## cmd-delete-preview.yml

Target branch = the PR's head branch.

Steps:

1. Gate (job `if`, command `/delete-preview`) + 👀 react.
2. `actions/checkout@v4` (any ref — only `wrangler.jsonc` is needed for the
   project name).
3. `pnpm/action-setup@v4` (11.0.3), `actions/setup-node@v4` (node 24,
   `cache: pnpm`), `pnpm install --frozen-lockfile`.
4. Resolve branch:
   `BRANCH=$(gh pr view ${{ github.event.issue.number }} --json headRefName -q .headRefName)`
   (env `GH_TOKEN`), exported to `$GITHUB_ENV`.
5. List preview deployments:
   ```bash
   pnpm exec wrangler pages deployment list --environment preview --json > deployments.json
   ```
   with CF secrets in env.
6. Compute IDs to delete:
   ```bash
   node --experimental-strip-types scripts/preview-deployment-ids.ts deployments.json "$BRANCH" > ids.txt
   ```
7. Delete each, counting results (continue on error — a live aliased
   deployment may resist even `--force`):
   ```bash
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
   ```
   with CF secrets in env.
8. Upsert PR comment with marker `<!-- cmd-delete-preview -->` reporting the
   counts (e.g. "Deleted N preview deployment(s) for branch `X`. M could not
   be deleted.").

## scripts/preview-deployment-ids.ts

Pure, unit-tested module + CLI.

- `previewDeploymentIds(json: string, branch: string): string[]` — parse the
  `wrangler pages deployment list --json` output (an array), keep entries whose
  `deployment_trigger.metadata.branch === branch`, return their `id` values.
- Tolerates entries missing the nested branch field (skips them).
- CLI: `node --experimental-strip-types scripts/preview-deployment-ids.ts <json-file> <branch>`
  prints one id per line.

## Reused / not changed

- `scripts/wrangler-summary.ts` — reused by cmd-preview, unchanged.
- `.github/workflows/cd-cloudflare.yml` — the upsert pattern is copied, not
  modified.

## Out of scope

- Extracting shared gate/upsert boilerplate into a composite action (the two
  files duplicate it intentionally).
- Optional branch argument to `/delete-preview` (always targets the PR branch).
- Auto-cleanup of previews on PR close.

## Verification limits

`issue_comment` triggers, secrets, and reactions/comments only run on GitHub,
and the workflow file must be on the default branch (`main`) before the command
works. Local verification is limited to the unit tests for
`previewDeploymentIds` and YAML parse + invariant checks of the two workflow
files.
