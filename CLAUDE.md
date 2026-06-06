# CLAUDE.md

> **Migration status (2026-06):** This repo currently runs on **Nuxt 4**. A migration to **pure Vue 3 + Vite** (Vite+, shadcn-vue, Velite) is the active direction; an autonomous attempt was made and **reverted** (it removed Nuxt before the Vue toolchain was complete). The validated plan, the war-room defect analysis, and the hardened-retry guidance live in [issue #57](https://github.com/TonyPythoneer/jen-lab/issues/57). Until that migration lands, all the Nuxt-specific guidance below remains in force.

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
pnpm dev          # :3500. Port via DEV_PORT env (DEV_PORT=3600 pnpm dev for a 2nd worktree). --host 0.0.0.0 = LAN/phone reachable. Check lsof / Nuxt dev-lock before starting a duplicate.
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages

# Storybook — component preview (standalone, not connected to Nuxt)
pnpm storybook        # Component preview at :6006
pnpm build-storybook  # Build static Storybook to storybook-static/

# development scripts
pnpm sync:wp      # Sync tags and categories from WordPress
# Visual verification: drive webwright/Playwright in the background, then Read the captured screenshot (see "UI testing")

# Validation (run after changes)
pnpm check        # Lint + format + typecheck
pnpm test         # Run tests (Vitest)
```

## Architecture

Nuxt 4 personal site for "榛知雪梨", deployed to **Cloudflare Pages**. Prerendered routes: `/` (landing), `/jen-knows` + `/jen-liu` (profile pages, both render `ProfilePage`), `/blogs` + `/blogs/[...slug]` (WordPress REST API), `/sydney-food-map` (Leaflet map). `/styleguide` is an internal dev styleguide — not in the `routeRules` prerender list.

**Non-obvious constraints:**

- `SitePageContainer` — do **not** use on `/` (homepage manages its own container for full-bleed sections). Use on all other pages.
- `useRestaurants.ts` — intentional `useLazyAsyncData` + dynamic `import()`: keeps the dataset out of the route chunk. Do NOT replace with a static top-level import.
- Leaflet is SSR-unsafe — any Leaflet-rendering component must stay inside `<ClientOnly>` (see `FoodMapApp.vue`, which wraps the `FoodMapCanvas` map stage).
- `mdc.highlight: false` in `nuxt.config.ts` — disables Shiki WASM (~1.5 MB). Re-enable only if fenced code blocks are added to content.
- Light mode only — dark mode disabled in `app.config.ts`.

## Storybook

Standalone `@storybook/vue3-vite` (NOT `@nuxtjs/storybook`) — avoids the project's vite-plus/rolldown toolchain. `.storybook/main.ts` folds auto-import and component config into `@nuxt/ui/vite`'s own options (it bundles both plugins; a second instance throws). `@vitejs/plugin-vue` is explicitly registered because vite-plus doesn't add it automatically.

- **Stories co-locate** with components: `Foo.vue` ↔ `Foo.stories.ts`, title = `"<dir>/<Name>"`.
- **`// @ts-nocheck` required** on every story file — `@storybook/vue3-vite`'s `StoryObj<>` inference doesn't align with vite-plus/Nuxt's TS setup; stories are dev-only.
- **Import from `@storybook/vue3-vite`** (not `@storybook/vue3`).
- **`Section*` components** get a `Default` story + an `InPage` story (`parameters: { layout: "fullscreen" }`, wrapped in `min-h-dvh bg-[var(--color-basalt-canvas)]`) for RWD viewport testing.
- **Theme colors** in `main.ts` use Tailwind palette names (`orange`, `violet`, `zinc`) not brand token names — `@nuxt/ui` generates palette shades only for Tailwind colors. Brand tokens (`--color-digital-orange`, etc.) still load via `theme.css`.
- **Single source for site config**: `app/config/site.ts` — both `app.config.ts` and `main.ts` import from here. Change colors/contacts there only.
- **`app/storybook/StoryWrapper.vue`** wraps every story in `<UApp>` via the global decorator.
- **`pnpm build-storybook` known limitation**: fails on `shared/SnapCarousel.vue` because that component uses Vue 3.3 generic SFC syntax (`lang="ts" generic="T extends ..."`), which rolldown (the workspace vite-plus build engine) cannot compile in production mode. The **dev server** (`pnpm storybook`) handles it fine via the incremental compiler. No fix until rolldown adds generic SFC support.

## Component Organization

**Directory = route domain.** Each subdirectory maps to the route it serves. Nuxt auto-import uses the directory as the component prefix.

| Directory   | Serves                           |
| ----------- | -------------------------------- |
| `site/`     | All pages (global layout)        |
| `home/`     | `/`                              |
| `blog/`     | `/blogs`, `/blogs/[slug]`        |
| `food-map/` | `/sydney-food-map`               |
| `profile/`  | `/jen-knows`, `/jen-liu`         |
| `shared/`   | Cross-domain reusable primitives |

**`Section` prefix = page consumes it directly.** A `Section*` component is a full-width block rendered inside `pages/`. No prefix = sub-component consumed by another component, not a page.

**No version suffixes.** Never use `V2`, `V3` in filenames. Use a feature branch for parallel versions during development.

## AI Development

- Nuxt
  - Must use `useAsyncData` instead of `useLazyAsyncData`. All pages are prerendered — data is baked into the HTML payload at build time, so there is no runtime blocking concern. `useLazyAsyncData` only helps when a page is NOT prerendered and you want the shell to paint before data arrives; that case does not exist here.
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
- File naming under `app/`: TS modules are **camelCase** — composables (`useRiverBoats.ts`) and plain utils (`geoSimplify.ts`, `foodMapFilters.ts`) alike. Vue components stay PascalCase (`FoodMapCanvas.vue`). A test mirrors its source name (`geoSimplify.ts` → `geoSimplify.test.ts`). No kebab-case for `.ts` modules.
- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.
- No hardcoded strings in Vue templates for domain identifiers/labels/keys. Define constants in `<script setup>` and bind via `:id`, `:label`, etc. Variant prop literals (e.g. `<UButton color="neutral">`, `<HomeSprite half="left">`) are part of the component contract and stay inline.
- Default to no comments. Add a comment only when the WHY is non-obvious — a hidden constraint, an intentional non-idiom (e.g. lazy chunk-split intent in `useRestaurants`), or a workaround tied to a library internal.
- Exception: in Vue templates, label implicit sub-components with a one-word section comment (e.g. `<!-- Banner -->`, `<!-- Contacts -->`) when the template contains multiple distinct visual regions but extracting them into separate `.vue` files would be over-splitting (no reuse, no isolated state). Pure structural marker, not a WHAT-explanation. See `app/components/profile/Page.vue`.
- For components with multiple distinct DOM groups (e.g. a nav bar), add short comments on each group so the template is scannable. Prefix with `Desktop:` / `Mobile:` when a block is breakpoint-specific. Include a one-line WHY on non-obvious dynamic behaviour (e.g. `<!-- Logo: avatar always visible; "JEN" text slides out when scrolled -->`). See `app/components/site/Header.vue`.

## Design System Quick Reference

Token source of truth: `app/assets/css/theme.css` (raw) + `main.css` (semantic aliases).
Never hardcode a hex/px a token already covers. Light-mode only — never write `dark:*`.

**Colors** — brand tokens as `bg-*` / `text-*` / `border-*`, opacity via `/NN`:

| Token            | Use                          |
| ---------------- | ---------------------------- |
| `basalt-canvas`  | page background              |
| `ash-white`      | card / raised surface        |
| `abyssal-ink`    | primary text + dark surfaces |
| `pure-white`     | text on dark surfaces        |
| `digital-orange` | primary accent, CTA, hover   |
| `cyber-violet`   | secondary accent (Jen Knows) |
| `pixel-glare`    | highlight dots               |
| `sydney-sky`     | hero background              |

**Raw → brand mapping** (use these, never the raw palette):

| Raw                                                                 | Brand                             |
| ------------------------------------------------------------------- | --------------------------------- |
| `text-neutral-400` / `text-gray-400/500`                            | `text-abyssal-ink/50`             |
| `text-gray-700`                                                     | `text-abyssal-ink/70`             |
| `bg-gray-50/100`                                                    | `bg-ash-white`                    |
| `bg-gray-200`                                                       | `bg-basalt-canvas`                |
| `border-neutral/gray-200/300/400`                                   | `border-abyssal-ink/10`           |
| `bg/border/text-gray-900`, `text-black`, `bg-white`, `border-black` | `…-abyssal-ink` / `bg-pure-white` |

**Radius** — semantic aliases, never raw `rounded-xl/2xl` on cards/pills:
`rounded-card` (40px, cards/panels) · `rounded-button` (800px pill, buttons+badges) · `rounded-input` (100px) · `rounded-full` (true circles only). Small radii on non-card/pill elements (e.g. inline images, list rows) may stay.

**Typography:** `font-display` (Bebas Neue) for all h1/h2 — already heavy, never add `font-bold`. `font-sans` (DM Sans) for body. Section heading standard: `font-display tracking-[0.02em] leading-[0.94]`.

**Never:** `dark:*`, raw `text-neutral-*` / `bg-rose-*` / `text-primary-500` utilities, `rounded-xl` on cards, `font-bold` on `font-display`.
Note: Nuxt UI `color="neutral"` / `variant="outline"` props are component contract — keep them (they are not raw utilities).

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
