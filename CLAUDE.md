# CLAUDE.md

## Constitution

- Professionalism
  - Must use **plain English** in code & comments regardless of how complex the logic is, as if writing for a 15–18-year-old.
  - When adding or modifying code & comments, refine any existing ones in the same scope to **plain English** if they aren't already.
- Must respond in the language based on `language` field from `~/.claude/settings.json`.
- UI testing
  - Must predict **style** & **animation** by calculating. No computer-use or headless browser for help.
  - Must use headless browser to verify **UI interactions** if debugging is inefficient or involves too much back and forth.
  - Must verify all visual changes before declaring done in changing styles, animations, or UI interactions.

## Commands

```bash
# Vue/Nuxt development
pnpm dev          # Dev server at :3500 — user runs it; NEVER start/kill, assume it's already running
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages

# development scripts
pnpm sync:wp      # Sync tags and categories from WordPress
pnpm ai:screenshot <route>  # Capture the page to /tmp/verify.png — always run_in_background: false, then Read the file

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

## AI Development

- Nuxt
  - Must use `useLazyAsyncData` instead of `useAsyncData` to avoid blocking UI rendering.
  - Composables
    - Extract when logic is **shared across components**, needs **independent unit tests**, or needs clear **ownership boundaries** between team members. Otherwise inline it.
    - Prefer a **pure** composable (`ref`/`computed`/`watch`/plain JS, accepts `MaybeRefOrGetter`) over a **Nuxt-bound** one. Keep Nuxt-bound calls (`useRoute`, `useState`) in the page; feed their refs into the pure composable.

- Else
- - [Region comment] When a `<script setup>` gets long but still does one thing, use `// #region <Name>` ... `// #endregion` to group related logic instead of splitting it into composables too early.
  - Ask approval from the user to read `./node_modules/<package>` for the latest info if you can't figure it out, as you must not access the internet.

## Code Style

- 2-space indent for Vue and TypeScript. Configured in `.zed/settings.json` for the Zed IDE.
- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.
- No hardcoded strings in Vue templates for domain identifiers/labels/keys. Define constants in `<script setup>` and bind via `:id`, `:label`, etc. Variant prop literals (e.g. `<UButton color="neutral">`, `<HomeSprite half="left">`) are part of the component contract and stay inline.
- Default to no comments. Add a comment only when the WHY is non-obvious — a hidden constraint, an intentional non-idiom (e.g. lazy chunk-split intent in `useRestaurants`), or a workaround tied to a library internal.
- Exception: in Vue templates, label implicit sub-components with a one-word section comment (e.g. `<!-- Banner -->`, `<!-- Contacts -->`) when the template contains multiple distinct visual regions but extracting them into separate `.vue` files would be over-splitting (no reuse, no isolated state). Pure structural marker, not a WHAT-explanation. See `app/components/home/Profile.vue`.
- For components with multiple distinct DOM groups (e.g. a nav bar), add short comments on each group so the template is scannable. Prefix with `Desktop:` / `Mobile:` when a block is breakpoint-specific. Include a one-line WHY on non-obvious dynamic behaviour (e.g. `<!-- Logo: avatar always visible; "JEN" text slides out when scrolled -->`). See `app/components/site/Header.vue`.

## Working Preferences

- **Parallel components** — when asked to create a NEW or parallel component, create it standalone; never read or modify the existing component unless explicitly told to.
- **No fake fixes** — never mask a bug (e.g. hardcoding a colour to hide a transparency issue); diagnose and fix the actual root cause.
- **Failing processes** — after 2 failed attempts to start a local process (dev server, locked DB), stop and ask the user how to proceed.
- **Commits** — never commit unless the user explicitly asks; the user reviews changes before committing.
