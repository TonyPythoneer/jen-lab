# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Reminders

See `docs/claude/reminders.md` for session-level reminders (language, behaviour constraints).

## Commands

This project uses [Vite+](https://viteplus.dev/guide/) (`vp`) as unified toolchain. Run `vp help` for full command list.

```bash
# Development
pnpm dev          # Start Nuxt dev server at http://localhost:3500
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages
pnpm analyze      # Bundle analyzer (no serve)

# Validation (run before committing)
vp install        # Install dependencies
vp check          # Lint + format + typecheck in one pass
vp test           # Run tests (Vitest)

# Other
pnpm typecheck    # Nuxt typecheck only (also covered by vp check)
pnpm sync:wp      # Sync WordPress content
```

> `vp dev` / `vp build` do NOT replace `pnpm dev` / `pnpm build` — Nuxt has its own pipeline.

## Architecture

Nuxt 4 personal site for "榛知雪梨", deployed to **Cloudflare Pages**. Four routes: `/` (landing), `/about`, `/blogs` + `/blogs/[...slug]` (WordPress REST API), `/my-best-restaurants-search-in-sydney` (Leaflet map).

**Non-obvious constraints:**

- `SitePageContainer` — do **not** use on `/` (homepage manages its own container for full-bleed sections). Use on all other pages.
- `useRestaurants.ts` — intentional `useLazyAsyncData` + dynamic `import()`: keeps the dataset out of the route chunk. Do NOT replace with a static top-level import.
- `MapView.vue` — Leaflet must stay inside `<ClientOnly>` (SSR-unsafe).
- `mdc.highlight: false` in `nuxt.config.ts` — disables Shiki WASM (~1.5 MB). Re-enable only if fenced code blocks are added to content.
- Light mode only — dark mode disabled in `app.config.ts`.

## Dev Server

**Never start, restart, or kill the dev server.** The user manages `pnpm dev` themselves. Assume it is already running on `http://localhost:3500` when UI verification is needed.

## UI Testing

All UI verification must use a **headless browser running in the background** — never rely on computer-use screenshots or manual browser navigation.

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:3000/YOUR_ROUTE');
  await p.waitForLoadState('networkidle');
  await p.screenshot({ path: '/tmp/verify.png', fullPage: true });
  await b.close();
})();
"
```

- Always run the screenshot command with `run_in_background: false` so the image is ready before reading.
- Read `/tmp/verify.png` with the Read tool to inspect the result visually.

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

## Region comments for long `<script setup>`

When a page's `<script setup>` grows past ~80 lines and still belongs to a single concern, group related state/logic with `// #region <Name>` ... `// #endregion` blocks instead of extracting composables prematurely. The IDE folds them, readers can scan section headers as a table of contents, and the data flow stays linear in one file. Typical regions for a CRUD-style page: `Filter state`, `Taxonomies`, `Pagination + posts`, `URL sync`, `UI state`, `Helpers`. See `app/pages/blogs/index.vue` for reference.
