# CLAUDE.md

> **Stack:** Vue 3 + Vite (vite-plus, vite-ssg, Velite, reka-ui), deployed to Cloudflare Pages.
>
> **UI layer:** components live in **`src/components/ui/<category>/`** (`element` / `navigation` / `overlay` / `page` / `utility`) and are referenced with **NO prefix** — `<Button>`, `<Modal>`, `<Slideover>`, `<Tabs>`, `<Pagination>`, `<Popover>`, `<Badge>`, `<Skeleton>`, `<PageHeader>`, `<Icon>`, `<ClientOnly>` (unplugin-vue-components `globalNamespaces` strips the folder segments).
>
> - **Interactive** components wrap **`reka-ui`** headless primitives — `Modal`/`Slideover` → `Dialog`, `Tabs` → `Tabs`, `Pagination` → `Pagination`, `Popover` → `Popover` — so focus trap, Esc, keyboard nav, ARIA, and scroll-lock come built in.
> - **Native** components (`Button`, `Badge`, `Icon`, `Skeleton`, `PageHeader`) are plain elements + Tailwind.
> - **Variants:** plain TS maps merged via `cn()` (`src/lib/utils.ts` = `clsx` + `tailwind-merge`); `Button`/`Badge` use **cva**. Load-bearing deps: `reka-ui`, `clsx`, `tailwind-merge`, `class-variance-authority`.

## Constitution

- Professionalism — comments & docs serve two readers at once
  - **WHY**: for humans, good text carries judgment — it gives direction and drives action. For machines, it IS the prompt — stale or bloated text poisons every future session.
  - Must use **plain English** in code & comments regardless of how complex the logic is, as if writing for a 15–18-year-old.
  - **Code explains itself first**: spend effort on naming (balanced against name length) before reaching for a comment.
  - **A comment states its function in 1–2 lines.** Examples (usage commands, code snippets) are exempt. A 3rd line is a signal: compress it or improve the naming.
  - **Forward-looking only**: state the present constraint, never the history behind it. Ban "the old X", "was removed", "used to", change-log narration, and tuning-option tables.
  - Must review your output and simplify it before declaring done.
- UI testing
  - Must predict **style** & **animation** by calculating first. No browser when the resulting screen is calculable.
  - When you **cannot** predict the resulting screen by calculation, driving **webwright / Playwright in the background** is your last step. This is the single path for **all** visual verification — style, animation, and interaction alike. Use the **webwright** skill (`/webwright:run` for one-shot, `/webwright:craft` for reusable); it drives a local Playwright browser and saves screenshots + an action log as evidence.
  - Verify the change in webwright and `Read` the captured screenshot before declaring done. Typecheck, grep, lint, and code-reading do **not** count as visual verification. Applies to: style edits, layout/proportion changes, new components rendered on a page, animation end-states, interactions (hover, click, scroll, form-fill, modals), and any change a user would notice with their eyes.
    - **Violation**: editing tokens, running `pnpm check`, and reporting "done" without verifying the route in webwright.
    - **Violation**: building a click-to-flip card and stopping at "the code compiles" without ever rendering it.
  - If the change has no visible route, say so explicitly and ask which route to verify — do not skip verification silently.
- Git flow
  - Every development branch opens its PR against **`develop`**, never `main`. `main` only receives merges from `develop`.
  - `develop` and `main` are PR-protected — never direct-push to either; always branch + PR.
- CI/CD triggers — allowlist only
  - **Every workflow declares its required inputs as a `paths` allowlist; never `paths-ignore`.** A workflow's trigger answers "what do I depend on" — anything not listed is none of its business. Allowlists track the build's (closed, stable) input set; deny lists chase the repo's (open, ever-growing) noise set.
  - A new build-input directory must be added to **all** path-filtered workflows together (`cd-deploy`, `ci-app-test`, `ci-bundle-size`, `ci-bundle-baseline`, `ci-vize-experiment`).
  - `guard-*` workflows stay unfiltered — they are required checks; a path filter would leave merges stuck on "Expected".
- Accessibility
  - **Build for accessibility by leaning on `reka-ui` headless primitives** — they provide focus management, keyboard navigation, and ARIA. Do NOT hand-roll overlays/menus/tabs from raw `<div>`/`<button>` + `<Teleport>`; reach for the matching reka-ui primitive (`Dialog`, `Tabs`, `Popover`, `Pagination`, …) so the a11y is built in. Keep native elements (`<button>`, `<a>`) native — never replace them with `<div>`.
- Else
  - Must respond in the language based on `language` field from `~/.claude/settings.json`.

## Commands

```bash
# Vue 3 + Vite development
pnpm dev          # :3500. Port via DEV_PORT env (DEV_PORT=3600 pnpm dev for a 2nd worktree). Runs velite --watch & vp dev in parallel. Also exposes /__inspect/ (vite-plugin-inspect). Check lsof before starting a duplicate.
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally
pnpm deploy       # Build + deploy to Cloudflare Pages

# Storybook — component preview (standalone)
pnpm storybook        # Component preview at :6006

# development scripts
pnpm sync:wp      # Sync tags and categories from WordPress
# Visual verification: drive webwright/Playwright in the background, then Read the captured screenshot (see "UI testing")

# Validation (run after changes)
pnpm check        # Lint + format + typecheck
pnpm test         # Run tests (Vitest)
```

## Architecture

Vue 3 + Vite personal site for "榛知雪梨", deployed to **Cloudflare Pages**. Prerendered routes (via `vite-ssg`): `/` (landing), `/jen-knows` + `/jen-liu` (profile pages, both render `ProfilePage`), `/blogs` + `/blogs/[...slug]` (Velite content), `/sydney-food-map` (Leaflet map).

**Non-obvious constraints:**

- `SitePageContainer` — do **not** use on `/` (homepage manages its own container for full-bleed sections). Use on all other pages.
- `useRestaurants.ts` — intentional dynamic `import()`: keeps the dataset out of the route chunk. Do NOT replace with a static top-level import.
- Leaflet is SSR-unsafe — any Leaflet-rendering component must stay inside `<ClientOnly>` (see `FoodMapApp.vue`, which wraps the `FoodMapCanvas` map stage).
- Light mode only (enforced in component themes).

## Storybook

Standalone `@storybook/vue3-vite`, dev-server only (`pnpm storybook`, port via `STORYBOOK_PORT`). Intentionally NO `build-storybook` script — the rolldown prod build fails on the Storybook path; the dev server compiles fine.

- **Isolated pipeline:** `framework.options.builder.viteConfigPath` points at `.storybook/vite.config.ts`; the app's `vite.config.ts` never loads into Storybook. Shared bits (auto-import presets, ui globalNamespaces) come from `configs/vite/sharedPipeline.ts` — edit there, never copy.
- **Real runtime, no mocks:** `preview.ts` installs a memory-history vue-router, `@unhead/vue/client` head, and registers the generated offline icon subsets — stories run the same APIs as the app. `#velite` resolves via `package.json#imports` (the storybook script runs `velite build` first).
- **Stories co-locate** with components: `Foo.vue` ↔ `Foo.stories.ts`, title = `"<dir>/<Name>"` (e.g. `ui/element/Button`).
- **Story style:** args-first CSF3 — shared defaults in `meta.args`/`meta.render`, `fn()` from `storybook/test` for emitted events, brand tokens only (no raw gray/blue utilities), no background-only wrappers (global brand `backgrounds` defaults to the canvas token).
- **Runtime template strings skip unplugin-vue-components** — a story template referencing another project component (e.g. `<Button>`) must import and register it in the render's `components` explicitly.
- **`// @ts-nocheck` required** on every story file — `@storybook/vue3-vite`'s `StoryObj<>` inference doesn't align with vite-plus's TS setup; stories are dev-only.
- **Import from `@storybook/vue3-vite`** (not `@storybook/vue3`).
- **`Section*` components** get a `Default` story (bare component) + an `InPage` story (wrapped in `min-h-dvh`) for RWD viewport testing (viewports: mobile 390 / desktop 1440 only).
- **Overlay stories render open** (`open: true` args or the real composable — SearchModal opens via `useBlogSearch().openSearch()`) so the canvas is never blank.
- **`@storybook/addon-a11y`** gives a per-story axe panel — check it when touching ui/ primitives.
- **Brand tokens** (`--color-digital-orange`, etc.) load via `theme.css`. UI components style themselves with plain TS maps + `cn()` + brand-token utilities (`Button`/`Badge` use cva).
- **Single source for site config**: `src/config/site.ts` (consumed by `main.ts`, `vite.config.ts`, and runtime components like `Footer`). Change colors/contacts there only.
- **`src/storybook/StoryWrapper.vue`** wraps every story in a plain `<div class="isolate">` — reka-ui overlays/popovers need no app-level provider.

## Component Organization

**Directory = route domain**, with two cross-cutting exceptions: **`ui/`** (headless-UI primitives) and **`shared/`** (cross-domain pieces). Each route subdirectory maps to the route it serves; auto-import uses the directory as the component prefix — EXCEPT the `ui/<category>/` folders, which are stripped to bare names (see UI layer above).

| Directory   | Serves                                                                  |
| ----------- | ----------------------------------------------------------------------- |
| `site/`     | All pages (global layout)                                               |
| `home/`     | `/`                                                                     |
| `blog/`     | `/blogs`, `/blogs/[slug]`                                               |
| `food-map/` | `/sydney-food-map`                                                      |
| `profile/`  | `/jen-knows`, `/jen-liu`                                                |
| `shared/`   | Cross-domain reusable primitives                                        |
| `ui/`       | Headless-UI primitives — `ui/<category>/` → bare `<Button>`/`<Modal>`/… |

**`Section` prefix = page consumes it directly.** A `Section*` component is a full-width block rendered inside `pages/`. No prefix = sub-component consumed by another component, not a page.

**No version suffixes.** Never use `V2`, `V3` in filenames. Use a feature branch for parallel versions during development.

## AI Development

- Composables
  - Extract when logic is **shared across components**, needs **independent unit tests**, or needs clear **ownership boundaries** between team members. Otherwise inline it.
  - Prefer a **pure** composable (`ref`/`computed`/`watch`/plain JS, accepts `MaybeRefOrGetter`) over a **router-bound** one. Keep router calls (`useRoute`, `useRouter`) in the page; feed their refs into the pure composable.

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
- File naming under `src/`: TS modules are **camelCase** — composables (`useRiverBoats.ts`) and plain utils (`geoSimplify.ts`, `foodMapFilters.ts`) alike. Vue components stay PascalCase (`FoodMapCanvas.vue`). A test mirrors its source name (`geoSimplify.ts` → `geoSimplify.test.ts`). No kebab-case for `.ts` modules.
- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.
- No hardcoded strings in Vue templates for domain identifiers/labels/keys. Define constants in `<script setup>` and bind via `:id`, `:label`, etc. Variant prop literals (e.g. `<Button color="neutral" variant="outline">`, `<HomeSprite half="left">`) are part of the component contract and stay inline.
- Default to no comments. Add one only when the WHY is non-obvious — a hidden constraint, an intentional non-idiom (e.g. lazy chunk-split intent in `useRestaurants`), or a library workaround — and keep it to 1–2 lines (see Constitution).
- Exception: in Vue templates, label implicit sub-components with a one-word section comment (e.g. `<!-- Banner -->`, `<!-- Contacts -->`) when the template contains multiple distinct visual regions but extracting them into separate `.vue` files would be over-splitting (no reuse, no isolated state). Pure structural marker, not a WHAT-explanation. See `src/components/profile/Page.vue`.
- For components with multiple distinct DOM groups (e.g. a nav bar), add short comments on each group so the template is scannable. Prefix with `Desktop:` / `Mobile:` when a block is breakpoint-specific. Include a one-line WHY on non-obvious dynamic behaviour (e.g. `<!-- Logo: avatar always visible; "JEN" text slides out when scrolled -->`). See `src/components/site/Header.vue`.

## Design System Quick Reference

Token source of truth: `src/assets/css/theme.css` (raw) + `main.css` (semantic aliases).
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
Note: UI component variant props (`color="neutral"` / `variant="outline"`, defined via TS maps) are component contract — keep them (they are not raw utilities).

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

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
