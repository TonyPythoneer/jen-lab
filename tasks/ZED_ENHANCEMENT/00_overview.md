# ZED_ENHANCEMENT — Overview

Goal: make `.zed/settings.json` mesh with this repo's stack so editor matches `vp check` / Nuxt / Tailwind v4 behavior. Zero friction between save-in-Zed and commit-passes-CI.

## Stack snapshot

- Runtime: Nuxt 4 (Vue 3.5, vue-router 5), Node `>=24 <25`, pnpm 11 (catalog mode).
- Build/test: vite-plus (`vp` — oxlint + oxfmt + tsc + vitest) via catalog.
- Styling: Tailwind CSS v4 (CSS-first, no `tailwind.config.*`), `app/assets/css/main.css`.
- Content: `@nuxt/content` v3, MDC, markdown front-matter.
- Deploy: Cloudflare Pages via Wrangler.
- Map: Leaflet (client-only).

## Current `.zed/settings.json`

Only sets `preferred_line_length: 100` + `tab_size: 2 / hard_tabs: false` for Vue/TS/JS. Missing: formatter wiring, LSP tuning, Tailwind v4, JSON schemas, file associations, tasks, env.

## What "perfect integration" means

1. **Format on save uses oxfmt** (matches `vp check`). No Prettier in repo — must not let Zed's default Prettier fight oxfmt.
2. **Vue Volar takeover** for TS in `.vue` (auto-imports surfaced, no double-diagnostics from `tsserver` + `volar`).
3. **Tailwind v4 LSP** pointed at `app/assets/css/main.css` (CSS-first config — Tailwind LSP needs the entry CSS path, not a JS config).
4. **JSON schemas** for `nuxt.config.ts`-adjacent JSON (`wrangler.toml` is TOML — skip), `package.json` (pnpm catalog), `tsconfig` (Nuxt-generated).
5. **File associations**: `.mdc` → Markdown, `content/**/*.md` → Markdown w/ MDC awareness, `*.vue` → Vue.
6. **Tasks**: one-click `pnpm dev` / `vp check` / `vp test` / `pnpm build` from Zed task palette.
7. **Terminal env**: inherit Node from `engines`, default working dir = repo root.
8. **Hide noise** from file tree: `.nuxt`, `.wrangler`, `.data`, `.vite-hooks`, `.hypothesis`, `node_modules/.cache`.
9. **Inlay hints + format-on-save scope** kept conservative (don't reformat content markdown).
10. **EditorConfig parity** — confirm no `.editorconfig` conflict.

## Subtask layout

- `01_formatter_oxfmt.md` — wire oxfmt as formatter for TS/JS/Vue, disable Prettier fallback.
- `02_languages_lsp.md` — Vue Volar takeover, tsserver settings, inlay hints.
- `03_tailwind_v4.md` — Tailwind LSP for v4 CSS-first config.
- `04_file_associations.md` — `.mdc`, content markdown, JSON schemas.
- `05_workspace_hygiene.md` — file_scan_exclusions, terminal, project_panel.
- `06_tasks_runner.md` — `.zed/tasks.json` for dev/check/test/build/deploy.
- `07_validation.md` — manual smoke test checklist + rollback notes.

Execute in order. Each subtask is independently revertable; commit per file.

## Non-goals

- Not touching `nuxt.config.ts`, `package.json`, or any `vp` config.
- No global Zed settings — repo-scoped only (`.zed/`).
- No debugger config (Nuxt dev server is fine in terminal).
