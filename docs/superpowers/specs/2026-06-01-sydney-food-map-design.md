# Sydney Food Map — Design Spec

**Date:** 2026-06-01  
**Branch:** feat/food-map  
**Status:** approved for implementation

---

## Goal

Add a new page `/sydney-food-map` — a full-bleed atlas-style interactive map of personally visited Sydney restaurants. Ported from the reference prototype at `~/Downloads/jen-good-map(1)/`. The existing `/my-best-restaurants-search-in-sydney` page is untouched.

---

## Architecture

### Page

`app/pages/sydney-food-map.vue`

- `definePageMeta({ layout: false })` — full-bleed, no default site layout
- Dev environment only: `<SiteHeader v-if="isDev" />` via `import.meta.dev`
- Uses `useRestaurants()` for data, passes to `<FoodMapApp>`
- Prerendered via `routeRules: { "/sydney-food-map": { prerender: true } }`

### Components (`app/components/food-map/`)

| Component                  | Responsibility                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FoodMapApp.vue`           | Layout shell — positions all sub-components, owns `<ClientOnly>` wrapper around Leaflet                                                                                                |
| `FoodMapHeader.vue`        | Atlas header bar: ESTD. marks, title, stats (ENTRIES/CHAPTERS computed from props), edition + districts passed as props with hardcoded defaults in the page, lang toggle, RESET button |
| `FoodMapListDrawer.vue`    | Collapsible left drawer — Food/Area tabs, search input, category list with counts, restaurant list within active category                                                              |
| `FoodMapDetailsDrawer.vue` | Right slide-in drawer — restaurant photo, name, category badge, area, priceRange, full description, recommendations chips, Google Maps link                                            |
| `FoodMapStage.vue`         | Leaflet map surface — suburb boundary overlay (GeoJSON from CDN), teardrop pin markers, group hover fade, theme CSS application                                                        |
| `FoodMapThemeMenu.vue`     | Floating theme switcher — 7 themes listed by name, active indicator                                                                                                                    |

### Composables

**`useFoodMapStore.ts`** — module-level reactive UI state (already built):

- `state.tab` (`"food" | "area"`)
- `state.search`
- `state.selectedCategoryId`
- `state.selectedRestaurantId`
- `state.hoveredCategoryId`
- `makeVisibleList(all)` — returns a computed filtered list
- `makeSelectedRestaurant(all)` — returns a computed selected entry
- `reset()` — clears all filters and selection

**`useFoodMapTheme.ts`** — 7 cartographic themes (already built):

- Themes: parchment, engraving, handtint, voyager, topographic, cool, satellite
- Persists active theme to `localStorage` under key `atlas.mapTheme`
- `initFromStorage()` called in `FoodMapApp.vue` `onMounted`

### Data

- Source: `~/assets/data/pages/restaurants.ts` via `useRestaurants()` composable
- No data migration needed — structure is identical to the reference prototype
- `categories` and `filteredRestaurantList` passed as props into `FoodMapApp`

---

## CSS Strategy

`app/assets/css/food-map.css` — scoped to `.food-map-page` wrapper:

- All custom properties prefixed `--fm-*` to avoid collision with global site tokens
- Imported via `<style>@import "~/assets/css/food-map.css"</style>` in the page
- Leaflet container overrides (`.leaflet-container`, tile pane filter, paper-grain overlay) scoped here
- Pin marker styles (`.r-pin`, `.r-pin__glyph`), suburb label styles, drawer layout — all in this file
- Source: ported from reference `styles.css` (672 lines), scoping `:root` → `.food-map-page`

---

## Leaflet Integration

`FoodMapStage.vue` is wrapped in `<ClientOnly>` by `FoodMapApp.vue` (Leaflet is SSR-unsafe).

Mount sequence in `FoodMapStage.vue`:

1. `onMounted`: dynamic `import('leaflet')` + `import('leaflet/dist/leaflet.css')`
2. Create `L.map` with Sydney center `[-33.8675, 151.2080]`, zoom 14
3. Apply initial theme via `applyTheme(theme)`
4. `loadBoundaries()` — fetch suburb GeoJSON from CDN, render as unfilled outlines
5. `buildMarkers(restaurants)` — teardrop `divIcon` pins with category glyph
6. Watch `props.restaurants` → rebuild markers
7. Watch `props.theme` → `applyTheme()`
8. Watch `props.hoveredCategoryId` → `applyHover()` (fade non-matching pins)
9. Watch `props.selectedRestaurantId` → `applySelection()` + `map.panTo()`

Theme application (`applyTheme`):

- Swap tile layer
- Set CSS variables on `.map-surface` element: `--tile-filter`, `--tile-wash`, `--paper-grain-opacity`
- Set theme vars (`--map-boundary`, `--map-label`, etc.)
- Recolor existing boundary layer

---

## Site Header Content (CMS)

`content/site/header.yml` — nav items editable by non-engineers:

```yaml
nav:
  - label: Home
    to: /
  - label: Jen Knows
    to: /jen-knows
  - label: Jen Liu
    to: /jen-liu
  - label: Blogs
    to: /blogs
  - label: Sydney Food Map
    to: /sydney-food-map
```

`Header.vue` reads via `queryCollection("site").path("/site/header").first()`.

### Pre-build URL Validation

`nuxt.config.ts` — `content:file:afterParse` hook, collection `"site"`:

- Scans `app/pages/` at config-load time → `VALID_ROUTES: Set<string>`
- For each `nav[*].to`, asserts membership in `VALID_ROUTES`
- Throws with a clear error message (route + list of valid options) if invalid
- Runs before bundle — typos in the YAML never reach production

---

## Dev / Prod Behaviour

| Environment             | SiteHeader | Food Map Header |
| ----------------------- | ---------- | --------------- |
| Dev (`import.meta.dev`) | Visible    | Visible         |
| Production              | Hidden     | Visible         |

`FoodMapApp` takes `flex: 1; min-height: 0` so it always fills remaining viewport height regardless of whether `SiteHeader` is present.

---

## Out of Scope (Phase 2)

- River boat animation (`river-boats.js` / `river-routes.js`) — feature-flagged in reference, not required for correct integration
- Moving restaurant data to Nuxt Content — discussed; deferred until after food map ships

---

## Files Changed / Created

| File                                               | Change                                                  |
| -------------------------------------------------- | ------------------------------------------------------- |
| `app/pages/sydney-food-map.vue`                    | New page                                                |
| `app/components/food-map/FoodMapApp.vue`           | New (stub → implement)                                  |
| `app/components/food-map/FoodMapHeader.vue`        | New (stub → implement)                                  |
| `app/components/food-map/FoodMapListDrawer.vue`    | New (stub → implement)                                  |
| `app/components/food-map/FoodMapDetailsDrawer.vue` | New (stub → implement)                                  |
| `app/components/food-map/FoodMapStage.vue`         | New (stub → implement)                                  |
| `app/components/food-map/FoodMapThemeMenu.vue`     | New (stub → implement)                                  |
| `app/composables/useFoodMapStore.ts`               | New (complete)                                          |
| `app/composables/useFoodMapTheme.ts`               | New (complete)                                          |
| `app/assets/css/food-map.css`                      | New (scaffold → expand with full styles.css port)       |
| `content/site/header.yml`                          | New                                                     |
| `content.config.ts`                                | Add `site` collection                                   |
| `nuxt.config.ts`                                   | prerender rule + Crimson Pro font + URL validation hook |
| `app/components/site/Header.vue`                   | Read nav from `queryCollection("site")`                 |
