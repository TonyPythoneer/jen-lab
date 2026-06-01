# Sydney Food Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Implementer notes (self-review fixes):**
>
> - Task 5 `FoodMapListDrawer`: capture `const props = defineProps<...>()` — without this `props` is undefined in `<script setup>`.
> - Task 5 `FoodMapListDrawer`: add an `allRestaurants` prop (all restaurants, for category counts). Category counts must reflect the TOTAL per category, not just the visible set. `FoodMapApp` passes `:all-restaurants="props.restaurants"` (all) and `:restaurants="visibleRestaurants"` (filtered).
> - Task 5 restaurant rows: replace `categoryGlyph(r as any)` with `CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0)` to avoid the type cast.

**Goal:** Implement `/sydney-food-map` — a full-bleed atlas-style Leaflet map of Sydney restaurants, ported from `~/Downloads/jen-good-map(1)/` into Nuxt 4 SFCs.

**Architecture:** All scaffold files (composables, stubs, nuxt.config, CSS tokens, content) are already in place. This plan fills in the stub implementations. `FoodMapApp.vue` is the layout shell; `FoodMapStage.vue` owns Leaflet (inside `<ClientOnly>`); three drawers + a theme menu float over the map.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Leaflet 1.9, `@nuxt/content`, Tailwind (for page-level utilities only — food map uses its own scoped CSS)

**Reference:** `~/Downloads/jen-good-map(1)/` — `vue-app.js` (583 lines), `vue-composables.js` (347 lines), `styles.css` (672 lines). Read these before implementing each component.

---

## Files

| File                                               | Action                                           |
| -------------------------------------------------- | ------------------------------------------------ |
| `app/assets/data/pages/restaurants.ts`             | Add `Category` type export                       |
| `app/utils/food-map-categories.ts`                 | New — CATEGORY_EN, CATEGORY_ICON, categoryGlyph  |
| `app/assets/css/food-map.css`                      | Rewrite — full port of `styles.css`              |
| `app/pages/sydney-food-map.vue`                    | Remove placeholder, wire FoodMapApp              |
| `app/components/food-map/FoodMapApp.vue`           | Implement — layout shell + provide               |
| `app/components/food-map/FoodMapStage.vue`         | Implement — full Leaflet                         |
| `app/components/food-map/FoodMapHeader.vue`        | Implement — brand block (rendered inside drawer) |
| `app/components/food-map/FoodMapListDrawer.vue`    | Implement — left collapsible drawer              |
| `app/components/food-map/FoodMapDetailsDrawer.vue` | Implement — right slide-in details               |
| `app/components/food-map/FoodMapThemeMenu.vue`     | Implement — theme switcher                       |

---

## Task 1: Category type + utilities

**Files:**

- Modify: `app/assets/data/pages/restaurants.ts` (add one export line at end)
- Create: `app/utils/food-map-categories.ts`

- [ ] **Export `Category` type from restaurants.ts**

Add at the end of `app/assets/data/pages/restaurants.ts`:

```ts
export type Category = (typeof categories)[number];
```

- [ ] **Create `app/utils/food-map-categories.ts`**

```ts
import type { Category } from "~/assets/data/pages/restaurants";

// English names for the category list drawer (Chinese names are in categories.ts)
export const CATEGORY_EN: Record<string, string> = {
  steakhouse: "Steakhouse",
  fine_dining: "Fine Dining",
  thai: "Thai",
  korean: "Korean",
  japanese: "Japanese",
  chinese: "Chinese",
  taiwanese: "Taiwanese",
  malaysian: "Malaysian",
  french: "French",
  italian: "Italian",
  spanish: "Spanish",
  middle_eastern: "Middle Eastern",
  dessert: "Dessert",
  coffee: "Coffee",
  bar: "Bar",
  bubble_tea: "Bubble Tea",
};

// Emoji glyph for each category (flags for national cuisines, food icon for types)
export const CATEGORY_ICON: Record<string, string> = {
  steakhouse: "🥩",
  fine_dining: "🍷",
  thai: "🇹🇭",
  korean: "🇰🇷",
  japanese: "🇯🇵",
  chinese: "🇨🇳",
  taiwanese: "🇹🇼",
  malaysian: "🇲🇾",
  french: "🇫🇷",
  italian: "🇮🇹",
  spanish: "🇪🇸",
  middle_eastern: "🧆",
  dessert: "🍰",
  coffee: "☕",
  bar: "🍸",
  bubble_tea: "🧋",
};

export function categoryGlyph(c: Category): string {
  return CATEGORY_ICON[c.id] ?? c.name.charAt(0);
}
```

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/assets/data/pages/restaurants.ts app/utils/food-map-categories.ts
git commit -m "feat(food-map): add Category type export and category utilities"
```

---

## Task 2: Full CSS port (`food-map.css`)

**Files:**

- Rewrite: `app/assets/css/food-map.css`

The current file only has the `--fm-*` token scaffold. Replace it entirely with the full port of `styles.css` from the reference.

**CSS scoping rules:**

- `styles.css` `:root { }` → `.food-map-page { }` (using **original variable names** — they cascade to all children, safely overriding the global site tokens within this page only)
- `styles.css` `.app { }` → `.food-map-app { }`
- All other class names stay the same (`.map-surface`, `.list-drawer`, `.details-drawer`, etc.)
- Remove `--fm-*` prefix entirely — use `--background`, `--accent`, `--font-serif`, etc. as-is

- [ ] **Rewrite `app/assets/css/food-map.css`**

```css
/* =============================================================================
 * food-map.css — Atlas design tokens + full UI
 * Scoped to .food-map-page. Overrides global site tokens for children via CSS
 * custom property cascade (more-specific selector wins).
 * Source: ~/Downloads/jen-good-map(1)/styles.css
 * ========================================================================== */

.food-map-page {
  --background: #f2e8ce;
  --foreground: #3d2817;
  --primary: #fbf6e7;
  --muted: #e9dec5;
  --muted-foreground: #857560;
  --accent: #993c1d;
  --accent-soft: #b85a3a;
  --border: #d9c8a8;
  --border-strong: #b8a17a;
  --paper: #fbf6e7;
  --map-bg: #e9dcbf;
  --font-serif:
    "Crimson Pro", "Shippori Mincho", "Noto Serif TC", "Noto Serif JP", ui-serif, Georgia, serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --map-boundary: #7c5d3a;
  --map-water-accent: #b8a878;
  --map-label: #6b4f2e;
  --ink-filter: grayscale(1) sepia(1) saturate(2.4) hue-rotate(-12deg) brightness(0.74)
    contrast(1.05);
  --ink-filter-soft: grayscale(1) sepia(1) saturate(2) hue-rotate(-12deg) brightness(0.86)
    contrast(1.02);

  /* theme-driven — JS sets these on .map-surface at runtime */
  --tile-filter: none;
  --tile-wash: transparent;
  --paper-grain-opacity: 0.5;
}

* {
  box-sizing: border-box;
}

.food-map-page,
.food-map-page button {
  font-family: var(--font-serif);
  color: var(--foreground);
}
.food-map-page button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.food-map-page a {
  color: inherit;
}

/* ===================== APP SHELL ===================== */

.food-map-app {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--map-bg);
}

.map-surface {
  position: absolute;
  inset: 0;
  isolation: isolate;
  background: var(--map-bg);
}

.map-surface .leaflet-tile-pane {
  filter: var(--tile-filter);
}

/* parchment wash — multiply blend over tiles */
.map-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 250;
  pointer-events: none;
  background: var(--tile-wash);
  mix-blend-mode: multiply;
}

/* procedural paper grain */
.map-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 260;
  pointer-events: none;
  opacity: var(--paper-grain-opacity);
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 180px 180px;
}

.map-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 450;
  box-shadow: inset 0 0 160px 40px rgba(61, 40, 23, 0.16);
}

.leaflet-container {
  background: var(--map-bg) !important;
  font-family: var(--font-serif);
}
.leaflet-control-attribution {
  background: rgba(251, 246, 231, 0.82) !important;
  font-family: var(--font-mono);
  font-size: 9px !important;
  color: var(--muted-foreground) !important;
  border: 1px solid var(--border) !important;
  border-bottom: none;
  border-right: none;
}
.leaflet-control-attribution a {
  color: var(--accent) !important;
}

/* ===================== MAP CONTROLS ===================== */

.map-controls {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 600;
}
.map-controls__group {
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--foreground);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(61, 40, 23, 0.16);
}
.map-controls__group button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--foreground);
  font-size: 19px;
  line-height: 1;
  transition:
    background 100ms,
    color 100ms;
}
.map-controls__group button:first-child {
  border-bottom: 1px solid var(--border-strong);
}
.map-controls__group button:hover {
  background: var(--accent);
  color: var(--primary);
}
.map-controls__solo {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  background: var(--paper);
  border: 1px solid var(--foreground);
  border-radius: 6px;
  color: var(--foreground);
  box-shadow: 0 2px 8px rgba(61, 40, 23, 0.16);
  transition:
    background 100ms,
    color 100ms;
}
.map-controls__solo:hover {
  background: var(--accent);
  color: var(--primary);
}

/* ===================== THEME MENU ===================== */

.theme-menu {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 650;
}
.theme-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 16px;
  background: var(--paper);
  border: 1px solid var(--foreground);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--foreground);
  box-shadow: 0 2px 10px rgba(61, 40, 23, 0.16);
}
.theme-menu__trigger:hover {
  background: var(--muted);
}
.theme-menu__list {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  background: var(--paper);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 12px 36px rgba(61, 40, 23, 0.26);
}
.theme-menu__heading {
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  padding: 6px 8px 8px;
}
.theme-menu__item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px 8px;
  border-radius: 6px;
  text-align: left;
  transition: background 100ms;
}
.theme-menu__item:hover {
  background: var(--muted);
}
.theme-menu__item.is-active {
  background: var(--background);
  box-shadow: inset 0 0 0 1px var(--border-strong);
}
.theme-menu__swatch {
  width: 34px;
  height: 34px;
  border-radius: 5px;
  border: 1px solid var(--border-strong);
  flex-shrink: 0;
}
.theme-menu__swatch[data-theme="parchment"] {
  background: linear-gradient(135deg, #e5d3a8 0 60%, #cdbb8c 60%);
}
.theme-menu__swatch[data-theme="engraving"] {
  background: linear-gradient(135deg, #f3eede 0 52%, #2c241a 52%);
}
.theme-menu__swatch[data-theme="handtint"] {
  background: linear-gradient(125deg, #ead9bb 0 42%, #c08a72 42% 70%, #9fb6c0 70%);
}
.theme-menu__swatch[data-theme="voyager"] {
  background: linear-gradient(135deg, #e7dcc0 0 58%, #8fb6d4 58%);
}
.theme-menu__swatch[data-theme="satellite"] {
  background: linear-gradient(135deg, #3f5a3a 0 45%, #2f4f63 45% 78%, #1f3a4a 78%);
}
.theme-menu__swatch[data-theme="topographic"] {
  background: linear-gradient(135deg, #ddca9c 0 55%, #b7a06f 55% 78%, #9bb1bf 78%);
}
.theme-menu__swatch[data-theme="cool"] {
  background: linear-gradient(135deg, #dfe0d2 0 58%, #93b3bf 58%);
}
.theme-menu__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.theme-menu__name {
  font-size: 13px;
  font-weight: 600;
}
.theme-menu__note {
  font-size: 10px;
  color: var(--muted-foreground);
  letter-spacing: 0.02em;
}

/* ===================== LIST DRAWER ===================== */

.list-drawer {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 348px;
  z-index: 700;
}
.list-drawer__panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--background);
  border-right: 1px solid var(--border-strong);
  box-shadow: 6px 0 28px rgba(61, 40, 23, 0.16);
  transition: transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 0;
}
.list-drawer.is-collapsed .list-drawer__panel {
  transform: translateX(-100%);
}
.list-drawer__handle {
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 8px;
  background: var(--paper);
  border: 1px solid var(--border-strong);
  border-left: none;
  border-radius: 0 8px 8px 0;
  color: var(--foreground);
  box-shadow: 4px 2px 12px rgba(61, 40, 23, 0.16);
  transition: background 120ms;
}
.list-drawer__handle:hover {
  background: var(--muted);
}
.list-drawer.is-collapsed .list-drawer__handle {
  left: 0;
}
.list-drawer__handle-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 0.04em;
}

/* brand block */
.drawer-brand {
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--border-strong);
}
.drawer-brand__seal {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 7px;
  white-space: nowrap;
}
.drawer-brand__seal .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}
.drawer-brand__title {
  font-size: 27px;
  font-weight: 700;
  line-height: 1.04;
  margin: 0;
}
.drawer-brand__subtitle {
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  margin-top: 7px;
}
.drawer-brand__reset {
  margin-top: 13px;
  white-space: nowrap;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  padding: 6px 11px;
  transition: all 120ms;
}
.drawer-brand__reset:hover {
  color: var(--primary);
  background: var(--accent);
  border-color: var(--accent);
}

/* tabs + search */
.list-drawer__tabs {
  display: flex;
  border-bottom: 1px solid var(--border-strong);
}
.list-drawer__tabs button {
  flex: 1;
  padding: 13px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--muted-foreground);
  border-bottom: 2px solid transparent;
  letter-spacing: 0.04em;
}
.list-drawer__tabs button.is-active {
  color: var(--foreground);
  border-bottom-color: var(--accent);
  background: var(--paper);
}
.list-drawer__tabs button + button {
  border-left: 1px solid var(--border);
}

.search-field {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-strong);
  background: var(--paper);
  border-radius: 5px;
  padding: 9px 11px;
  margin: 14px 18px 6px;
}
.search-field input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--foreground);
}
.search-field input::placeholder {
  color: var(--muted-foreground);
}
.search-field .icon {
  width: 14px;
  height: 14px;
  color: var(--muted-foreground);
}

/* section labels + list */
.drawer-section-label {
  padding: 12px 20px 6px;
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.drawer-section-label .count {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--accent);
}
.drawer-list {
  flex: 1;
  overflow-y: auto;
  padding: 2px 0 24px;
}
.drawer-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  width: 100%;
  text-align: left;
}
.drawer-back:hover {
  background: var(--muted);
}
.drawer-empty {
  padding: 24px 20px;
  color: var(--muted-foreground);
  font-size: 13px;
}

/* category rows */
.category-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 100ms;
}
.category-row:hover,
.category-row.is-hovered {
  background: var(--muted);
}
.category-row__glyph {
  --cat: var(--accent);
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  display: grid;
  place-items: center;
  font-size: 15px;
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  background: var(--paper);
  filter: var(--ink-filter-soft);
  transition:
    border-color 120ms,
    box-shadow 120ms;
}
.category-row.is-hovered .category-row__glyph {
  border-color: var(--cat);
  box-shadow: inset 0 0 0 1px var(--cat);
}
.category-row__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.category-row__name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.1;
}
.category-row__sub {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  margin-top: 2px;
}
.category-row__count {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--muted-foreground);
  padding: 2px 8px;
  border: 1px solid var(--border-strong);
  border-radius: 9999px;
}

.area-group {
  padding: 12px 20px 4px;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

/* restaurant rows */
.restaurant-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 11px;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px dotted var(--border-strong);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 100ms;
}
.restaurant-row:hover {
  background: var(--muted);
}
.restaurant-row.is-active {
  background: var(--paper);
  box-shadow: inset 3px 0 0 var(--accent);
}
.restaurant-row__glyph {
  --cat: var(--accent);
  width: 24px;
  height: 24px;
  border: 1px solid var(--border);
  border-radius: 4px;
  display: grid;
  place-items: center;
  background: var(--paper);
  font-size: 13px;
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  filter: var(--ink-filter-soft);
  transition: border-color 120ms;
}
.restaurant-row:hover .restaurant-row__glyph,
.restaurant-row.is-active .restaurant-row__glyph {
  border-color: var(--cat);
}
.restaurant-row__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.restaurant-row__name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.restaurant-row__cat {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.restaurant-row__price {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 0.06em;
}

/* ===================== DETAILS DRAWER ===================== */

.details-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 92vw;
  background: var(--background);
  border-left: 1px solid var(--border-strong);
  box-shadow: -8px 0 32px rgba(61, 40, 23, 0.22);
  z-index: 720;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 340ms cubic-bezier(0.4, 0, 0.2, 1);
}
.details-drawer.is-open {
  transform: translateX(0);
}
.detail {
  padding: 22px 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detail__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.detail__close {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  font-size: 22px;
  line-height: 1;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  color: var(--foreground);
  transition: all 120ms;
}
.detail__close:hover {
  background: var(--accent);
  color: var(--primary);
  border-color: var(--accent);
}
.detail__chapter {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.detail__chapter-icon {
  font-size: 14px;
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  filter: var(--ink-filter);
}
.detail__title {
  font-size: 27px;
  font-weight: 700;
  line-height: 1.08;
  margin: 0;
}
.detail__coords {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.detail__meta {
  display: flex;
  gap: 18px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.detail__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail__meta-item .lbl {
  font-size: 9px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.detail__meta-item .val {
  font-size: 14px;
  font-weight: 600;
  color: var(--foreground);
}
.detail__meta-item.price .val {
  color: var(--accent);
  font-family: var(--font-mono);
}
.detail__summary {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
  margin: 0;
  font-style: italic;
  border-left: 2px solid var(--accent);
  padding-left: 14px;
  color: var(--foreground);
  text-wrap: pretty;
}
.detail__block {
  display: flex;
  flex-direction: column;
}
.detail__desc {
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  color: var(--foreground);
  text-wrap: pretty;
}
.detail__section-label {
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.detail__section-label::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-strong);
}
.detail__recs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rec-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--foreground);
  border-radius: 9999px;
  font-size: 12px;
  background: var(--paper);
}
.rec-chip::before {
  content: "✦";
  color: var(--accent);
  font-size: 10px;
}
.detail__actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 11px 18px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 5px;
  border: 1px solid var(--accent);
  background: var(--primary);
  color: var(--foreground);
  transition:
    background 120ms,
    color 120ms;
}
.btn:hover {
  background: var(--accent);
  color: var(--primary);
}
.btn.is-disabled {
  opacity: 0.5;
  cursor: default;
  border-color: var(--border-strong);
}
.btn.is-disabled:hover {
  background: var(--primary);
  color: var(--foreground);
}

/* ===================== MAP MARKERS ===================== */

.r-pin-wrap {
  width: 38px;
  height: 46px;
}
.r-pin {
  --cat: var(--accent);
  position: absolute;
  top: 2px;
  left: 5px;
  width: 28px;
  height: 28px;
  background: var(--paper);
  border: 1.25px solid var(--foreground);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  transform-origin: center;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(61, 40, 23, 0.18);
  transition:
    border-width 130ms,
    border-color 130ms,
    opacity 160ms,
    transform 150ms,
    box-shadow 150ms;
}
.r-pin__glyph {
  transform: rotate(45deg);
  font-size: 15px;
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  user-select: none;
  filter: var(--ink-filter);
}
.r-pin.is-group {
  border-width: 3px;
  border-color: var(--cat);
  transform: rotate(-45deg) scale(1.14);
  box-shadow: 0 3px 7px rgba(61, 40, 23, 0.28);
  z-index: 600;
}
.r-pin.is-faded {
  opacity: 0.22;
  box-shadow: none;
}
.r-pin.is-active {
  border-width: 3px;
  border-color: var(--cat);
  transform: rotate(-45deg) scale(1.22);
  box-shadow:
    0 0 0 4px rgba(153, 60, 29, 0.16),
    0 4px 9px rgba(61, 40, 23, 0.3);
  z-index: 1000;
}

.leaflet-tooltip.r-tip {
  background: var(--paper);
  border: 1px solid var(--foreground);
  border-radius: 2px;
  color: var(--foreground);
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  box-shadow: none;
  white-space: nowrap;
}
.leaflet-tooltip.r-tip::before {
  display: none;
}

.suburb-label-wrap {
  pointer-events: none;
  width: auto !important;
  height: auto !important;
}
.suburb-label {
  display: inline-block;
  transform: translate(-50%, -50%);
  font-family: var(--font-serif);
  font-size: 10px;
  font-style: italic;
  color: var(--map-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow:
    0 0 2px var(--label-halo, var(--background)),
    1px 0 0 var(--label-halo, var(--background)),
    -1px 0 0 var(--label-halo, var(--background)),
    0 1px 0 var(--label-halo, var(--background)),
    0 -1px 0 var(--label-halo, var(--background));
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.9;
}

/* scrollbars */
.drawer-list::-webkit-scrollbar,
.details-drawer::-webkit-scrollbar {
  width: 8px;
}
.drawer-list::-webkit-scrollbar-thumb,
.details-drawer::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 4px;
}
.drawer-list::-webkit-scrollbar-track,
.details-drawer::-webkit-scrollbar-track {
  background: transparent;
}

/* ===================== RESPONSIVE ===================== */

@media (max-width: 600px) {
  .list-drawer {
    width: 100vw;
  }
  .details-drawer {
    width: 100vw;
    max-width: 100vw;
  }
}
```

- [ ] **Also update `sydney-food-map.vue` — remove placeholder scoped styles**

Replace the `<style scoped>` block in `app/pages/sydney-food-map.vue`:

```vue
<style scoped>
.food-map-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}
</style>
```

(Remove the `.food-map-placeholder` rule — the placeholder div will go away in Task 8.)

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/assets/css/food-map.css app/pages/sydney-food-map.vue
git commit -m "feat(food-map): port full reference styles.css as scoped food-map.css"
```

---

## Task 3: FoodMapStage.vue (Leaflet map)

**Files:**

- Implement: `app/components/food-map/FoodMapStage.vue`

Reference: `vue-app.js` `MapStage` component (lines 31–282).

Key pattern: Leaflet is imperative. Create the map once in `onMounted`. Use `watch()` to push reactive changes into Leaflet. Never put Leaflet objects into Vue reactive state.

- [ ] **Implement FoodMapStage.vue**

```vue
<script setup lang="ts">
import type { Map as LeafletMap, Marker, TileLayer, GeoJSON, LayerGroup } from "leaflet";
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { MapTheme } from "~/composables/useFoodMapTheme";
import { CATEGORY_ICON, categoryGlyph } from "~/utils/food-map-categories";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  selectedRestaurantId: string | null;
  hoveredCategoryId: string | null;
  theme: MapTheme;
}>();

const emit = defineEmits<{
  select: [id: string];
  hover: [categoryId: string | null];
  ready: [controls: { zoomBy: (d: number) => void; recenter: () => void; invalidate: () => void }];
}>();

const SYDNEY_CENTER: [number, number] = [-33.8675, 151.208];
const BOUNDARY_URL = "https://cdn.jsdelivr.net/gh/tim-massey/sydney-geojson@master/sydney.geojson";

const mapEl = ref<HTMLDivElement | null>(null);

// Non-reactive Leaflet handles (plain variables, never reactive)
let L: typeof import("leaflet") | null = null;
let map: LeafletMap | null = null;
let tileLayer: TileLayer | null = null;
let boundaryLayer: GeoJSON | null = null;
let labelLayer: LayerGroup | null = null;
const markers: Record<string, Marker> = {};

function applyTheme(theme: MapTheme) {
  if (!map || !L) return;
  if (tileLayer) map.removeLayer(tileLayer);
  tileLayer = L.tileLayer(theme.tiles.url, theme.tiles.options as any).addTo(map);

  const el = mapEl.value;
  if (el) {
    el.style.setProperty("--tile-filter", theme.filter);
    el.style.setProperty("--tile-wash", theme.wash);
    el.style.setProperty("--paper-grain-opacity", String(theme.grain));
    for (const [k, v] of Object.entries(theme.vars)) {
      el.style.setProperty(k, v);
    }
    // clear satellite-only label halo when switching away
    if (!theme.vars["--label-halo"]) el.style.setProperty("--label-halo", "");
  }
  if (boundaryLayer) {
    boundaryLayer.setStyle({ color: theme.vars["--map-boundary"] });
  }
}

function loadBoundaries() {
  fetch(BOUNDARY_URL)
    .then((r) => r.json())
    .then((data) => {
      if (!map || !L) return;
      const color = props.theme.vars["--map-boundary"] ?? "#7c5d3a";
      boundaryLayer = L.geoJSON(data, {
        style: {
          color,
          weight: 0.8,
          opacity: 0.5,
          fill: false,
          lineCap: "round",
          lineJoin: "round",
        },
        interactive: false,
        pane: "overlayPane",
      }).addTo(map);

      labelLayer = L.layerGroup();
      boundaryLayer.eachLayer((layer: any) => {
        const name = layer.feature?.properties?.SSC_NAME;
        if (!name) return;
        const label = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
        const center = layer.getBounds().getCenter();
        labelLayer!.addLayer(
          L!.marker(center, {
            icon: L!.divIcon({
              className: "suburb-label-wrap",
              html: `<span class="suburb-label">${label}</span>`,
              iconSize: undefined,
              iconAnchor: [0, 0],
            }),
            interactive: false,
            keyboard: false,
          }),
        );
      });

      const updateLabels = () => {
        if (!map) return;
        if (map.getZoom() >= 14) {
          if (!map.hasLayer(labelLayer!)) labelLayer!.addTo(map);
        } else if (map.hasLayer(labelLayer!)) {
          map.removeLayer(labelLayer!);
        }
      };
      map.on("zoomend", updateLabels);
      updateLabels();
    })
    .catch((e) => console.warn("Suburb boundary overlay unavailable:", e?.message ?? e));
}

function buildMarkers(list: EnrichedRestaurant[]) {
  if (!map || !L) return;
  Object.values(markers).forEach((m) => m.remove());
  Object.keys(markers).forEach((k) => delete markers[k]);

  for (const r of list) {
    const color = r.categoryColor;
    const glyph = CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0);
    const icon = L.divIcon({
      className: "r-pin-wrap",
      html: `<div class="r-pin" data-id="${r.id}" data-cat="${r.categoryId}" style="--cat:${color}"><span class="r-pin__glyph">${glyph}</span></div>`,
      iconSize: [38, 46],
      iconAnchor: [19, 43],
    });
    const m = L.marker([r.coordinates.lat, r.coordinates.lng], { icon, riseOnHover: true });
    m.bindTooltip(r.name, { className: "r-tip", direction: "top", offset: [0, -40] });
    m.on("click", () => emit("select", r.id));
    m.on("mouseover", () => emit("hover", r.categoryId));
    m.on("mouseout", () => emit("hover", null));
    m.addTo(map);
    markers[r.id] = m;
  }
  applySelection();
  applyHover();
}

function applySelection() {
  const sel = props.selectedRestaurantId;
  for (const [id, m] of Object.entries(markers)) {
    const el = m.getElement()?.querySelector(".r-pin");
    el?.classList.toggle("is-active", id === sel);
  }
}

function applyHover() {
  const hov = props.hoveredCategoryId;
  const sel = props.selectedRestaurantId;
  for (const [id, m] of Object.entries(markers)) {
    const el = m.getElement()?.querySelector(".r-pin");
    if (!el) continue;
    const r = props.restaurants.find((x) => x.id === id);
    const inGroup = hov != null && r?.categoryId === hov;
    const faded = hov != null && !inGroup && id !== sel;
    el.classList.toggle("is-group", inGroup);
    el.classList.toggle("is-faded", faded);
  }
}

onMounted(async () => {
  if (!mapEl.value) return;
  L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");

  map = L.map(mapEl.value, {
    center: SYDNEY_CENTER,
    zoom: 14,
    zoomControl: false,
    attributionControl: true,
    minZoom: 11,
    maxZoom: 18,
  });

  applyTheme(props.theme);
  loadBoundaries();
  buildMarkers(props.restaurants);

  const invalidate = () => map?.invalidateSize({ animate: false });
  window.addEventListener("resize", invalidate);

  emit("ready", {
    zoomBy: (d: number) => map?.setZoom((map.getZoom() ?? 14) + d),
    recenter: () => map?.flyTo(SYDNEY_CENTER, 14, { duration: 0.6 }),
    invalidate,
  });

  watch(
    () => props.restaurants,
    (list) => {
      buildMarkers(list);
      if (list.length > 0 && list.length < 100) {
        const grp = L!.featureGroup(Object.values(markers));
        try {
          map?.fitBounds(grp.getBounds().pad(0.25), { animate: true, maxZoom: 16 });
        } catch {}
      }
    },
  );

  watch(
    () => props.selectedRestaurantId,
    (id) => {
      applySelection();
      if (id && markers[id]) {
        map?.flyTo(markers[id].getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
      }
    },
  );

  watch(() => props.hoveredCategoryId, applyHover);
  watch(
    () => props.theme,
    (t) => applyTheme(t),
  );

  onUnmounted(() => {
    window.removeEventListener("resize", invalidate);
    map?.remove();
    map = null;
  });
});
</script>

<template>
  <div ref="mapEl" class="map-surface" />
</template>
```

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/components/food-map/FoodMapStage.vue
git commit -m "feat(food-map): implement FoodMapStage with Leaflet, boundaries, markers, themes"
```

---

## Task 4: FoodMapHeader.vue (brand block)

**Files:**

- Implement: `app/components/food-map/FoodMapHeader.vue`

This is the brand block rendered at the top of the list drawer (`.drawer-brand`).
Reference: `ListDrawer` template, lines 347–351 in `vue-app.js`.

- [ ] **Implement FoodMapHeader.vue**

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{
    edition?: string;
    districts?: string;
  }>(),
  { edition: "α — 2026", districts: "CBD · Suburbs" },
);

const emit = defineEmits<{ reset: [] }>();
</script>

<template>
  <div class="drawer-brand">
    <span class="drawer-brand__seal">
      <span class="dot" />
      ESTD. 二〇二六
      <span class="dot" />
    </span>
    <h1 class="drawer-brand__title">雪梨食堂誌</h1>
    <div class="drawer-brand__subtitle">Sydney Travelogue Map · A Field Atlas</div>
    <button class="drawer-brand__reset" @click="emit('reset')">↺ Reset Atlas</button>
  </div>
</template>
```

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/components/food-map/FoodMapHeader.vue
git commit -m "feat(food-map): implement FoodMapHeader brand block"
```

---

## Task 5: FoodMapListDrawer.vue

**Files:**

- Implement: `app/components/food-map/FoodMapListDrawer.vue`

Reference: `ListDrawer` component, `vue-app.js` lines 331–431.
Collapsible left drawer with: brand block (FoodMapHeader), Food/Area tabs, search, category list, restaurant list.

- [ ] **Implement FoodMapListDrawer.vue**

```vue
<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { CATEGORY_EN, CATEGORY_ICON, categoryGlyph } from "~/utils/food-map-categories";
import { useFoodMapStore } from "~/composables/useFoodMapStore";

const props = defineProps<{
  categories: readonly Category[];
  restaurants: EnrichedRestaurant[]; // visible (filtered) list
  allRestaurants: EnrichedRestaurant[]; // all restaurants — for category counts
}>();

const emit = defineEmits<{ invalidateMap: [] }>();

const store = useFoodMapStore();

const DRAWER_KEY = "atlas.listOpen";
const open = ref<boolean>(() => {
  try {
    const v = localStorage.getItem(DRAWER_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
});

function toggle() {
  open.value = !open.value;
  try {
    localStorage.setItem(DRAWER_KEY, open.value ? "1" : "0");
  } catch {}
  // let CSS transition finish before Leaflet recalculates viewport
  nextTick(() => setTimeout(() => emit("invalidateMap"), 360));
}

// Count per category from ALL restaurants (not the filtered visible set)
const restaurantsByCategory = computed(() => {
  const m: Record<string, EnrichedRestaurant[]> = {};
  for (const r of props.allRestaurants) (m[r.categoryId] ??= []).push(r);
  return m;
});

const areaGroups = computed(() => {
  const out: Record<string, EnrichedRestaurant[]> = { CBD: [], Suburbs: [] };
  for (const r of props.restaurants) (out[r.area] ??= []).push(r);
  return out;
});
</script>

<template>
  <div :class="['list-drawer', { 'is-collapsed': !open }]">
    <!-- Collapsed edge handle -->
    <button
      class="list-drawer__handle"
      :aria-label="open ? 'Collapse list' : 'Open list'"
      @click="toggle"
    >
      <svg
        v-if="open"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="m15 6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <template v-else>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
        </svg>
        <span class="list-drawer__handle-count">{{ restaurants.length }}</span>
      </template>
    </button>

    <div class="list-drawer__panel">
      <!-- Brand block -->
      <FoodMapHeader
        :total-count="restaurants.length"
        :category-count="categories.length"
        @reset="store.reset()"
      />

      <!-- Tabs -->
      <div class="list-drawer__tabs">
        <button :class="{ 'is-active': store.state.tab === 'food' }" @click="store.setTab('food')">
          食物 · Food
        </button>
        <button :class="{ 'is-active': store.state.tab === 'area' }" @click="store.setTab('area')">
          城市 · Area
        </button>
      </div>

      <!-- Search -->
      <label class="search-field">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" stroke-linecap="round" />
        </svg>
        <input v-model="store.state.search" type="text" placeholder="尋找餐廳 — Search…" />
      </label>

      <!-- Food: category list -->
      <template v-if="store.state.tab === 'food' && !store.state.selectedCategoryId">
        <div class="drawer-section-label">
          <span>類目 · Chapters</span>
          <span class="count">{{ categories.length }}</span>
        </div>
        <div class="drawer-list">
          <button
            v-for="c in categories"
            :key="c.id"
            :class="['category-row', { 'is-hovered': store.state.hoveredCategoryId === c.id }]"
            @click="store.selectCategory(c.id)"
            @mouseenter="store.setHovered(c.id)"
            @mouseleave="store.setHovered(null)"
          >
            <span class="category-row__glyph" :style="{ '--cat': c.color }">{{
              categoryGlyph(c)
            }}</span>
            <span class="category-row__body">
              <span class="category-row__name">{{ c.name }}</span>
              <span class="category-row__sub">{{ CATEGORY_EN[c.id] }}</span>
            </span>
            <span class="category-row__count">{{
              (restaurantsByCategory[c.id] ?? []).length
            }}</span>
          </button>
        </div>
      </template>

      <!-- Food: drilled into a category -->
      <template v-else-if="store.state.tab === 'food' && store.state.selectedCategoryId">
        <button class="drawer-back" @click="store.selectCategory(null)">
          <span>←</span><span>返回 · Back to chapters</span>
        </button>
        <div class="drawer-section-label">
          <span>{{ categories.find((c) => c.id === store.state.selectedCategoryId)?.name }}</span>
          <span class="count">{{ restaurants.length }} entries</span>
        </div>
        <div class="drawer-list">
          <button
            v-for="r in restaurants"
            :key="r.id"
            :class="['restaurant-row', { 'is-active': r.id === store.state.selectedRestaurantId }]"
            @click="store.selectRestaurant(r.id)"
            @mouseenter="store.setHovered(r.categoryId)"
            @mouseleave="store.setHovered(null)"
          >
            <span class="restaurant-row__glyph" :style="{ '--cat': r.categoryColor }">{{
              CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0)
            }}</span>
            <span class="restaurant-row__body">
              <span class="restaurant-row__name">{{ r.name }}</span>
              <span class="restaurant-row__cat">{{ r.categoryName }} · {{ r.area }}</span>
            </span>
            <span class="restaurant-row__price">{{ r.priceRange }}</span>
          </button>
          <div v-if="restaurants.length === 0" class="drawer-empty">
            查無符合 · No matching entries.
          </div>
        </div>
      </template>

      <!-- Area tab -->
      <template v-else>
        <div class="drawer-section-label">
          <span>區域 · Districts</span>
          <span class="count">{{ restaurants.length }}</span>
        </div>
        <div class="drawer-list">
          <template v-for="(grp, area) in areaGroups" :key="area">
            <div v-if="grp.length" class="area-group">
              <span>{{ area === "CBD" ? "市中心 · CBD" : "城郊 · Suburbs" }}</span>
              <span>{{ grp.length }}</span>
            </div>
            <button
              v-for="r in grp"
              :key="r.id"
              :class="[
                'restaurant-row',
                { 'is-active': r.id === store.state.selectedRestaurantId },
              ]"
              @click="store.selectRestaurant(r.id)"
              @mouseenter="store.setHovered(r.categoryId)"
              @mouseleave="store.setHovered(null)"
            >
              <span class="restaurant-row__glyph" :style="{ '--cat': r.categoryColor }">{{
                CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0)
              }}</span>
              <span class="restaurant-row__body">
                <span class="restaurant-row__name">{{ r.name }}</span>
                <span class="restaurant-row__cat">{{ r.categoryName }} · {{ r.area }}</span>
              </span>
              <span class="restaurant-row__price">{{ r.priceRange }}</span>
            </button>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
```

Note: Restaurant rows use `CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0)` directly — avoids casting `EnrichedRestaurant` to `Category`.

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/components/food-map/FoodMapListDrawer.vue
git commit -m "feat(food-map): implement FoodMapListDrawer with Food/Area tabs and search"
```

---

## Task 6: FoodMapDetailsDrawer.vue

**Files:**

- Implement: `app/components/food-map/FoodMapDetailsDrawer.vue`

Reference: `DetailsDrawer` component, `vue-app.js` lines 439–490.
Slide-in from the right when a restaurant is selected. Closes on × button or Esc key.

- [ ] **Implement FoodMapDetailsDrawer.vue**

```vue
<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import { CATEGORY_EN, CATEGORY_ICON } from "~/utils/food-map-categories";

const props = defineProps<{
  restaurant: EnrichedRestaurant | null;
}>();

const emit = defineEmits<{ close: [] }>();

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape" && props.restaurant) emit("close");
}
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div
    :class="['details-drawer', { 'is-open': !!restaurant }]"
    role="dialog"
    aria-label="Place details"
  >
    <div v-if="restaurant" class="detail">
      <div class="detail__topbar">
        <span>Entry · No. {{ restaurant.id.toUpperCase() }}</span>
        <button class="detail__close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <span class="detail__chapter">
        <span class="detail__chapter-icon">{{ CATEGORY_ICON[restaurant.categoryId] }}</span>
        {{ restaurant.categoryName }} · {{ CATEGORY_EN[restaurant.categoryId] }}
      </span>

      <h2 class="detail__title">{{ restaurant.name }}</h2>
      <div class="detail__coords">
        {{ restaurant.area === "CBD" ? "Sydney CBD" : "Inner Suburbs" }} —
        {{ restaurant.coordinates.lat.toFixed(4) }}°, {{ restaurant.coordinates.lng.toFixed(4) }}°
      </div>

      <div class="detail__meta">
        <div class="detail__meta-item price">
          <span class="lbl">Price</span>
          <span class="val">{{ restaurant.priceRange }}</span>
        </div>
        <div class="detail__meta-item">
          <span class="lbl">Area</span>
          <span class="val">{{ restaurant.area }}</span>
        </div>
        <div class="detail__meta-item">
          <span class="lbl">Chapter</span>
          <span class="val">{{ restaurant.categoryName }}</span>
        </div>
      </div>

      <p class="detail__summary">{{ restaurant.summary }}</p>

      <div class="detail__block">
        <div class="detail__section-label">記 · The Note</div>
        <p class="detail__desc">{{ restaurant.description }}</p>
      </div>

      <div v-if="restaurant.recommendations?.length" class="detail__block">
        <div class="detail__section-label">推薦 · Recommended</div>
        <div class="detail__recs">
          <span v-for="(rec, i) in restaurant.recommendations" :key="i" class="rec-chip">{{
            rec
          }}</span>
        </div>
      </div>

      <div class="detail__actions">
        <a
          v-if="restaurant.googleMapsLink"
          class="btn"
          :href="restaurant.googleMapsLink"
          target="_blank"
          rel="noreferrer"
          >Open in Maps ↗</a
        >
        <span v-else class="btn is-disabled">No map link</span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/components/food-map/FoodMapDetailsDrawer.vue
git commit -m "feat(food-map): implement FoodMapDetailsDrawer"
```

---

## Task 7: FoodMapThemeMenu.vue

**Files:**

- Implement: `app/components/food-map/FoodMapThemeMenu.vue`

Reference: `ThemeMenu` component, `vue-app.js` lines 495–542.

- [ ] **Implement FoodMapThemeMenu.vue**

```vue
<script setup lang="ts">
import type { MapTheme } from "~/composables/useFoodMapTheme";

const props = defineProps<{
  themes: MapTheme[];
  activeThemeId: string;
}>();

const emit = defineEmits<{ select: [id: string] }>();

const open = ref(false);

function pick(id: string) {
  emit("select", id);
  open.value = false;
}

const activeTheme = computed(() => props.themes.find((t) => t.id === props.activeThemeId));
</script>

<template>
  <div :class="['theme-menu', { 'is-open': open }]">
    <button class="theme-menu__trigger" aria-label="Map theme" @click="open = !open">
      <!-- layers icon -->
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
      >
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path
          d="m3 12 9 4.5L21 12M3 16.5 12 21l9-4.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ activeTheme?.name }}</span>
    </button>

    <div v-if="open" class="theme-menu__list">
      <div class="theme-menu__heading">地圖樣式 · Map Style</div>
      <button
        v-for="t in themes"
        :key="t.id"
        :class="['theme-menu__item', { 'is-active': activeThemeId === t.id }]"
        @click="pick(t.id)"
      >
        <span class="theme-menu__swatch" :data-theme="t.id" />
        <span class="theme-menu__meta">
          <span class="theme-menu__name">{{ t.name }} · {{ t.en }}</span>
          <span class="theme-menu__note">{{ t.note }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
```

- [ ] **Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/components/food-map/FoodMapThemeMenu.vue
git commit -m "feat(food-map): implement FoodMapThemeMenu"
```

---

## Task 8: FoodMapApp.vue (assembly) + page wire-up

**Files:**

- Implement: `app/components/food-map/FoodMapApp.vue`
- Update: `app/pages/sydney-food-map.vue`

`FoodMapApp` is the layout shell. It:

1. Owns `useFoodMapStore` + `useFoodMapTheme`
2. Derives `visibleRestaurants` and `selectedRestaurant` from store + props
3. Provides map controls (ref filled in by `FoodMapStage` via `@ready` emit)
4. Renders all sub-components in the correct z-order
5. Calls `initFromStorage()` on mount (restore theme from localStorage)

- [ ] **Implement FoodMapApp.vue**

```vue
<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { useFoodMapStore } from "~/composables/useFoodMapStore";
import { useFoodMapTheme } from "~/composables/useFoodMapTheme";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  categories: readonly Category[];
}>();

const store = useFoodMapStore();
const { theme, themeId, themes, setTheme, initFromStorage } = useFoodMapTheme();

const visibleRestaurants = store.makeVisibleList(props.restaurants);
const selectedRestaurant = store.makeSelectedRestaurant(props.restaurants);

// Filled in by FoodMapStage via @ready; used by map controls buttons
const mapControls = reactive<{
  zoomBy: ((d: number) => void) | null;
  recenter: (() => void) | null;
  invalidate: (() => void) | null;
}>({ zoomBy: null, recenter: null, invalidate: null });

function onStageReady(controls: typeof mapControls) {
  Object.assign(mapControls, controls);
}

onMounted(initFromStorage);
</script>

<template>
  <div class="food-map-app">
    <!-- Full-bleed map (SSR-unsafe — must stay in ClientOnly) -->
    <ClientOnly>
      <FoodMapStage
        :restaurants="visibleRestaurants"
        :selected-restaurant-id="store.state.selectedRestaurantId"
        :hovered-category-id="store.state.hoveredCategoryId"
        :theme="theme"
        @select="store.selectRestaurant"
        @hover="store.setHovered"
        @ready="onStageReady"
      />
      <template #fallback>
        <div class="map-surface" />
      </template>
    </ClientOnly>

    <div class="map-vignette" aria-hidden="true" />

    <!-- Theme switcher (top-center) -->
    <FoodMapThemeMenu :themes="themes" :active-theme-id="themeId" @select="setTheme" />

    <!-- Zoom + recenter controls (top-right) -->
    <div class="map-controls">
      <div class="map-controls__group">
        <button aria-label="Zoom in" @click="mapControls.zoomBy?.(1)">+</button>
        <button aria-label="Zoom out" @click="mapControls.zoomBy?.(-1)">−</button>
      </div>
      <button
        class="map-controls__solo"
        aria-label="Recenter on Sydney"
        @click="mapControls.recenter?.()"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Left collapsible list drawer -->
    <FoodMapListDrawer
      :categories="categories"
      :restaurants="visibleRestaurants"
      :all-restaurants="props.restaurants"
      @invalidate-map="mapControls.invalidate?.()"
    />

    <!-- Right slide-in details drawer -->
    <FoodMapDetailsDrawer :restaurant="selectedRestaurant" @close="store.selectRestaurant(null)" />
  </div>
</template>
```

- [ ] **Update `app/pages/sydney-food-map.vue` — remove placeholder div**

```vue
<script setup lang="ts">
import { useRestaurants } from "~/composables/useRestaurants";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Sydney Food Map — Jen Lab",
  description: "An atlas of personally visited restaurants across Sydney.",
});

const isDev = import.meta.dev;
const { categories, filteredRestaurantList, isReady } = useRestaurants();
</script>

<template>
  <div class="food-map-page">
    <SiteHeader v-if="isDev" />
    <FoodMapApp v-if="isReady" :restaurants="filteredRestaurantList" :categories="categories" />
  </div>
</template>

<style>
@import "~/assets/css/food-map.css";
</style>

<style scoped>
.food-map-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}
</style>
```

- [ ] **Run check**

```bash
pnpm check
```

Expected: no type errors.

- [ ] **Commit**

```bash
git add app/components/food-map/FoodMapApp.vue app/pages/sydney-food-map.vue
git commit -m "feat(food-map): assemble FoodMapApp and wire page — ready for visual check"
```

---

## Task 9: Visual verification

- [ ] **Verify the page renders in the browser using webwright**

Use the `webwright:run` skill. Navigate to `http://localhost:3500/sydney-food-map`.

Check:

1. Parchment background fills the viewport
2. Leaflet map loads with tile layer
3. Restaurant pins appear on the map
4. Left drawer is visible with category list
5. Clicking a category shows restaurant list
6. Clicking a restaurant pin opens the details drawer
7. Theme switcher opens and changing theme re-grades the map tiles
8. Suburb boundary outlines appear at zoom ≥ 14
9. Dev SiteHeader visible at top (dev environment only)
10. `pnpm check` passes with no errors

- [ ] **Commit if all checks pass**

```bash
git add -A
git commit -m "feat(food-map): sydney-food-map page complete"
```
