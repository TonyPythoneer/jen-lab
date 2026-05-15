# 07 — Validation + rollback

## Required Zed extensions

Install before applying 02/03:

- Vue (`vue-language-server`)
- TypeScript vtsls (`vtsls`)
- Tailwind CSS (`tailwindcss-language-server`)

Open command palette → `zed: extensions` → install each. Restart Zed.

## Smoke test checklist

| # | Action | Expected |
|---|--------|----------|
| 1 | Open `app/pages/index.vue`, save | oxfmt runs, no diff if file already canonical |
| 2 | Hover `useLazyAsyncData` | vtsls shows Nuxt auto-import signature |
| 3 | Type `class="text-` in a `.vue` template | Tailwind v4 utility autocomplete |
| 4 | Open `content/home/jen-knows.md`, save | NO reformat (Markdown opt-out) |
| 5 | Open `.zed/settings.json` | JSONC: comments allowed, no schema errors |
| 6 | Cmd-shift-P → `task: spawn` → `check: vp` | runs `pnpm check`, output panel shows oxlint + oxfmt + tsc |
| 7 | Project panel | no `.nuxt`/`.wrangler`/`.data` clutter |
| 8 | Global search "leaflet" | finds source hits, no `pnpm-lock.yaml` noise |

## CI parity check

After Zed format-on-save on a touched file:

```bash
pnpm check
```

Must exit 0 with no formatting diff. If oxfmt-via-stdin produced different output than `vp check`, fall back to `"formatter": "language_server"` in 01.

## Rollback all

```bash
git checkout -- .zed/
```

Branch `.zed/` is self-contained — no other files modified.

## Open questions

- Does oxfmt support `--stdin-filepath`? Verify on first install (`pnpm exec oxfmt --help`). If not, switch 01 to language_server formatter and rely on pre-commit `vp check`.
- Volar hybrid mode trade-off: `hybridMode: false` (chosen) = single source of truth, slower on huge repos. This repo is small — fine.
