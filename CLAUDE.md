# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages
pnpm typecheck    # nuxt typecheck
pnpm analyze      # Bundle analyzer (no serve)
```

## Architecture

**jen-lab** = Nuxt 4 personal site for "榛知雪梨". Two top-level surfaces:

- `/` — profile site (Jen Knows / Jen Liu profile tabs, content-driven via `@nuxt/content`).
- `/my-best-restaurants-search-in-sydney` — Sydney restaurant map (filterable Leaflet map + list).

Deploys to **Cloudflare Pages** via Wrangler, `cloudflare-pages` Nitro preset. `@nuxt/content` uses D1 in production (`NUXT_CONTENT_DB=d1`), in-memory SQLite in dev.

### Home (profile site)

- `app/pages/index.vue` — profile switcher (`UTabs`) + `HomeProfile` card + `HomeContentBody` + `HomeToc` rail. Pre-fetches both profiles via `useLazyAsyncData` keyed `profile:<key>` so tab switching is instant.
- `content/home/jen-knows.md`, `content/home/jen-liu.md` — markdown front-matter drives a typed `home` collection (see `content.config.ts`).
- `content.config.ts` — `homeSchema` defines `profile` + `sections[]` as a discriminated union on `section.component`:
  - `portal-list` → `<HomePortal>` link cards
  - `youtube-carousel` → `<HomeYoutubeCarousel>` (clickable thumbnails → fullscreen iframe modal)
  - `image-carousel` → `<HomeImageCarousel>` (zoom modal)
  - `product-list` → `<HomeProduct>` (collapsible markdown description + CTA)
- `app/components/home/ContentBody.vue` — section dispatch by `section.component`.
- `app/components/home/Toc.vue` — `UContentToc` with `highlight`. Dual-mode layout (sm+ fixed rail, max-sm sticky strip) achieved via `:deep` slot-display swap with `!important` overrides; required because `UContentToc` ships a single mobile-first disclosure markup.
- `app/pages/index.vue:94-97` — watches `navLinks`; calls `nuxtApp.callHook('page:transition:finish')` on profile switch so `UContentToc`'s internal scroll-spy re-measures section offsets after the section list changes.
- `nuxt.config.ts` `content:file:afterParse` hook — pre-renders `product.description` (markdown) → `descriptionHtml` at build time via `markdown-it`. Keeps the parser out of the client bundle; component `v-html`s the trusted local HTML.

### Restaurants

- `app/assets/data/pages/restaurants.ts` — static `categories[]` + `restaurants[]` dataset.
- `app/composables/useRestaurants.ts` — central state. **Intentional** `useLazyAsyncData` + `await import('...restaurants')`: Vite emits the dataset as its own chunk, kept out of the route chunk; the page shell paints before the dataset arrives. Do NOT replace with a static top-level import.
- `app/pages/my-best-restaurants-search-in-sydney.vue` — search bar + filter modal (area/category) + Leaflet map + scrollable list. Selected restaurant pinned to list top with teal ring.
- `app/components/MapView.vue` — Leaflet map in `<ClientOnly>` (SSR-safe). Emits `select` on marker click.
- `app/components/RestaurantCard.vue` — card UI.
- `app/components/FilterItem.vue` — reusable filter pill.

### UI stack

- **@nuxt/ui v4** (Reka UI) + **Tailwind CSS v4**.
- **Leaflet** for the map; always wrapped in `<ClientOnly>`.
- `app/assets/css/main.css` — global CSS entry point.
- `app.config.ts` — `contacts[]` (label/url/icon/hoverClass) consumed by `HomeProfile`.
- Auto-imports follow directory: `app/components/home/Sprite.vue` → `<HomeSprite>`.

### MDC bundle hygiene

- `mdc.highlight: false` and `content.build.markdown.highlight: false` in `nuxt.config.ts` — markdown has no fenced code blocks, so Shiki's oniguruma WASM (~600 KB) and language grammars (~900 KB) are skipped from the client bundle. Re-enable if a code block is ever introduced into `content/**.md` or product descriptions.

## Code Style

- 2-space indent for Vue and TypeScript. Configured in `.zed/settings.json` for the Zed IDE.
- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.
- No hardcoded strings in Vue templates for domain identifiers/labels/keys. Define constants in `<script setup>` and bind via `:id`, `:label`, etc. Variant prop literals (e.g. `<UButton color="neutral">`, `<HomeSprite half="left">`) are part of the component contract and stay inline.
- Default to no comments. Add a comment only when the WHY is non-obvious — a hidden constraint, an intentional non-idiom (e.g. lazy chunk-split intent in `useRestaurants`), or a workaround tied to a library internal.
- Exception: in Vue templates, label implicit sub-components with a one-word section comment (e.g. `<!-- Banner -->`, `<!-- Contacts -->`) when the template contains multiple distinct visual regions but extracting them into separate `.vue` files would be over-splitting (no reuse, no isolated state). Pure structural marker, not a WHAT-explanation. See `app/components/home/Profile.vue`.

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
