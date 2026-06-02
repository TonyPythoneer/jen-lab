# Sydney Food Map — Ferry Network, Theme Menu, Header

Date: 2026-06-02 · Branch: `feat/food-map`

## Problem

`/sydney-food-map` should match the approved design: a Sydney Ferries network (route
lines + moving boats) on **every** map style, a parchment theme menu with a "River boats"
toggle, and no site header over the map. Today none of the boat feature exists.

Verified (read all food-map files + drove the live app in headless Chrome):

- Ferry route lines appear **only** in 等高線・地形 because they are baked into the
  OpenTopoMap tiles. `FoodMapStage.vue` draws no ferry layer of its own, so other basemaps
  show nothing.
- Boats never move — the vessel simulation was never ported.
- `FoodMapThemeMenu.vue` uses generic white/gray Tailwind, not the parchment tokens in
  `app/assets/css/food-map.css`, and lacks the ANIMATION / River boats section.
- `sydney-food-map.vue` renders `<SiteHeader v-if="isDev" />`, overlaying the map.

## Reference

Two prototype globals supplied by the user: `river-routes.js` (`window.RIVER_ROUTES`,
data) and `river-boats.js` (`window.RiverBoats`, painter + rAF simulation). Principle to
preserve: **one network, every style** — built once into a single `L.layerGroup`, present
on all themes; a theme swap only re-tints via `--boat-route` / `--boat-ink`.

## Decisions

- **Single source of truth = Transport for NSW GTFS.** Build-time `pnpm sync:ferries`
  extracts ferry geometry (`route_type=4`) from
  `https://api.transport.nsw.gov.au/v1/gtfs/schedule/ferries`. License CC-BY 4.0,
  attribution `© State of New South Wales (Transport for NSW)`.
- **Seed now, sync later.** Ship a committed placeholder `ferry-routes.json` ported from
  the prototype so the feature works immediately; the user runs the real sync later with a
  free API key (kept in `.env`, never committed).
- Ported globals become idiomatic Nuxt — no `window.*`, no `FEATURE_FLAGS`.

## Shared contract (already written)

- `app/utils/ferry-routes.ts` — `FerryRoute` / `FerryStop` types, `FERRY_ROUTES`,
  `FERRY_ATTRIBUTION`.
- `app/assets/data/ferry-routes.json` — seed (8 routes F1–F10), `{ _source, attribution,
routes }`.

## Work items

- **A. Engine + wiring** — `app/composables/useRiverBoats.ts` (Leaflet painter + rAF
  simulation, controller `{ refreshTheme, setEnabled, isEnabled, destroy }`); init once in
  `FoodMapStage.vue` `onMounted`; theme `watch` calls `refreshTheme()`; `boatsEnabled` prop;
  `FoodMapApp.vue` owns the persisted `boatsEnabled` ref (`localStorage` `atlas.boatsEnabled`).
- **B. Sync** — `scripts/sync-ferries.ts` (mirrors `scripts/sync-wp.ts`) + `package.json`
  `sync:ferries`. Fails cleanly without `TFNSW_API_KEY`; does not run in this workflow.
- **C. Menu** — restyle `FoodMapThemeMenu.vue` with `food-map.css` parchment tokens; add the
  River boats toggle (`toggle-boats` emit) + matching CSS.
- **D. Header** — remove `<SiteHeader v-if="isDev" />` from `sydney-food-map.vue`.

## Verification

`pnpm check` clean. webwright on `localhost:3500/sydney-food-map`: route lines + boats on
**all** themes; two frames apart confirm motion; parchment menu + working toggle; no header.
