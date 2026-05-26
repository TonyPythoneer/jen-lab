# CD: Cloudflare Pages deploy on PR merge

**Date:** 2026-05-26
**File to create:** `.github/workflows/cd-cloudflare.yml`

## Goal

When a pull request is merged into `main` or `develop`, build and deploy the
site to Cloudflare Pages via `pnpm deploy`, then post the wrangler deployment
summary back to the merged PR as a comment.

## Trigger

```yaml
on:
  pull_request:
    types: [closed]
    branches: [main, develop]
```

Job runs only when the PR was truly merged:

```yaml
if: github.event.pull_request.merged == true
```

PR number is read directly from `github.event.pull_request.number` — no lookup
needed. Note: direct pushes to `main`/`develop` without a PR will NOT trigger
this workflow (accepted trade-off; deploys are expected to flow through PRs).

## Permissions

```yaml
permissions:
  contents: read
  pull-requests: write # post the deployment comment
```

## Required secrets (configured by the user in repo Settings → Secrets)

A note block at the top of the workflow file documents these:

- `CLOUDFLARE_API_TOKEN` — token with the "Cloudflare Pages: Edit" permission.
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID.

Both are passed as env vars to the deploy step; `wrangler` reads them
automatically, so no CLI flags are required.

## Steps

1. `actions/checkout@v4`
2. `pnpm/action-setup@v4` with `version: 11.0.3`
3. `actions/setup-node@v4` with `node-version: 24`, `cache: pnpm`
4. `pnpm install --frozen-lockfile`
   (steps 1–4 mirror the existing `.github/workflows/ci.yml`)
5. Deploy, capturing combined output:

   ```yaml
   - id: deploy
     run: pnpm deploy 2>&1 | tee deploy.log
     env:
       CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
       CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
   ```

6. Extract the wrangler summary from `deploy.log`. `pnpm deploy` runs
   `nuxt build` first, so the log is noisy; we keep only the distinctive
   wrangler marker lines (those starting with `✨` or `🌎`, plus the two
   `*.pages.dev` URL lines). The extracted block is written to a step output /
   file for the comment body. This extraction step runs with `if: always()`
   so it also produces whatever output exists on failure.

7. Upsert a comment on the PR via `actions/github-script@v7`:
   - Find an existing comment authored by `github-actions[bot]` that carries a
     hidden marker (e.g. `<!-- cd-cloudflare -->`).
   - If found, edit it; otherwise create a new one.
   - Runs with `if: always()` so failures are reported too.

## Comment format

On success, the body is the wrangler block, e.g.:

```
✨ Compiled Worker successfully
✨ Uploading Worker bundle
✨ Uploading _routes.json
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://6c88162a.jen-lab.pages.dev
✨ Deployment alias URL: https://chore-cleanup.jen-lab.pages.dev
```

On failure, the comment states the deploy failed and links to the workflow run
(`${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`).
The job itself still exits non-zero (red check) on failure.

A hidden HTML marker (`<!-- cd-cloudflare -->`) is included so the upsert step
can locate the prior comment.

## Out of scope

- Distinguishing production vs preview deploys beyond what `wrangler pages
deploy` does by default.
- Deploys triggered by non-PR pushes.
- Rollbacks.
