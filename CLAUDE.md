# CLAUDE.md

## Constitution

- Professionalism
  - Must use **plain English** in code & comments regardless of how complex the logic is, as if writing for a 15–18-year-old.
    - **WHY** - so any human can step in without explanation
  - Must refine any code & comments I write to **plain English**.
  - Must stop inflating code and comments as you must validate them and ensure they are concise and succinct
  - Must review your output and simplify it as much as possible through self-reflection and rumination.
- UI testing
  - Must predict **style** & **animation** by calculating first. No browser when the resulting screen is calculable.
  - When you **cannot** predict the resulting screen by calculation, driving **webwright / Playwright in the background** is your last step. This is the single path for **all** visual verification — style, animation, and interaction alike. Use the **webwright** skill (`/webwright:run` for one-shot, `/webwright:craft` for reusable); it drives a local Playwright browser and saves screenshots + an action log as evidence.
  - Verify the change in webwright and `Read` the captured screenshot before declaring done. Typecheck, grep, lint, and code-reading do **not** count as visual verification. Applies to: style edits, layout/proportion changes, new components rendered on a page, animation end-states, interactions (hover, click, scroll, form-fill, modals), and any change a user would notice with their eyes.
    - **Violation**: editing tokens, running `pnpm check`, and reporting "done" without verifying the route in webwright.
    - **Violation**: building a click-to-flip card and stopping at "the code compiles" without ever rendering it.
  - If the change has no visible route, say so explicitly and ask which route to verify — do not skip verification silently.
- Else
  - Must respond in the language based on `language` field from `~/.claude/settings.json`.

## Commands

```bash
# Vue/Nuxt development
pnpm dev          # Dev server at :3500 — user runs it; NEVER start/kill, assume it's already running
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages

# development scripts
pnpm sync:wp      # Sync tags and categories from WordPress
# Visual verification: drive webwright/Playwright in the background, then Read the captured screenshot (see "UI testing")

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

- RWD: desktop and mobile only — no tablet breakpoints. On elements visible only on mobile (e.g. `md:hidden`), add `<!-- Mobile -->`; no comment means it serves all breakpoints.

- Else
  - [Region comment] When a `<script setup>` gets long but still does one thing, use `// #region <Name>` ... `// #endregion` to group related logic instead of splitting it into composables too early.
  - Ask approval from the user to read `./node_modules/<package>` for the latest info if you can't figure it out, as you must not access the internet.
  - **Ambiguous visual terms** — before editing, resolve any spatial/visual term that has more than one plausible CSS mapping. Restate your interpretation in one line and proceed only if it is unambiguous; otherwise ask.
    - Chinese spatial words to always pin down: `粗` (wider stroke vs. longer span?), `厚` (border vs. padding vs. shadow?), `重` (font-weight vs. color contrast?), `濃` (saturation vs. opacity?), `高` (height vs. z-index?), `滿` (full-bleed vs. 100% width?), `跑掉` (overflow vs. wrap vs. position drift?).
    - **Violation**: user says "弧線太粗", Claude lengthens the arc instead of increasing `stroke-width`.
    - **Violation**: user says "顏色疊在一起", Claude changes colors when the real issue is a layout height bug.
    - When a complaint could be layout _or_ color _or_ z-index, screenshot first, identify the actual symptom, then act.

## Code Style

- 2-space indent for Vue and TypeScript. Configured in `.zed/settings.json` for the Zed IDE.
- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.
- No hardcoded strings in Vue templates for domain identifiers/labels/keys. Define constants in `<script setup>` and bind via `:id`, `:label`, etc. Variant prop literals (e.g. `<UButton color="neutral">`, `<HomeSprite half="left">`) are part of the component contract and stay inline.
- Default to no comments. Add a comment only when the WHY is non-obvious — a hidden constraint, an intentional non-idiom (e.g. lazy chunk-split intent in `useRestaurants`), or a workaround tied to a library internal.
- Exception: in Vue templates, label implicit sub-components with a one-word section comment (e.g. `<!-- Banner -->`, `<!-- Contacts -->`) when the template contains multiple distinct visual regions but extracting them into separate `.vue` files would be over-splitting (no reuse, no isolated state). Pure structural marker, not a WHAT-explanation. See `app/components/home/Profile.vue`.
- For components with multiple distinct DOM groups (e.g. a nav bar), add short comments on each group so the template is scannable. Prefix with `Desktop:` / `Mobile:` when a block is breakpoint-specific. Include a one-line WHY on non-obvious dynamic behaviour (e.g. `<!-- Logo: avatar always visible; "JEN" text slides out when scrolled -->`). See `app/components/site/Header.vue`.

## Working Preferences

- **Parallel components** — when asked to create a NEW or parallel component, create it standalone. Do **not** Read, Grep, or open the original file — not even "for reference" — unless the user explicitly says so.
  - **Violation**: user says "做一個 SectionBlog3D2", Claude opens `SectionBlog3D.vue` to copy structure.
  - If a shared type or constant is genuinely needed from the original, ask first; do not read preemptively.
- **No fake fixes (偷吃步)** — never mask a symptom to make a screenshot look right; diagnose the actual root cause.
  - **Violation**: cup renders with wrong transparency, Claude sets `background-color` to match the page background instead of fixing alpha/blend mode.
  - **Violation**: text overflows, Claude shortens the text instead of fixing the container.
  - **Violation**: hardcoding a computed value (color, position, size) that should come from a token, prop, or layout rule, just to ship.
  - If you are about to write a literal value that papers over a real bug, stop and surface the root cause to the user.
- **Failing processes** — after 2 failed attempts to start a local process (dev server, locked DB), stop and ask the user how to proceed.
- **Commits** — never commit unless the user explicitly asks; the user reviews changes before committing.
