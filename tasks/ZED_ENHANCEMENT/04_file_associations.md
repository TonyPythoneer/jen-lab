# 04 — File associations + JSON schemas

## Why

- `.mdc` files (MDC component syntax) → Zed sees as plain text without help.
- `package.json` uses **pnpm catalog** (`"vite-plus": "catalog:"`, `"vitest": "catalog:"`) — schema validation should not complain.
- `tsconfig.json` is Nuxt-extended (`.nuxt/tsconfig.json`) — schema should be tolerant.

## Change

```jsonc
{
  "file_types": {
    "Markdown": ["mdc"],
    "JSONC": ["tsconfig.json", "tsconfig.*.json", ".zed/*.json"]
  },
  "languages": {
    "Markdown": {
      "format_on_save": "off",
      "soft_wrap": "editor_width"
    }
  }
}
```

- `tsconfig*` as JSONC → allows comments Nuxt-generated extends sometimes include.
- `.zed/*.json` as JSONC → can comment future tweaks.
- MDC files inherit Markdown highlighting; full MDC component highlighting isn't supported by Zed yet — acceptable.

## Schemas

Zed reads JSON schemas via `$schema` field in the file itself, not central config. Optional follow-up: add `$schema` to `app.config.ts` / `nuxt.config.ts` if Nuxt exposes one (it doesn't, as TS). Skip — no action.

## Rollback

Remove `file_types` block.
