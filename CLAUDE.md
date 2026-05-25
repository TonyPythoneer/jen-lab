# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Reminders

- **Language** — always respond in the language configured in `~/.claude/settings.json` (`language` field). Never override it.

## Commands

```bash
# Nuxt / pnpm
pnpm dev          # Dev server at :3500 — user runs it; NEVER start/kill, assume already running
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages
pnpm sync:wp      # Sync WordPress content

# Validation (run after changes)
pnpm check        # Lint + format + typecheck
pnpm test         # Run tests (Vitest)
```

## Architecture

Nuxt 4 personal site for "榛知雪梨", deployed to **Cloudflare Pages**. Four routes: `/` (landing), `/about`, `/blogs` + `/blogs/[...slug]` (WordPress REST API), `/my-best-restaurants-search-in-sydney` (Leaflet map).

**Non-obvious constraints:**

- `SitePageContainer` — do **not** use on `/` (homepage manages its own container for full-bleed sections). Use on all other pages.
- `useRestaurants.ts` — intentional `useLazyAsyncData` + dynamic `import()`: keeps the dataset out of the route chunk. Do NOT replace with a static top-level import.
- `MapView.vue` — Leaflet must stay inside `<ClientOnly>` (SSR-unsafe).
- `mdc.highlight: false` in `nuxt.config.ts` — disables Shiki WASM (~1.5 MB). Re-enable only if fenced code blocks are added to content.
- Light mode only — dark mode disabled in `app.config.ts`.

## UI Testing

Run `pnpm ai:screenshot <route>` to capture the page to `/tmp/verify.png` (e.g. `pnpm ai:screenshot /blogs`), then Read that file to verify visually. Always run it with `run_in_background: false` so the image is ready before reading. Never rely on computer-use screenshots or manual browser navigation.

## Library Docs

Never access the internet to read documentation. Read the library source directly instead:

- Node.js project: `./node_modules/<package>`
- Python project: `./venv`

If something is unclear, grep or read the relevant module folder.

## Data fetching

Do **NOT** use `useAsyncData`. It awaits during `<script setup>` and blocks UI render until the request resolves — slow networks stall the page shell. Use `useLazyAsyncData` (non-blocking, paints shell first, fills data when ready) or fetch imperatively inside event handlers / `onMounted`.

## Code Style

- 2-space indent for Vue and TypeScript. Configured in `.zed/settings.json` for the Zed IDE.
- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.
- No hardcoded strings in Vue templates for domain identifiers/labels/keys. Define constants in `<script setup>` and bind via `:id`, `:label`, etc. Variant prop literals (e.g. `<UButton color="neutral">`, `<HomeSprite half="left">`) are part of the component contract and stay inline.
- Default to no comments. Add a comment only when the WHY is non-obvious — a hidden constraint, an intentional non-idiom (e.g. lazy chunk-split intent in `useRestaurants`), or a workaround tied to a library internal.
- Exception: in Vue templates, label implicit sub-components with a one-word section comment (e.g. `<!-- Banner -->`, `<!-- Contacts -->`) when the template contains multiple distinct visual regions but extracting them into separate `.vue` files would be over-splitting (no reuse, no isolated state). Pure structural marker, not a WHAT-explanation. See `app/components/home/Profile.vue`.
- For components with multiple distinct DOM groups (e.g. a nav bar), add short comments on each group so the template is scannable. Prefix with `Desktop:` / `Mobile:` when a block is breakpoint-specific. Include a one-line WHY on non-obvious dynamic behaviour (e.g. `<!-- Logo: avatar always visible; "JEN" text slides out when scrolled -->`). See `app/components/site/Header.vue`.

## When to extract a composable

Composables exist to serve **reuse, testability, or team coordination** — not to make a single page's `<script setup>` feel shorter. Aesthetic clutter is solved with `// #region` blocks (see below), not with abstraction.

**Extract a composable only when at least one of these is true:**

1. A second consumer (page or component) needs the same state/logic.
2. The logic deserves unit tests independent of the rendering page.
3. The team has multiple people editing the same area and needs ownership boundaries.
4. The file has crossed ~250 lines of `<script setup>` and grouping by region is no longer enough.

If none of the above hold, **inline it**. A linear `<script setup>` of 100–200 lines that reads top-to-bottom is more maintainable than three composables that force cross-file jumps to trace one cause-and-effect chain (e.g. "filter changes → cache wipes → posts refetch"). Indirection has a real cost: every hidden watcher inside a composable is invisible to the page reader.

When extraction is justified, follow VueUse's split: a **pure** composable (only `ref`/`reactive`/`computed`/`watch`/plain JS, accepts refs/values as parameters via `MaybeRefOrGetter`) is preferred over a **Nuxt-bound** one (calls setup-only APIs like `useRoute`, `useAsyncData`, `useState`). When both concerns exist, keep the Nuxt-bound calls in the consuming page and feed their refs into the pure composable as arguments. This keeps the pure layer testable with plain Vitest, no `@nuxt/test-utils` setup.

## Working Preferences

- **UI verification** — always verify visual changes with a headless browser screenshot before declaring done; typecheck/grep alone is not sufficient.
- **Parallel components** — when asked to create a NEW or parallel component, create it standalone; never read or modify the existing component unless explicitly told to.
- **No fake fixes** — never mask a bug (e.g. hardcoding a colour to hide a transparency issue); diagnose and fix the actual root cause.
- **Failing processes** — after 2 failed attempts to start a local process (dev server, locked DB), stop and ask the user how to proceed.
- **Commits** — never commit unless the user explicitly asks; the user reviews changes before committing.

## Region comments for long `<script setup>`

When a page's `<script setup>` grows past ~80 lines and still belongs to a single concern, group related state/logic with `// #region <Name>` ... `// #endregion` blocks instead of extracting composables prematurely. The IDE folds them, readers can scan section headers as a table of contents, and the data flow stays linear in one file. Typical regions for a CRUD-style page: `Filter state`, `Taxonomies`, `Pagination + posts`, `URL sync`, `UI state`, `Helpers`. See `app/pages/blogs/index.vue` for reference.
