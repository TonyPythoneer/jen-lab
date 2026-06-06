# Food Map Canvas Markers — Implementation Plan

> Execution checklist (I am both author + executor; code written at implement time, verified via Playwright/webwright + prod preview).

**Goal:** Kill the weak-phone drag jank by moving all map markers (restaurant pins + ferry boats + suburb labels) off DOM (one compositor layer each → 77+32+N layers) onto a few `<canvas>` layers, and strip the always-on costs (parchment FX, @2x tiles) that the smooth old map never had.

**Architecture:**
- Two custom Leaflet canvas layers: a **static** one (restaurant pins + labels — redraw only on moveend/zoomend/selection/hover/filter/resize; pans for free by riding the pane transform) and a **dynamic** one (boats — redraw per rAF frame, paused on drag/hidden/reduced-motion). Boundary stays on Leaflet's existing `preferCanvas` renderer.
- Hit-testing on the map (markers gone): map `click`/`mousemove` → nearest pin within tap radius.
- DPR capped at 1.5. Emoji drawn full-color via a baked `ImageBitmap` cache (16 categories), so per-redraw is a cheap blit.

**Tech stack:** Nuxt 4, Leaflet 1.9 (custom `L.Layer`), Canvas 2D, TypeScript.

## Locked decisions
1. pin icon = **emoji, full color** (no ink filter); 2. shadow/transition/bounce = **removed**; 3. parchment (tile filter + grain/wash + vignette) = **removed entirely**; 4. boats = **canvas**; 5. tiles = **@1x mobile / @2x desktop**; 6. suburb labels = **viewport-culled**; 7. maxBounds = **dynamic, sized so an edge pin centers in the mobile room**; 8. desktop hover-group + tooltip = **kept**; 9. DPR cap = **1.5**; 10. dense pins = **click picks nearest, selected drawn on top, no cluster**; 11. boundary = **original full-res jsdelivr (not simplified)**; 12. maplibre + GL option = **removed**.

## File structure
- NEW `app/composables/useCanvasLayer.ts` — factory for a DPR-capped full-overlay canvas Leaflet layer (attach to pane, reposition on move/zoom, expose `redraw`, `project(latlng)`, `destroy`).
- NEW `app/composables/usePinCanvas.ts` — restaurant-pin renderer + emoji ImageBitmap cache + hit-test. Draws teardrop + emoji + selected/group/faded states.
- NEW `app/utils/food-map-geo.ts` — pure helpers: `nearestPin(point, pins, maxDist)`, `computeCenteringPad(map, size, zoom)` (+ unit tests).
- MODIFY `app/composables/useRiverBoats.ts` — keep simulation; swap DOM-marker render → draw boats on a dynamic canvas (Path2D from BOAT_SVG). Drop divIcon/marker code + the per-marker flip DOM writes.
- MODIFY `app/components/food-map/FoodMapStage.vue` — remove DOM `buildMarkers`, wire pin canvas + hit-test (click/hover/tooltip), remove parchment application + GL/maplibre + dev tileMode GL, @1x mobile, label viewport-cull, dynamic maxBounds.
- MODIFY `app/components/food-map/FoodMapApp.vue` — remove vignette, slim dev panel, remove GL wiring.
- MODIFY `app/components/food-map/FoodMapThemeMenu.vue` — remove GL option; trim dev panel.
- MODIFY `app/composables/useFoodMapTheme.ts` — drop filter/wash/grain; reduce themes to the visually-distinct basemaps (voyager + one osm).
- MODIFY `app/assets/css/food-map.css` — delete `.r-pin*`, `.r-dot`, parchment `::before/::after`, `--tile-filter` usage, vignette, `.is-interacting` filter rules. Keep `.r-tip` tooltip + the new canvas-tooltip.
- MODIFY `package.json` — remove `maplibre-gl`, `@maplibre/maplibre-gl-leaflet`.
- NEW `tests/utils/food-map-geo.test.ts`.

## Phases (priority order — high-impact first)

### Phase 0 — Cleanup & always-on wins (independent, de-risks)
- Remove maplibre deps + GL tileMode option + GL branch in applyBasemap.
- Remove parchment: strip `--tile-filter`/wash/grain application + vignette + the `.map-surface::before/::after` + `.is-interacting` filter CSS. Themes lose filter; reduce theme list to distinct basemaps.
- Tiles: @1x on mobile (`window.innerWidth <= 640` → strip `{r}`), @2x desktop. Keep `updateWhenIdle`+`keepBuffer`.
- Verify: dev render OK, no console errors, `pnpm check`.

### Phase 1 — Canvas layer foundation (`useCanvasLayer.ts`)
- `L.Layer` subclass: canvas in a named pane; size=map.getSize()×min(dpr,1.5); on `moveend zoomend viewreset resize` reposition to `containerPointToLayerPoint([0,0])` + redraw; expose `project(latlng)` → canvas px (container px × dpr), `redraw()`, `destroy()`. Pan rides the pane transform (no redraw during drag).

### Phase 2 — Pins on canvas (`usePinCanvas.ts`)
- Bake 16 category emoji to `ImageBitmap` at 1.5×16px once.
- Draw per pin: white teardrop (rounded path, no shadow) + blit emoji. States: selected = scale ×2 drawn last/on-top; group = ×1.14 + cat-color ring; faded = alpha 0.22. No transitions.
- Redraw triggers: selection, hover, restaurants(filter), zoomend/moveend, resize.

### Phase 3 — Hit-test + interactions (`food-map-geo.ts` + Stage)
- `nearestPin` unit-tested. Map `click` → nearest within ~22px → emit select. Desktop `mousemove` (throttled) → hovered pin → emit hover(categoryId) + position the DOM `.r-tip` tooltip; leave → clear. Mobile: no hover.

### Phase 4 — Boats on canvas (`useRiverBoats.ts`)
- Keep CONFIG + measure + sampleAtDist + frame() sim (pos updates). Replace render: dynamic canvas layer; each rAF draw all vessels via Path2D(BOAT_SVG paths) at `project(latlng)`, scaled 26px, `scale(-1,1)` when facing left, fill `--boat-ink`. Keep pause/resume (drag), visibility pause, reduced-motion static. Delete divIcon/marker/el flip code.

### Phase 5 — Labels viewport-cull + dynamic maxBounds
- Suburb labels: only add label markers whose latlng ∈ current padded bounds; update on moveend (still DOM divIcons but ≤ viewport count). (If trivial, draw on the static pin canvas instead.)
- `computeCenteringPad`: from map size + room geometry (searchBar 64px, sheetTop 0.38h, pin centered at roomCentre) + selection zoom 15 → required lat/lng pad via project/unproject; `setMaxBounds(dataBounds extended by pad)`. Webwright-measure: edge pin tap centers in the mobile room.

### Phase 6 — Wire, delete old, verify
- Delete DOM `buildMarkers`/`applySelection`/`applyHover` DOM-class logic → canvas equivalents. Delete dead CSS. `pnpm check` + `pnpm test`. Playwright: pins render, click selects, hover tooltip (desktop), boats animate, 0 DOM `.leaflet-marker-pane` pins, 0 console errors. Screenshot default + selected + zoomed. Rebuild prod preview (:3700) for on-device test.

## Verification gates
- `pnpm check` 0 errors, `pnpm test` green at each phase boundary.
- Playwright: DOM marker count for pins/boats → 0 (moved to canvas); canvas present; click/hover/tooltip work; screenshots look right.
- Final: prod preview rebuilt; note Motorola G05 on-device test is Tony's to confirm.
