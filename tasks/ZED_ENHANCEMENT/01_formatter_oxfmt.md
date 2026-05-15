# 01 — Formatter: oxfmt

## Why

Repo uses `vp check` = oxlint + **oxfmt** + tsc. No Prettier config exists (`.prettierignore` is a leftover hint that oxfmt respects gitignore-style ignores). Zed defaults to Prettier for JS/TS/Vue — will reformat differently than CI.

## Change

In `.zed/settings.json`, set per-language `formatter` to an external command running oxfmt via pnpm, and enable `format_on_save: "on"`.

```jsonc
{
  "format_on_save": "on",
  "formatter": {
    "external": {
      "command": "pnpm",
      "arguments": ["exec", "oxfmt", "--stdin-filepath", "{buffer_path}"]
    }
  },
  "languages": {
    "Vue.js":     { "tab_size": 2, "hard_tabs": false, "preferred_line_length": 100 },
    "TypeScript": { "tab_size": 2, "hard_tabs": false, "preferred_line_length": 100 },
    "JavaScript": { "tab_size": 2, "hard_tabs": false, "preferred_line_length": 100 },
    "JSON":       { "tab_size": 2, "hard_tabs": false },
    "Markdown":   { "format_on_save": "off" }
  }
}
```

Markdown opt-out: content files (`content/**/*.md`) must not be reformatted — front-matter + MDC blocks are fragile.

## Verify oxfmt stdin support

Run `pnpm exec oxfmt --help | grep -i stdin`. If `--stdin-filepath` flag missing, fall back to:

```jsonc
"formatter": "language_server"
```

and rely on `vp check` pre-commit instead. Document outcome in `07_validation.md`.

## Rollback

Delete `format_on_save` + `formatter` keys. Per-language tab_size already present — safe to keep.
