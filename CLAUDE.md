# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Commands

This project uses [Vite+](https://viteplus.dev/guide/) (`vp`) as unified toolchain. Run `vp help` for full command list.

```bash
# Development
pnpm dev          # Start Nuxt dev server at http://localhost:3000
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

**jen-lab** = Nuxt 4 personal site for "榛知雪梨". Four top-level routes:

- `/` — Caldera-styled landing page.
- `/about` — single-page bio.
- `/blogs` + `/blogs/[...slug]` — WordPress-backed blog list + detail.
- `/my-best-restaurants-search-in-sydney` — Sydney restaurant map.

Deploys to **Cloudflare Pages** via Wrangler, `cloudflare-pages` Nitro preset. `@nuxt/content` uses D1 in production (`NUXT_CONTENT_DB=d1`), in-memory SQLite in dev (powers `wpCategories` / `wpTags` collections synced via `pnpm sync:wp`).

### Landing page (`/`)

`app/pages/index.vue` — Caldera-vocabulary landing assembled from Nuxt UI v4 primitives + custom decorative SVGs:

- **Hero** — `UPageHero` variant with Opera House SVG watermark + `UMarquee` bottom strip.
- **Stats** — `UPageGrid` of `UPageCard` (4-col → 2 → 1).
- **Features** — asymmetric `md:grid-cols-12` two-row layout (`HomeHarbourBridgeSvg` / `HomeOperaHouseSvg`).
- **Use-case tabs** — `UTabs` with `HomeGlyphSvg` illustration panel per tab.
- **Tech stack** — `UPageGrid` of icon + caption cards.
- **Testimonials** — 3-col `UPageGrid` with `HomeGlyphSvg` avatars.
- **Blog carousel** — `SnapCarousel` (custom scroll component) pulling live WP posts via `fetchPosts`.
- **Newsletter** — bare `<form>` inside a dark `UPageSection`-style band.

All wrapped in a single `container mx-auto max-w-[1200px]` div (no `SitePageContainer` — homepage has full-bleed sub-sections that need to break out).

### About (`/about`)

`app/pages/about.vue` — Caldera-styled bio page using `<SitePageContainer>`:

- `UPageHero` (horizontal, ash-white) + `HomeOperaHouseSvg`.
- `UPageGrid` 3 facet cards (Origin / Workshop / Outside) with `HomeGlyphSvg`.
- Dark "Now" band.
- `UPageHero` CTA strip (cyber-violet).

### Blog (`/blogs`, `/blogs/[...slug]`)

Restored from `app/pages_backup/blogs/` and restyled. Data comes from the **WordPress REST API** (`~/utils/wpApi`) — not `@nuxt/content`. Both pages use `<SitePageContainer>`.

- `app/pages/blogs/index.vue` — `UPageHeader` + `BlogTopBar` (search/filter) + `BlogPostCard` grid + `UPagination`. Filter state managed by `useBlogList` composable; taxonomy data from `wpCategories` / `wpTags` content collections.
- `app/pages/blogs/[...slug].vue` — `UPageHeader` with date pill + optional featured image + `<article class="prose wp-content">` rendered via `v-html`.

### Restaurants

- `app/assets/data/pages/restaurants.ts` — static `categories[]` + `restaurants[]` dataset.
- `app/composables/useRestaurants.ts` — central state. **Intentional** `useLazyAsyncData` + `await import('...restaurants')`: Vite emits the dataset as its own chunk, kept out of the route chunk; the page shell paints before the dataset arrives. Do NOT replace with a static top-level import.
- `app/pages/my-best-restaurants-search-in-sydney.vue` — search bar + filter modal (area/category) + Leaflet map + scrollable list. Selected restaurant pinned to list top with teal ring.
- `app/components/MapView.vue` — Leaflet map in `<ClientOnly>` (SSR-safe). Emits `select` on marker click.
- `app/components/RestaurantCard.vue` — card UI.
- `app/components/FilterItem.vue` — reusable filter pill.

### Design tokens

Caldera-derived tokens live in `app/assets/css/theme.css` (extracted from caldera.xyz; three `tracking-*` values patched from `px → em`). `app/assets/css/main.css` layers semantic aliases on top:

```css
--radius-card   → --radius-caldera-card
--radius-input  → --radius-caldera-input
--radius-button → --radius-caldera-pill
--font-display  → "Bebas Neue" (self-hosted via @nuxt/fonts)
--font-sans     → "Inter"      (self-hosted via @nuxt/fonts)
```

Nuxt UI color slots mapped in `app/app.config.ts`: `primary = digital-orange`, `secondary = cyber-violet`, `neutral = abyssal-ink`. Light mode only — dark mode disabled.

### Shared layout components

- `app/layouts/default.vue` — sticky animated nav (collapses to pill on scroll) + `SiteFooter` + skip-to-main link.
- `app/components/site/Footer.vue` — dark `bg-abyssal-ink` footer with `UFooterColumns` + social buttons from `appConfig.contacts`.
- `app/components/site/PageContainer.vue` — `container mx-auto max-w-[1200px] px-4 py-10 space-y-10` wrapper. Used by `/about`, `/blogs`, `/blogs/[...slug]`. Do **not** use on the homepage (it manages its own container to support full-bleed sections).

### Decorative SVGs

All in `app/components/home/` — Sydney / Australia motif, two-tone (`cyber-violet` + `digital-orange`), always `aria-hidden="true"`:

- `HomeOperaHouseSvg` — Opera House sails silhouette.
- `HomeHarbourBridgeSvg` — Harbour Bridge arc.
- `HomeWaveSvg` — wave.
- `HomeGlyphSvg` — icon set (`kind`: `gum-leaf | terminal | book | compass | coffee | surf | ferris | sail`).

### UI stack

- **@nuxt/ui v4** (Reka UI) + **Tailwind CSS v4**.
- **Leaflet** for the map; always wrapped in `<ClientOnly>`.
- `app/assets/css/main.css` — global CSS entry point.
- `app/app.config.ts` — `ui` color slots + `contacts[]` (label/url/icon/hoverClass) + `blog` metadata.
- Auto-imports follow directory: `app/components/home/GlyphSvg.vue` → `<HomeGlyphSvg>`.

### MDC bundle hygiene

- `mdc.highlight: false` and `content.build.markdown.highlight: false` in `nuxt.config.ts` — markdown has no fenced code blocks, so Shiki's oniguruma WASM (~600 KB) and language grammars (~900 KB) are skipped from the client bundle. Re-enable if a code block is ever introduced into `content/**.md`.

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
