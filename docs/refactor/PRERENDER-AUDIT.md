# Prerender & bundle audit

> Run autonomously on 2026-06-09 against `chore/vp-foundation-align`.
> Goal asked: "find what can be baked into HTML to prerender, shrink JS/CSS by
> moving toward HTML." This documents what's true, what's already done, and what
> is actually worth doing.

## TL;DR (read this first)

**"Baking content into HTML" does not shrink JS/CSS in this app.** vite-ssg is a
*hydration* SSG: after the HTML is prerendered, every component's JS still ships
so Vue can hydrate it and attach interactivity. Prerendering wins **FCP / SEO /
no-JS**, not bundle weight. Those are two separate axes; they only overlap when
prerendering lets you delete a client-side fetch or a library.

Measured against that reality:

- **4 of 5 routes already prerender their content well.** Nothing to do.
- **The one real prerender gap is `/sydney-food-map`** — and that is your active
  WIP (food-map → Velite). Left untouched. See "Food map" below.
- **There is no large "move JS to HTML to shrink the bundle" win available.** The
  bundle weight is interactive-hydration JS (Vue runtime + reka-ui primitives),
  which prerendering cannot remove. Cutting it needs islands (a big architectural
  change) or trimming reka-ui usage — see "JS/CSS reduction".

## Current prerendered HTML (gzipped, from `pnpm build`)

| Route | HTML gz | Content in HTML? |
| --- | ---: | --- |
| `/` (index) | 5.4 KB | ✅ full (hero, sections, nav, footer) |
| `/jen-knows` | 5.0 KB | ✅ full profile |
| `/jen-liu` | 4.3 KB | ✅ full profile |
| `/blogs` | 3.0 KB | ✅ chrome + taxonomies + first posts |
| `/sydney-food-map` | **0.5 KB** | ❌ empty shell — see below |

The four healthy routes read Velite content **synchronously** at build time, so
the renderer has the data in hand and writes it into the string. That is exactly
why it works — a sync read is prerenderable; an async fetch is not.

## Per-page initial load (gzipped)

`Total = JS + CSS (assets)`. HTML column added this session (see "Changes made").

| Route | HTML | JS | CSS | Total (assets) |
| --- | ---: | ---: | ---: | ---: |
| sydney-food-map | 0.5 KB | 92.9 KB | 12.8 KB | 105.7 KB |
| jen-liu | 4.3 KB | 89.0 KB | 11.9 KB | 100.9 KB |
| jen-knows | 5.0 KB | 89.0 KB | 11.9 KB | 100.9 KB |
| index | 5.4 KB | 83.3 KB | 13.9 KB | 97.2 KB |
| blogs | 3.0 KB | 80.9 KB | 9.8 KB | 90.8 KB |

Biggest JS chunks (gz): `app` 64.7 (every page) · `leaflet` 43.4 (food-map only)
· `sydney-food-map` 31.7 (food-map) · `SearchModal` 14.3 (lazy) · `useProfileRoute`
11.5 (profiles).

## What is already optimal — do nothing

- **Code-splitting is good.** Leaflet, the food-map page logic, the restaurants
  dataset, and `SearchModal` are all in their own chunks. `SearchModal` is a
  `defineAsyncComponent` (see `layouts/default.vue`), kept out of the global
  bundle.
- **`<ClientOnly>` is used in exactly one place** — `FoodMapApp` wrapping the
  Leaflet canvas. That is correct: Leaflet builds itself against the real DOM at
  runtime (measures the container, fetches tiles by viewport, attaches handlers)
  and cannot render in the Node string pass. A live map cannot be prerendered.
- **Overlays/disclosures (`Modal`, `Slideover`, `Popover`, `BuyButton`,
  `Product`, `ScrollToTopButton`) are `v-if`-gated and correctly NOT prerendered.**
  They are closed by default and carry no crawlable content.

## Findings that need a decision (NOT done autonomously)

### 1. Food map prerenders to nothing (highest-value, your WIP)

`/sydney-food-map` is `<FoodMapApp v-if="isReady">`, and `isReady` only flips
true after `useRestaurants()`'s dynamic `import("#food-map-data")` resolves on the
client. So the entire page — map, top bar, restaurant list — is absent from the
prerendered HTML.

This is deliberate: `useRestaurants.ts` says "keeps the 51 KB dataset out of the
route chunk … Do NOT replace with a static import." So there is a genuine
trade-off:

| | Keep lazy (current) | Prerender the data |
| --- | --- | --- |
| route chunk | small | +dataset in HTML/route |
| restaurant list SEO / FCP | none, blank until JS | crawlable, instant |

**The map (Leaflet) can never be prerendered** — but the *list / top bar / names*
can, because they are plain data and already sit OUTSIDE `<ClientOnly>`. The
high-value move is to make the restaurant data available synchronously at build
(drop the `v-if="isReady"` gate for the non-map chrome; keep the map in
`<ClientOnly>` with an optional static-map-image fallback). This is your active
refactor area, so it's left for you to decide.

### 2. Mobile nav drawer — investigated, no change warranted

`Header.vue`'s mobile drawer is `v-if="mobileOpen"`, so its links are JS-rendered.
But the **same 5 links are already in the static HTML** via the desktop `<nav>`
(`hidden md:flex` = in the DOM, CSS-hidden on mobile). Converting the drawer to
`v-show` would duplicate those links into the HTML for **no SEO and no no-JS
gain** (closed drawer is `display:none`; the desktop nav is also `display:none`
on mobile), only added bytes. Not worth it.

The only real (marginal) gap: a no-JS mobile visitor can open neither nav. Fixing
that needs a **CSS-only disclosure** (`<details>`/`:target`/checkbox) replacing the
JS toggle — a UX change that wants your sign-off. Not done.

## JS/CSS reduction (the axis the goal really cares about)

Prerendering won't shrink these. The levers that would:

1. **`app` chunk (64.7 KB gz, every page)** = Vue runtime + reka-ui primitives
   (Dialog/Tabs/Popover/Pagination) + shared components + router + unhead. The
   reka-ui parts exist to hydrate interactive components, so they can't be
   prerendered away. Real cuts need **islands** (only hydrate interactive
   regions) — vite-ssg hydrates the whole app, so this is an architecture change,
   not a tweak.
2. **Trim reka-ui surface.** If any overlay/tabs/popover usage isn't essential,
   dropping it removes its primitive from the bundle. Needs a usage review.
3. **Lazy-load more interactive-only components**, the way `SearchModal` already
   is — candidates are anything below the fold that pulls a reka-ui primitive.
4. **`@vueuse` `#__PURE__` warning** (build log): Rolldown can't read some pure
   annotations due to comment position, so a little @vueuse code may resist
   tree-shaking. Upstream/Rolldown issue; low impact.

None of these is a quick win; all are real follow-up tasks worth their own spec.

## Changes made this session (committed)

- **`bundle-report.ts` + `bundle-diff.ts` + test**: added an **HTML size column**
  so the CI deploy diff shows the JS→HTML trade-off. `Total` stays JS+CSS
  (assets) and still drives the 🟢/🟡/🔴 verdict; HTML is a separate,
  informational column with its own delta and is expected to grow as content
  moves into markup. Backward-compatible with pre-column baselines; workflows
  need no YAML change.

## Recommended order, if you want to pursue this

1. Finish the food-map → Velite migration you started, then decide the
   prerender-the-list trade-off (#1) — biggest FCP/SEO win.
2. Treat JS reduction as a separate effort; if it matters, spec an islands
   evaluation (#JS-1) — that's where the real bundle weight is.
3. Skip the mobile-nav change unless you want the no-JS CSS-disclosure (#2).
