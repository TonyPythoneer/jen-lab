# PR command guide auto-comment

**Date:** 2026-05-26
**File to create:** `.github/workflows/pr-command-guide.yml`

## Goal

When a pull request is opened, automatically post a comment that lists the
available slash commands and what each does, so the repo owner has the menu in
front of them without remembering it.

## Trigger

```yaml
on:
  pull_request:
    types: [opened]

permissions:
  pull-requests: write
```

Fires once when a PR is opened. Posts on every opened PR (not just
owner-authored ones); the comment itself notes the commands are owner-only, so
non-owners see the menu but cannot use the commands.

## Behaviour

A single job with one step using `actions/github-script@v7`:

- Build the comment body from a hardcoded markdown string with a hidden marker
  `<!-- pr-command-guide -->`.
- Upsert: list the PR's comments, find an existing one containing the marker,
  edit it if present, otherwise create a new one. This keeps the workflow
  idempotent if `reopened` is added to the trigger later.

No checkout, Node setup, secrets, or scripts are needed — it is a pure GitHub
API call.

## Comment body (hardcoded)

```
<!-- pr-command-guide -->
### Available commands
Comment one of these on this PR (repo owner only):

- `/preview` — Build this PR's branch and deploy it to Cloudflare Pages as a preview, then post the deployment URLs.
- `/delete-preview` — Delete all Cloudflare Pages preview deployments for this PR's branch.
```

## Maintenance note

The command list is hardcoded. When a new `cmd-*.yml` command workflow is
added, add a matching line here. With only two commands the drift risk is low
and this avoids a YAML-parsing script.

## Out of scope

- A `/help` command (the guide auto-posts instead).
- Auto-discovering commands by parsing `.github/workflows/cmd-*.yml`.
- Restricting the comment to owner-authored PRs.

## Verification limits

`pull_request` triggers and the comment API only run on GitHub. Local
verification is limited to a YAML parse and a read-through of the comment body.
