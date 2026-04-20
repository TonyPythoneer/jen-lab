# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Build for production (Cloudflare Pages)
pnpm preview      # Build + preview locally with wrangler
pnpm deploy       # Build + deploy to Cloudflare Pages
```

## Architecture

**jen-lab** is a Nuxt 4 app — a restaurant map for "榛知雪梨" (a personal food map). It deploys to **Cloudflare Pages** via Wrangler with the `cloudflare-pages` Nitro preset.

### Key structure

- `app/assets/data/restaurants.ts` — static data source: `categories[]` and `restaurants[]` arrays. All restaurant/category data lives here.
- `app/composables/useRestaurants.ts` — central state composable. Enriches restaurants with category data at module load time (not reactively). Exposes filtering state (`selectedArea`, `selectedCategoryId`, `searchedName`, `selectedRestaurantId`) and `filteredRestaurantList`.
- `app/pages/index.vue` — single page: search bar + filter modal (area/category) + Leaflet map + scrollable restaurant list. Selected restaurant is pinned to top of list with a teal ring.
- `app/components/MapView.vue` — Leaflet map wrapped in `<ClientOnly>` (SSR-safe). Emits `select` when a marker is clicked.
- `app/components/RestaurantCard.vue` — card UI for individual restaurants.
- `app/components/FilterItem.vue` — reusable filter pill button.

### UI stack

- **@nuxt/ui v4** (Reka UI) + **Tailwind CSS v4** for components and styling.
- **Leaflet** for the map; wrapped in `<ClientOnly>` to avoid SSR issues.
- `app/assets/css/main.css` — global CSS entry point.

### Data flow

`restaurants.ts` → `useRestaurants` (enriches + exposes filters) → `index.vue` (filter UI + list) + `MapView` (markers filtered by same list).
