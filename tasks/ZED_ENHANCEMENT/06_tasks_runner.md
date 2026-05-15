# 06 — Tasks (`.zed/tasks.json`)

## Why

`task: spawn` palette beats opening terminal + retyping. Map every `package.json` script worth one-keying.

## Create `.zed/tasks.json`

```jsonc
[
  {
    "label": "dev: nuxt",
    "command": "pnpm dev",
    "use_new_terminal": true,
    "allow_concurrent_runs": false,
    "reveal": "always"
  },
  {
    "label": "check: vp (lint + fmt + typecheck)",
    "command": "pnpm check",
    "use_new_terminal": false,
    "reveal": "always"
  },
  {
    "label": "test: vitest run",
    "command": "pnpm test",
    "use_new_terminal": false,
    "reveal": "always"
  },
  {
    "label": "test:watch",
    "command": "pnpm test:watch",
    "use_new_terminal": true,
    "reveal": "always"
  },
  {
    "label": "typecheck",
    "command": "pnpm typecheck",
    "reveal": "always"
  },
  {
    "label": "build: nuxt",
    "command": "pnpm build",
    "reveal": "always"
  },
  {
    "label": "preview: wrangler",
    "command": "pnpm preview",
    "use_new_terminal": true,
    "reveal": "always"
  },
  {
    "label": "analyze: bundle",
    "command": "pnpm analyze",
    "reveal": "always"
  },
  {
    "label": "deploy: cloudflare pages",
    "command": "pnpm deploy",
    "use_new_terminal": true,
    "reveal": "always"
  },
  {
    "label": "sync: wordpress",
    "command": "pnpm sync:wp",
    "reveal": "always"
  }
]
```

Bind: `cmd-shift-p` → `task: spawn` → fuzzy match label.

## Rollback

Delete file.
