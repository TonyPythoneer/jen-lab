# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages
```

## Architecture

**jen-lab** = Nuxt 4 app — restaurant map for "榛知雪梨" (personal food map). Deploys to **Cloudflare Pages** via Wrangler, `cloudflare-pages` Nitro preset.

### Key structure

- `app/assets/data/restaurants.ts` — static data: `categories[]` and `restaurants[]`. All restaurant/category data here.
- `app/composables/useRestaurants.ts` — central state composable. Enriches restaurants with category data at module load (not reactive). Exposes `selectedArea`, `selectedCategoryId`, `searchedName`, `selectedRestaurantId`, `filteredRestaurantList`.
- `app/pages/index.vue` — single page: search bar + filter modal (area/category) + Leaflet map + scrollable restaurant list. Selected restaurant pinned to list top with teal ring.
- `app/components/MapView.vue` — Leaflet map in `<ClientOnly>` (SSR-safe). Emits `select` on marker click.
- `app/components/RestaurantCard.vue` — card UI for individual restaurants.
- `app/components/FilterItem.vue` — reusable filter pill button.

### UI stack

- **@nuxt/ui v4** (Reka UI) + **Tailwind CSS v4** for components/styling.
- **Leaflet** for map; `<ClientOnly>` avoids SSR issues.
- `app/assets/css/main.css` — global CSS entry point.

### Data flow

`restaurants.ts` → `useRestaurants` (enriches + exposes filters) → `index.vue` (filter UI + list) + `MapView` (markers filtered by same list).

## Code Style

- Prefer full config path over destructured aliases: use `pages.home.items` not `home.items` or `items`. Keeps data origin visible in templates.