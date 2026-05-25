# PR Command Guide Auto-Comment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-post a comment listing the available slash commands whenever a pull request is opened.

**Architecture:** A single `pull_request: [opened]` workflow runs one `actions/github-script` step that upserts a marker-tagged comment built from a hardcoded markdown string. No checkout, Node, secrets, or scripts.

**Tech Stack:** GitHub Actions (`pull_request`, `actions/github-script@v7`).

---

## File Structure

- Create: `.github/workflows/pr-command-guide.yml` — the whole feature. One responsibility: post/refresh the command-list comment on PR open.

There is no testable code unit (the body is a static string), so there is no
script or test file. Verification is YAML parse + read-through.

---

## Task 1: pr-command-guide workflow

**Files:**

- Create: `.github/workflows/pr-command-guide.yml`
- Reference (do not modify): `.github/workflows/cmd-preview.yml`, `.github/workflows/cmd-delete-preview.yml` (their commands are the ones listed).

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/pr-command-guide.yml`:

```yaml
# Auto-posts a comment listing the available slash commands when a PR is opened.
# The commands themselves live in .github/workflows/cmd-*.yml and are owner-only.
# When you add a new cmd-*.yml command, add a matching bullet to COMMENT_BODY below.

name: PR Command Guide

on:
  pull_request:
    types: [opened]

permissions:
  pull-requests: write

jobs:
  guide:
    runs-on: ubuntu-latest
    steps:
      - name: Post command guide
        uses: actions/github-script@v7
        with:
          script: |
            const marker = "<!-- pr-command-guide -->";
            const body = [
              marker,
              "### Available commands",
              "Comment one of these on this PR (repo owner only):",
              "",
              "- `/preview` — Build this PR's branch and deploy it to Cloudflare Pages as a preview, then post the deployment URLs.",
              "- `/delete-preview` — Delete all Cloudflare Pages preview deployments for this PR's branch.",
            ].join("\n");

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

- [ ] **Step 2: Verify the workflow YAML parses and invariants hold**

Run:

```bash
node --experimental-strip-types -e "import('node:fs').then(fs=>import('yaml').then(y=>{const d=y.parse(fs.readFileSync('.github/workflows/pr-command-guide.yml','utf8'));const on=d.on??d[true];console.log('on:',Object.keys(on));console.log('opened:',JSON.stringify(on.pull_request.types));console.log('perms:',JSON.stringify(d.permissions));const s=d.jobs.guide.steps[0];console.log('uses:',s.uses);console.log('body has both commands:',s.with.script.includes('/preview')&&s.with.script.includes('/delete-preview')&&s.with.script.includes('pr-command-guide'));console.log('YAML OK')}))"
```

Expected output: `on: [ 'pull_request' ]`, `opened: ["opened"]`, `perms: {"pull-requests":"write"}`, `uses: actions/github-script@v7`, `body has both commands: true`, then `YAML OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pr-command-guide.yml
git commit -m "feat(ci): auto-post command guide on PR open"
```

Do NOT use `git add -A`. Commit only this file.

---

## Notes on verification limits

`pull_request` triggers and the comment API only run on GitHub, and the file
must be on the default branch (`main`) before it fires on new PRs. Local
verification is limited to the YAML parse + invariant check in Step 2.
