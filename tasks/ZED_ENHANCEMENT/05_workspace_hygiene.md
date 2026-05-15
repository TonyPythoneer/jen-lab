# 05 — Workspace hygiene
## status: complete
## Why

Repo has many generated dirs (`.nuxt`, `.wrangler`, `.data`, `.vite-hooks`, `.hypothesis`, `node_modules/.cache`) that pollute project panel + global search.

## Change

```jsonc
{
  "file_scan_exclusions": [
    "**/.git",
    "**/.svn",
    "**/.hg",
    "**/node_modules",
    "**/.nuxt",
    "**/.output",
    "**/.wrangler",
    "**/.data",
    "**/.vite-hooks",
    "**/.hypothesis",
    "**/dist",
    "**/.cache",
    "**/pnpm-lock.yaml"
  ],
  "project_panel": {
    "auto_reveal_entries": true,
    "folder_icons": true
  },
  "search": {
    "regex": false,
    "case_sensitive": false,
    "whole_word": false
  },
  "terminal": {
    "working_directory": "current_project_directory",
    "env": {
      "FORCE_COLOR": "1"
    },
    "shell": "system"
  }
}
```

Notes:
- `pnpm-lock.yaml` excluded from search (still in panel); 421 KB hits otherwise drown grep results.
- Terminal inherits user shell — Node version managed by `engines` + user's nvm/mise/fnm setup.

## Rollback

Drop blocks individually. No data loss — these are display filters.
