# CSS-Motion Rewrite for Sydney Ferries (Option 2)

## Problem

The ferry-boat animation runs a single rAF loop in `useRiverBoats.ts` that calls `marker.setLatLng()` on up to 32 boat markers every frame. On low-end Android devices (Motorola G05, Helio G81 GPU), these per-frame DOM transform writes starve the drag handler, causing janky panning. Google Maps stays smooth because it renders boats on WebGL (main thread free). A temporary surgical pause (pausing the rAF loop on map `movestart` / resuming on `moveend`) freezes boats during pans; this plan migrates the boat **motion** onto the CSS compositor so boats keep gliding during pans with zero main-thread cost.

## Goal & Non-Goals

**Goal:**

- Move ferry-boat **motion** onto CSS compositor (transform keyframes, opacity) so pans never compete with boat animation for the main thread.
- JS shrinks to: measure route geometry once, generate keyframe/offset-path animations, and **regenerate only on zoom** (Leaflet projection changes pixel geometry; CSS cannot know the projection).
- Preserve every ferry **service behavior**: per-vessel speed variance, bidirectional traffic, dwell at wharves, longer terminal layover, direction reversals, spawn fade, spawn delay staggering, `document.hidden` pause, `prefers-reduced-motion` static placement.
- Keep the public API stable: `createRiverBoats(map, L) → { refreshTheme(), setEnabled(on), isEnabled(), destroy() }` so `FoodMapStage.vue` barely changes.

**Non-Goals:**

- Repaint or reposition boats on pan (Leaflet's map-pane transform is the only pan; boats inherit it for free via CSS compositor).
- Preserve exact on-device frame rate (boats may animate faster/slower on low-end devices; CSS compositing is the trade-off for staying off the main thread).
- Support `prefers-reduced-motion` _at ease_ — it already works (static placement) and will be checked at build time, not runtime.

## Chosen Approach: Web Animations API (WAAPI) + Transform Keyframes

**Why WAAPI, not offset-path or static keyframes:**

1. **offset-path + offset-distance** — Cleanest authoring (one path per route, animate distance). But:
   - `offset-distance` is GPU-composited in Chromium; non-standard support across browsers.
   - Less predictable on low-end devices where compositing stalls.
   - Cannot pause or seek (needed for zoom regen to avoid boat teleports).

2. **Static CSS keyframes** (100% animation completeness upfront):
   - Guaranteed compositor but massive payload (32 boats × 100s of keyframes each = huge stylesheet).
   - Cannot pause/seek on zoom regen; must rebuild entire animation.
   - Bloats JavaScript bundle (keyframe generation happens at route build, not on first page load).

3. **Web Animations API + transform-translate keyframes** (selected):
   - Creates compositor-safe animations (transform + opacity guaranteed composited).
   - Animations are pauseable and seekable: `anim.pause()` / `anim.play()` / `anim.currentTime`.
   - On zoom, pause all animations, update waypoint positions, seek each vessel to its saved progress, resume — **zero teleport**.
   - Readable timeline: can log progress, verify behavior in DevTools.
   - WAAPI is standard in all modern browsers (IE11 never shipped; Leaflet already targets modern browsers).

**Transform-translate path:**

- Each vessel animates via `transform: translate(x, y)` keyframes through route waypoints.
- Marker stays at one Leaflet lat/lng (the route start); CSS `transform` moves the visual element.
- On zoom, Leaflet reprojects waypoints to new pixel coords; WAAPI animation keyframes are regenerated with new pixel values; vessel seeks to saved progress.

**Direction flip (scaleX):**

- Apply `scaleX(±1)` via CSS `transform` at direction-change keyframes (steps at turn points).
- No separate transition needed; flip is part of the keyframe.

## How Each Simulation Behavior Maps to CSS

| Behavior                                          | Technique                                          | Notes                                                                                                                                                                        |
| ------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Per-vessel speed**                              | Per-animation duration                             | Each vessel gets a WAAPI animation with its own `duration` (e.g. 45s vs 60s). Varying durations = natural stagger.                                                           |
| **Per-wharf dwell (pause at intermediate stops)** | Keyframe hold (plateau)                            | At the dwell distance, hold a keyframe value for a % range (e.g. 15%–20% of animation timeline). Leaflet pause-on-movestart freezes the timeline.                            |
| **Terminal layover (longer pause at A/B)**        | Extended keyframe hold                             | Terminals get a longer plateau (e.g. 5%–15% instead of 1%–2%).                                                                                                               |
| **Reverse at terminals (A↔B, bidirectional)**     | Alternate direction + twin keyframes               | Half the fleet animates 0→100% of the path; half animates 100%→0% (via `animation-direction: reverse`). On reaching 100% (or 0%), the animation loops and starts the return. |
| **Left/right facing flip**                        | `scaleX()` at direction-change keyframes           | Apply `scaleX(-1)` at the turn-point keyframes; animation eases the flip via the keyframe's own `easing` if needed, or apply a separate `transform` easing.                  |
| **Spawn fade-in**                                 | Opacity keyframe ramp                              | First 0%–1% of the animation: `opacity: 0 → 0.94`. Fade completes before dwell at the first wharf.                                                                           |
| **Spawn delay staggering**                        | `animation-delay` per vessel                       | Each vessel gets a staggered `animation-delay` (e.g. first vessel: 0ms, second: +140ms, etc.). Delays cascade across routes too.                                             |
| **`document.hidden` pause**                       | `animation-play-state: paused` on visibility event | Listen to `visibilitychange`; set all boat animations to `paused` when hidden, `running` when visible. WAAPI can also use `anim.pause()`.                                    |
| **`prefers-reduced-motion`**                      | No animation, static placement                     | Build zero keyframes if prefers-reduced-motion is true at startup; boats render at their first waypoint, no animation.                                                       |

## Zoom / Pan / Resize / Theme Handling

### Pan

- **Free cost.** Leaflet's map-pane transform moves every layer, including boat markers. Boats animate relative to their markers (via `transform: translate`), so they automatically inherit the pan. **Zero JS, zero main-thread work.**

### Zoom (unavoidable JS regeneration)

- **Problem:** Leaflet's projection changes pixel-to-lat/lng math on every zoom level. A waypoint at lat=-33.867, lng=151.208 projects to pixel (512, 384) at zoom 14 but (1024, 768) at zoom 15.
- **Solution:**
  1. On `zoomend`, pause all boat animations.
  2. Capture each vessel's current progress: `progress = (currentTime - delay) / duration` (0.0 to 1.0).
  3. Reproject all waypoints via `map.project(latLng, newZoom)`.
  4. Regenerate keyframes with new pixel positions (via `lat/lng → pixel, relative to marker` for each waypoint).
  5. Rebuild animations, set `anim.currentTime = progress × newDuration`, resume.
- **Vessel continuity:** The saved progress ensures the boat resumes at the same logical position on the route (same distance along the path). No teleport.

### Resize

- **Free cost.** Leaflet invalidates internally; our markers reproject. No special handling needed.

### Theme change (color only)

- **Via `refreshTheme()`:** Recolor the `--boat-ink` CSS variable on boat SVG elements. Animations are unaffected. Recoloring is a CSS variable update, not a keyframe rebuild.

## Public-API Compatibility

```typescript
export interface RiverBoatsController {
  refreshTheme(): void;
  setEnabled(on: boolean): void;
  isEnabled(): boolean;
  destroy(): void;
}

export function createRiverBoats(map: LeafletMap, L: LeafletNS): RiverBoatsController;
```

**Stable contract:**

- `createRiverBoats()` still builds the layer on first call, populates vessels, and returns the controller.
- `setEnabled(on)` shows/hides the layer and plays/pauses all animations.
- `refreshTheme()` updates colors via CSS variables, no rebuild.
- `destroy()` cancels animations and cleans up listeners.

**Internal changes (invisible to caller):**

- Vessels no longer have a `pos: number` field (no rAF loop position). Instead, each vessel stores its WAAPI animation instance and (for zoom regen) its route index `ri` and vessel index `k` within the route.
- No rAF loop. No `frame()` function. No `running` or `lastTs` state.
- New internal state: `animations: Animation[]`, `onZoomend()` handler, zoom-regen logic.

## Risks & Fidelity Trade-Offs

### Risk 1: Zoom Regeneration Complexity

- **Scenario:** User zooms while a boat is at a wharf dwell. The dwell plateau in the old animation may not align with the new keyframes.
- **Mitigation:** On regen, preserve the vessel's arc-distance along the route (compute from saved progress + original route length). Reproject all waypoints to new pixel coords. The new dwell plateaus will be at the same logical arc-distance, so the boat lands in the same dwell even if pixel coordinates shift.
- **Residual risk:** On very fast zoom sequences, a boat might briefly appear in two places before pause/regen completes. Acceptable; zoom is user-driven and transient.

### Risk 2: WAAPI Browser Support (Edge/Safari)

- **Mitigation:** WAAPI is standard in all modern browsers and already used in modern Leaflet plugins. Fallback to static placement (no animation) if WAAPI is unavailable (rare on modern devices).

### Risk 3: Fidelity Loss: Exact Speed Variance

- **Current:** Each vessel's `speed` is a real m/s value that drives distance-per-frame.
- **CSS:** Speed is encoded as `duration`. A vessel with 2× speed gets 0.5× duration. Works, but the mapping from m/s → duration is a heuristic; very slow/fast vessels may not feel _exactly_ like the original.
- **Mitigation:** Compute duration as `route_length / (baseSpeed × speedVariance)`. Test on-device with low-end phones. If too different, add a CSS `animation-speed` multiplier (not standard; skip for now).
- **Residual risk:** Low-end devices may jank during rapid zoom if regen is slow. Accept; the goal is pan smoothness, not zoom perfection.

### Risk 4: `document.hidden` Pause Implementation

- **Current:** rAF loop checks and stops on visibility change.
- **CSS:** Must listen to `visibilitychange` and pause all WAAPI animations. If the listener is not wired correctly, boats keep animating when the page is hidden (battery drain on mobile).
- **Mitigation:** Add a defensive visibility listener and unit-test it (toggle `document.hidden` in tests).

### Risk 5: Spawn Delay Staggering Cross-Route Cascade

- **Current:** Delays are set per vessel and depend on route index `ri`.
- **CSS:** Animation delays are part of the stylesheet/WAAPI options. Recomputing delays on every zoom is wasteful.
- **Mitigation:** Compute delays once at build time. Store them on the Animation instance. Do NOT recompute on zoom.

## Implementation Breakdown (Step by Step)

### Phase 1: Foundation & Keyframe Generation (3 tasks)

**Task 1.1: Extract waypoint-to-pixel projection logic**

- Create a new function `getWaypointPixels(route: Measured, map, L, zoom)` that:
  - Takes a measured route and a zoom level.
  - Projects each waypoint from lat/lng to pixel coords at the given zoom.
  - Returns `{ waypoints: [x, y][], stops: [x, y][] }` (separate stops for dwell logic).
  - Used by both old rAF loop (for `sampleAtDist`) and new WAAPI builder.
- **Verify:** Call it at zoom 14 and zoom 15, print waypoint coords; confirm they match Leaflet's internal projection.

**Task 1.2: Build WAAPI keyframe generator**

- New function `generateVesselKeyframes(vessel: Vessel, route: Measured, pixels: [x, y][], config: CONFIG)`:
  - Takes waypoint pixels and vessel (speed, dir, etc.).
  - Generates a keyframes array: `[{ offset: 0, transform: 'translate(0, 0)', opacity: 0 }, ..., { offset: 1, transform: 'translate(x, y)', opacity: 0.94 }]`.
  - Encode dwells as plateau keyframes (e.g., for a 1.4s dwell, allocate 2% of the animation to a hold).
  - Encode direction changes as `scaleX()` within the transform.
  - Return the keyframes and metadata: `{ keyframes, duration: ms, direction: 'normal' | 'reverse', easing: 'linear' }`.
- **Verify:** Print keyframes for one vessel; spot-check that dwells are in the right places and scaleX flips are at turn points.

**Task 1.3: Wire WAAPI animations to vessel elements**

- New function `createAndAttachAnimation(vessel: Vessel, options: {keyframes, duration, delay, direction})`:
  - Creates a WAAPI animation: `element.animate(keyframes, { duration, delay, direction, fill: 'forwards', easing: 'linear' })`.
  - Stores the animation instance on the vessel (new field `anim: Animation`).
  - Adds event listener for `animationfinish` to auto-restart (loop behavior).
  - Returns the animation handle.
- **Verify:** Start one boat animation, check DevTools; inspect the animation in the Animations panel. Verify it plays and the vessel moves.

### Phase 2: Remove rAF Loop & Build State (2 tasks)

**Task 2.1: Replace rAF loop with WAAPI control**

- Delete the `frame()` function, rAF loop (`running`, `rafId`, `lastTs`), and `start()`/`stop()` wrappers.
- Replace with new functions:
  - `playAnimations()` — call `anim.play()` on all vessels.
  - `pauseAnimations()` — call `anim.pause()` on all vessels.
- Keep the visibility listener; call `pauseAnimations()` on hidden, `playAnimations()` on visible.
- **Verify:** Navigate away from the map (tab hidden); boat animations should pause. Return to the tab; they should resume.

**Task 2.2: Rebuild `setEnabled(on)`**

- On `setEnabled(true)`:
  - Show the layer and play animations (call `playAnimations()`).
- On `setEnabled(false)`:
  - Pause animations and hide the layer.
- **Verify:** Toggle boats on/off in the UI; they show/hide and animations pause/resume.

### Phase 3: Zoom Regeneration (2 tasks)

**Task 3.1: Implement zoom-regen save & restore**

- On map `zoomstart`:
  - For each vessel, save `{ progress: (anim.currentTime - delay) / duration, ri, k }` (route index and vessel index within route).
  - Call `pauseAnimations()`.
- On map `zoomend`:
  - Get the new zoom level from `map.getZoom()`.
  - For each vessel, reproject its route's waypoints to the new pixel coords.
  - Regenerate keyframes with new pixel positions.
  - Rebuild the animation, set `anim.currentTime = progress × newDuration`, resume.
- **Verify:** Zoom in/out while boats are animating. Check that they don't teleport and resume at the same logical arc-distance.

**Task 3.2: Add zoom safety net & regen testing utility**

- Add a guard: if zoom regen takes >500ms (possible on very complex routes), log a warning and forcibly resume animations (timeout-based safety).
- Export a test utility `debugZoomRegen(vessel)` for integration tests.
- **Verify:** Programmatic zoom (no user gesture); verify regen completes in <100ms on typical routes.

### Phase 4: Behavior Details (2 tasks)

**Task 4.1: Encode dwell logic in keyframes**

- For each wharf (non-terminal), compute dwell distance and map it to an animation progress %.
- At that %, insert a keyframe that holds the position for 2% of the total animation (e.g., 1.4s dwell in 60s animation = 2%).
- For terminals, extend the dwell to 4%–5%.
- **Verify:** Trace one boat through a full cycle; confirm it pauses at wharves and lingers longer at terminals.

**Task 4.2: Spawn delay & direction staggering**

- Compute per-vessel delay and direction at build time (same logic as today's `phase` and `k % 2`).
- Apply `delay` and `animation-direction` as WAAPI options.
- Verify that half the fleet is on A→B and half on B→A.
- **Verify:** Watch a route for one full cycle; confirm bidirectional traffic and staggered spawns.

### Phase 5: Refactor `build()` & Public API (1 task)

**Task 5.1: Refactor `build()` to use new keyframe generator**

- Rename the old `build()` to `buildGeometry()` (still creates routes, wharves, course lines).
- New `buildAnimations()` function:
  - For each route, call `generateVesselKeyframes()` for each vessel.
  - Call `createAndAttachAnimation()` for each.
  - Store animation refs in a flat `animations: Animation[]` array.
- Call `buildGeometry()` once at init. Call `buildAnimations()` at init and on every `zoomend`.
- **Verify:** Map renders boats, animations play, zoom triggers regen.

### Phase 6: Theme & Cleanup (2 tasks)

**Task 6.1: Wire `refreshTheme()` to CSS variables only**

- `refreshTheme()` still updates `--boat-ink` on boat elements.
- Recolor course lines and wharf dots (no change).
- **Verify:** Switch themes; boats recolor instantly.

**Task 6.2: Implement `destroy()` with WAAPI cleanup**

- Cancel all animations: `anim.cancel()` for each animation.
- Remove event listeners (zoom, visibility).
- Remove the layer.
- Clear the animations array.
- **Verify:** Unmount the map; no lingering animation timelines in DevTools.

### Phase 7: Integration & Edge Cases (2 tasks)

**Task 7.1: Conditional animation for `prefers-reduced-motion`**

- Check `prefers-reduced-motion` at `build()` time.
- If true, skip keyframe/animation generation. Boats render at their first waypoint, no animation.
- No new code for this; the existing guard is sufficient.
- **Verify:** Set `prefers-reduced-motion: reduce` in system settings; boats appear static.

**Task 7.2: Mobile & low-end device hardening**

- Add `will-change: transform, opacity` to boat elements (already in food-map.css; verify it's present).
- Test zoom-regen performance on a simulated slow device (Chrome DevTools, 4x CPU slowdown).
- If regen stalls, add a deferred-regen timeout so the UI never blocks.
- **Verify:** Zoom on a simulated slow device; no main-thread jank.

### Phase 8: Testing & Verification (2 tasks)

**Task 8.1: Desktop Playwright verification**

- Programmatic test: drag the map while boats animate. Capture video or frame samples. Verify boats keep moving smoothly.
- No per-frame JS console logs; watch DevTools for rAF activity (should be minimal — only on zoom).
- **Verify:** Pan handfeel is smooth; no stutter.

**Task 8.2: On-device testing (manual, left to user)**

- Deploy to production or staging.
- Test on a real low-end Android phone (Motorola G05 or similar).
- Pan and drag the map; observe boat smoothness.
- Zoom in/out; verify boats don't teleport.
- Expected outcome: boats keep gliding during pans with no jank, unlike the old rAF loop.

## How to Verify (Desktop Playwright)

1. **Pan smoothness (desktop):**

   ```
   // Drive the map with a programmatic pan (no gesture)
   map.panBy([200, 0], { animate: true, duration: 1000 })
   // Capture frames at 60fps; verify boats are still animating.
   // Count main-thread activity via DevTools Performance tab; expect 0 rAF calls during pan.
   ```

2. **Zoom regen (desktop):**

   ```
   // Zoom while a boat is mid-animation
   map.setZoom(15)
   // Verify boat doesn't teleport. Measure currentTime before/after; should be preserved (progress × newDuration).
   ```

3. **Theme & color (desktop):**

   ```
   // Call refreshTheme() and inspect --boat-ink value; should update instantly.
   ```

4. **Visibility pause (desktop):**
   ```
   // Programmatically hide the page: document.hidden = true (needs synthetic event)
   // Verify animations are paused (DevTools Animations panel should show "paused").
   ```

## Rollback

If the rewrite causes unforeseen issues:

1. **Revert to main branch:** `git revert` the commits or `git checkout main — app/composables/useRiverBoats.ts app/assets/css/food-map.css`.
2. **Re-enable the pause-on-movestart patch** (already in place as a surgical fix) to restore the freeze-during-pan behavior as a holding pattern.
3. **No data loss or schema changes;** only JavaScript behavior is affected.

## Summary

- **Transform keyframes + Web Animations API** guarantee compositor motion (zero main-thread cost during pans).
- **Zoom regeneration** preserves vessel progress via seek; no teleports.
- **Dwell logic** encoded as keyframe plateaus; terminal layovers extend the hold.
- **Speed variance** encoded as per-animation duration; staggering is per-animation delay.
- **Direction flip** baked into keyframes at turn points.
- **Public API stable;** only internal vessel state and rAF loop removal.
- **8 phases, 15 tasks**, each independently testable.
- **Expected outcome:** Smooth boat animation during map pans on low-end devices; no main-thread starvation of the drag handler.
