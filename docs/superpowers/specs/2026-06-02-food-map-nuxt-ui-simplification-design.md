# Food Map — Nuxt UI Simplification Design

**Date:** 2026-06-02
**Branch / worktree:** `feat/food-map-simplify` (`../jen-lab-food-map-simplify`)
**Target:** `app/pages/sydney-food-map.vue` and its component suite
**Goal:** Use more Nuxt UI v4, write less custom CSS/JS — with **zero behavioral side effects**.
**Method:** 6-unit parallel analysis + synthesis workflow (`food-map-simplify-analysis`).

---

## Verdict

Realistic gain is **modest: ~80–120 lines (~8–11%) off the 1050-line `food-map.css`**, by swapping
a handful of purely-presentational primitives (buttons, badge/chips, divider, tabs, search input)
for Nuxt UI equivalents. The page is a high-constraint cartographic design system; most of its CSS
is load-bearing (Leaflet, theme tokens, emoji ink-filters, drawer↔map timing, pin animation) and
**must not be touched**.

This is **not** a "delete most of the custom CSS" win. It is a small, surgical cleanup. If the user's
expectation is a large reduction, the honest answer is: the custom CSS is the product here.

---

## The central caveat (read before any change)

Nuxt UI components color themselves from the **global** theme (Tailwind palette via `app.config.ts`),
**not** from the food-map's scoped CSS custom properties (`--accent`, `--paper`, `--foreground`,
`--ink-filter-soft`). These tokens live under the `.food-map-page` scope precisely so they do **not**
leak into the rest of the site.

Therefore a bare `<UButton>` / `<UBadge>` will render in the site's neutral/slate palette and **break
the parchment aesthetic** — color bleed, wrong shadows (the theme uses a brown `rgba(61,40,23,0.16)`),
wrong border radius.

**Consequence:** every "safe win" below is only safe if the Nuxt UI component is forced back onto the
food-map tokens — via `:ui` slot classes, `class` passthrough binding to `var(--accent)` etc., or a
food-map-scoped variant. Without that, these are *not* zero-side-effect changes. The per-unit analysis
agents flagged this repeatedly; the synthesis was over-optimistic in calling raw swaps "safe."

**Hard rule for implementation:** after each swap, diff the computed styles (color, background,
box-shadow, border-radius, font-family) against the current build. Pixel-match or revert. No
screenshot-glancing — compare computed values, per the project's verification habit.

---

## Tier 1 — Safe wins (do these; each is small and reversible)

Ordered by value ÷ effort. Each requires the token-binding from the caveat above.

| # | Change | Component | Unit | ~Lines | Note |
|---|--------|-----------|------|--------|------|
| 1 | Drawer Food/Area tabs → `UTabs` (or `UButton` group) | `UTabs` | `FoodMapListDrawer.vue` 153–157 · css 491–507 | ~20 | Underline must use `--accent`, not theme primary. No animation coupling. Highest confidence. |
| 2 | Recommendation chips → `UBadge variant="outline"` | `UBadge` | `FoodMapDetail.vue` 40–43 · css 857–871 | ~15 | Keep the `✦` glyph in template. Map badge colors to `--paper`/`--accent` or it goes bright. |
| 3 | Theme-menu divider → `USeparator` | `USeparator` | `FoodMapThemeMenu.vue` 78 · css 339–343 | ~5 | Trivial. Replicate `my` margins via `:ui`. |
| 4 | Theme-menu trigger **button only** → `UButton variant="ghost"` | `UButton` | `FoodMapThemeMenu.vue` 15–22 · css 245–270 | ~18 | Trigger button only — **not** the dropdown (Tier 2). |
| 5 | Home link → `UButton` + `UIcon` | `UButton`,`UIcon` | `FoodMapApp.vue` 58–66 · css 214–243 | ~20 | Circular, brown hover (`--accent`). Verify shape + shadow match. |
| 6 | Map zoom/recenter controls → `UButton` group | `UButton` | `FoodMapApp.vue` 82–91 · css 154–209 | ~25 | Keep 38px size + brown shadow. Absolute position stays in Vue. |
| 7 | Drawer SVG icons (chevron/hamburger) → `UIcon` | `UIcon` | `FoodMapListDrawer.vue` 65–97 | ~0 (DX) | No line savings, but removes inline SVG noise. Optional. |

**Note on #6 search input:** the analysis disagreed on whether the search field is actually wired in
the current template. **Verify the `.search-field` markup renders before spending effort** — one agent
found it referenced only in CSS. If present, `UInput` + positioned left icon is a Tier-1 swap (~18 lines).

---

## Tier 2 — Risky candidates (only with explicit verification; default = leave alone)

| Change | Why risky | Gate before attempting |
|--------|-----------|------------------------|
| Theme-menu dropdown → `UDropdownMenu` | It is a custom **drop-UP** (opens above), 300px wide, with swatch+text+metadata rows and an embedded toggle — not a standard action menu. Popper.js positioning can collide with Leaflet z-index. | Must prove: offset/width preserved, no z-index burial under map controls, swatch rows still render. High chance of net-negative. |
| Boats toggle → `UToggle` | Bespoke knob slide `translateX(18px)`, 140ms `cubic-bezier(0,0.6,0.4,1)`. `UToggle` likely differs in transform/timing; the toggle drives a map animation, so feel must match exactly. | Diff exact transform + duration + easing before/after. |
| Drawer panel → `USlideover`/`UCard` | **Critical.** `max-height: 56%` is a hard constraint (must not hide tabs/list); slide is `320ms` synced to Leaflet `invalidateSize()` at a 360ms timeout. Wrong timing repaints the map mid-slide and breaks zoom/pan. | Almost certainly **do not attempt** — see Tier 3. |
| Restaurant row active state → `UButton`/`UCard` | The `inset 3px 0 0 var(--accent)` left border is the *only* on-list selection signal; `grid-template-columns: 24px 1fr auto` must not shift; emoji `--ink-filter-soft` must stay. | Keep custom unless a true 1:1 wrapper is proven. |

---

## Tier 3 — Keep as-is (do **not** touch; this is the load-bearing core)

- **Pin pop-in animation** (`@keyframes r-pin-pop`, css ~936–952): scale `0.7→2.26→1.8→2.12→2`. This *is* the selection UX.
- **Marker teardrop** shape/rotation + emoji overlay (css ~874–968).
- **Drawer collapse ↔ map invalidation timing** (320ms transition + 360ms `invalidateSize`).
- **Theme token scope** (`.food-map-page`, css ~33–75) + **JS token injection** (`FoodMapStage.vue` ~45–52) — runtime theme switching + isolation from the rest of the site.
- **Emoji ink-filter chain** (`grayscale sepia saturate hue-rotate brightness`) — no Tailwind equivalent.
- **Category/restaurant row grid** (`28px/24px 1fr auto`) — data-driven, `--cat` color injection.
- **Parchment wash + grain** pseudo-elements (blend modes, feTurbulence noise).
- **Entry-panel `max-height: 56%`** + chevron rotation.
- **Leaflet attribution** styling (library-generated DOM; legally required).
- **WebKit scrollbar** theming; **ferry boat / suburb label** SVG tinting.

---

## Estimated reduction

**~80–120 lines of custom CSS (~8–11%)**, almost entirely from Tier 1. No JS-logic reduction is
recommended: `useFoodMapStore` / `useFoodMapTheme` are intentionally custom (runtime theme injection,
isolation) and VueUse swaps would risk the theme-switching behavior for no real simplification.

## Suggested implementation order

1. `UTabs` (tabs) — lowest risk, highest confidence
2. `UBadge` (rec chips)
3. `USeparator` (divider)
4. `UButton` (theme-menu trigger button only)
5. `UButton` + `UIcon` (home link)
6. `UButton` group (map zoom/recenter controls)
7. *If wired:* `UInput` (search field)
8. **CONDITIONAL** — `UToggle` (boats) — only after exact-timing diff
9. **CONDITIONAL** — `UDropdownMenu` (theme dropdown) — only after positioning/z-index proof
10. **DO NOT ATTEMPT** — drawer panel, pin animations, theme-token migration, row grid

## Definition of done (per change)

- Computed-style diff (color, bg, box-shadow, border-radius, font-family) vs. pre-change build — matched or reverted.
- Webwright screenshot of the affected region, read and confirmed against current behavior.
- All four themes (engraving / handtint / voyager / topographic) still render correctly — tokens did not bleed to site.
- `pnpm check` clean.

---

*Generated by the `food-map-simplify-analysis` workflow (6 analysis agents + 1 synthesis), 2026-06-02.
Full raw findings retained in the workflow transcript.*
