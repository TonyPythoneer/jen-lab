---
slug: food-map-drag-jank-mobile
status: resolved
trigger: "/sydney-food-map map drag feels janky on Motorola G05; Google Maps on the same phone is smooth"
created: 2026-06-04
updated: 2026-06-04
---

# Debug: Food map drag is janky on low-end Android

## Symptoms

- expected: Panning the map by dragging is smooth, like Google Maps on the same phone.
- actual: Dragging the map stutters / feels laggy ("卡卡的").
- device: Motorola G05 (low-end Android — MediaTek Helio G81, weak GPU).
- comparison: Google Maps drags smoothly on the same device.
- reproduction: Open `/sydney-food-map` on the phone, drag the map.
- errors: none (this is a frame-rate / smoothness problem, not a crash).

## Current Focus

- hypothesis: The ferry-boat animation keeps moving up to 32 DOM markers every
  animation frame and never pauses while the user drags, so it starves the
  drag handler on a slow phone.
- test: Trace what JavaScript runs per frame during a pure drag.
- expecting: The only per-frame work during a drag is the boat loop.
- next_action: RESOLVED — pause applied to useRiverBoats.ts and verified on
  desktop (:3700); on-device handfeel test pending on the Motorola G05.

## Evidence

- timestamp: 2026-06-04 — `useRiverBoats.ts` runs one `requestAnimationFrame`
  loop. Every frame it loops over up to `CONFIG.shipCount = 32` vessels and
  calls `v.marker.setLatLng(...)` for each (line 358). Each `setLatLng` rewrites
  that boat's CSS `transform` on a DOM element.
- timestamp: 2026-06-04 — The boats are `L.marker` + `L.divIcon`, i.e. real DOM
  nodes, not canvas (lines 271–290). Google Maps draws everything on WebGL, so
  it never pays this per-element DOM cost.
- timestamp: 2026-06-04 — The loop only pauses on `document.hidden`
  (`onVisibility`, line 391). It does NOT pause on map drag/zoom. So during the
  exact moment the main thread is busiest (touchmove → move the map pane), the
  boats are doing their most expensive work.
- timestamp: 2026-06-04 — Boats default ON: `FoodMapApp.vue` `boatsEnabled =
  ref(true)`. So the user hits this without toggling anything.
- timestamp: 2026-06-04 — Aggravators in `food-map.css`:
  - `.river-boat` has `will-change: transform, opacity` (line 947) → up to 32
    permanent GPU layers; a layer-count footgun on a weak GPU.
  - `.r-pin__glyph` paints a 5-stage CSS `filter` (`--ink-filter`, line 842) on
    every restaurant pin → heavy paint layers.
  - No `preferCanvas` on the map → boundary, course lines, wharf dots all render
    as SVG on the main thread.

## Eliminated

- hypothesis: Restaurant pins are the cost. — Pins are static during a drag.
  Leaflet moves the whole map pane with one transform; static markers ride along
  for free. Only the boats rewrite positions per frame.
- hypothesis: Vue reactivity fires on pan. — The `watch`es react to
  restaurant/selection/theme/boats changes, none of which fire during a plain
  drag. No Vue work happens per drag frame.

## Resolution

- root_cause: The ferry simulation (`useRiverBoats.ts`) drives up to 32 DOM
  markers every animation frame and never stops while the user is panning. On a
  low-end phone the per-frame DOM transform writes compete with the drag
  handler, so frames drop and the drag stutters. Google Maps avoids this by
  rendering on WebGL instead of moving DOM nodes.
- fix: APPLIED — `map.on("movestart", stop)` / `map.on("moveend", start)` in
  `createRiverBoats` (with matching `map.off` in `destroy`). Reuses the existing
  start/stop rAF controls. `movestart`/`moveend` bracket drags, zooms, and
  programmatic flyTo, so the fleet freezes for any gesture and the main thread is
  free for the pan. `start()` resets `lastTs`, so boats resume without a jump.
- verification: PASSED (desktop Playwright on :3700, fix worktree). Sampled 8
  boat-marker transforms across three phases: before a drag = moving
  (movedBefore true); button held mid-drag = identical transforms i.e. frozen
  (frozenDuringDrag true); after release + inertia = moving again (movedAfter
  true). 32 boats, 0 console errors, screenshot showed no visual regression.
  On-device handfeel on the Motorola G05 is the user's to confirm.
- files_changed: `app/composables/useRiverBoats.ts` (branch
  fix/food-map-drag-jank, worktree .claude/worktrees/food-map-drag-jank).
- follow_up: Optional CSS-motion rewrite (boats glide even during a drag) is
  planned separately in `.planning/plans/food-map-boats-css-motion.md`.

---

## Round 2 — residual jank after the boats fix (2026-06-04)

- symptom: After the boat-pause fix shipped, dragging STILL felt slow on the
  Motorola G05. Tony suspected the static SVG vector layers (ferry course lines,
  wharf dots, suburb boundary).

- method: Added dev-only per-layer toggles (`useRiverBoats` course/wharf
  sub-groups + `FoodMapStage` boundary toggle + `window.__foodMapDebug`) and a
  Playwright bench (`.planning/debug/bench-drag.mjs`) at 6x CPU throttle (CDP).
  Two signals: `zoomMs` = a synchronous `setZoom(animate:false)` round-trip
  (reprojects every vector vertex on the main thread — a clean proxy for vector
  weight), and a scripted-drag rAF interval distribution.

- evidence (zoomMs, 6x throttle, single-variable deltas):
  baseline 352 · boats off 334 · **course lines off 352 (≈0)** · **wharf dots
  off 355 (≈0)** · **suburb boundary off 77** · all vectors off 54. The suburb
  boundary alone is ~275ms of the 352ms. Ferry routes + wharf dots cost
  essentially nothing — Tony's first hypothesis (gate the ferry routes) was
  wrong. Vertex count confirmed it: boundary = **173,858 vertices / 471
  features**, vs ferry course lines = 2,009 points (86x lighter).
  Desktop drag rAF was flat across configs because Leaflet does NOT reproject on
  pan (it transforms the pane); reprojection only happens on zoom. The
  weak-phone PAN cost is GPU compositing of the huge SVG layer, which a desktop
  GPU can't reproduce — but the zoom metric isolates the same heavy layer.

- root_cause: The suburb-boundary GeoJSON (174k vertices) is the dominant vector
  cost — the heaviest thing the map reprojects on zoom and composites on pan. As
  faint hairline outlines it never needed that resolution.

- fix: APPLIED (branch `perf/food-map-vector-layers`).
  1. `preferCanvas: true` on the map (`FoodMapStage.vue`) — all vector layers
     render onto ONE canvas bitmap instead of a giant SVG DOM tree, so a pan
     composites one texture (the actual drag-cost fix; not measurable on
     desktop). Safe: boat + restaurant markers are divIcons (DOM), untouched;
     dashed course lines and circleMarkers render fine on canvas.
  2. Douglas-Peucker simplify the boundary right after fetch
     (`app/utils/geo-simplify.ts`, ε=0.0005 deg ≈ 45 m). 173,858 → 10,321
     vertices (17x). One-time cost 9.4ms at 6x throttle (~1.5ms real).
  3. Drop the 5-stage `.r-pin__glyph` filter during `.is-interacting`
     (`food-map.css`) — free paint relief on every pin while dragging.

- verification:
  - zoomMs 352 → **74** (6x throttle, 4.8x faster; ≈ the 52ms base-map floor).
    Boundary's residual cost ~16ms (was ~275ms).
  - Visual: screenshots at zoom 13 + 15 — suburb outlines + labels still follow
    the harbour coastline smoothly, no jaggedness (17x reduction is lossless for
    0.5-opacity hairlines).
  - Dev toggle UI in the style menu verified end-to-end (471 → off → 0 → on →
    471). `pnpm check` 0 errors; `pnpm test` 52/52 (8 new for geo-simplify).
  - On-device handfeel on the Motorola G05 is Tony's to confirm (desktop can't
    reproduce the weak-GPU pan-compositor cost).

- files_changed: `app/components/food-map/FoodMapStage.vue`,
  `app/composables/useRiverBoats.ts`, `app/components/food-map/FoodMapApp.vue`,
  `app/components/food-map/FoodMapThemeMenu.vue`, `app/assets/css/food-map.css`,
  `app/utils/geo-simplify.ts` (new), `tests/utils/geo-simplify.test.ts` (new).

- open_decision: Upgrade to a pre-simplified LOCAL boundary asset (drop the
  jsdelivr CDN fetch). Client-side simplify is cheap (9.4ms), so the only
  remaining win is killing the full-file download + JSON.parse on mobile and
  removing the third-party runtime dependency. Bigger change (commit an asset,
  preserve CC-BY attribution) → left for Tony to approve.
