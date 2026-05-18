# 12 — About Page (Caldera-styled `/about`)

Nav has an `About` link. After this task it routes to a dedicated `/about` page styled in the same Caldera vocabulary.

## Goals

- New `app/pages/about.vue`.
- Reuse Nuxt UI primitives + existing custom SVGs (no new components).
- `useSeoMeta({ title: 'About — Jen Lab', description: '...' })`.

## Composition (single Caldera page)

```
Layout (default — UHeader + UFooter inherited)
  ├── UPageHero (compact variant)
  │     - title "About Jen."
  │     - description short bio paragraph (placeholder)
  │     - default slot: <HomeOperaHouseSvg /> in corner
  ├── UPageColumns (3 cards, all Ash White)
  │     - "Origin"   — short story, gum-leaf glyph
  │     - "Workshop" — what Jen builds, terminal glyph
  │     - "Outside"  — non-tech life, compass glyph
  ├── UPageSection — Now (centered text, what Jen is focused on this season)
  ├── UPageCTA — link to /my-best-restaurants-search-in-sydney and #blog (reuse newsletter band style minus form)
```

All sections inside `<div class="container mx-auto max-w-[1200px] space-y-10 px-4 py-10">`.

## Placeholder copy

```ts
const bio = "Hi, I'm Jen. I cook things in code, eat things in Sydney, and write a bit about both.";

const facets = [
  {
    title: "Origin",
    body: "Grew up between two languages and one harbour. Curious by default, stubborn on the things that matter.",
    glyph: "gum-leaf",
  },
  {
    title: "Workshop",
    body: "Side-projects in Nuxt and Vue. The point of each project is the next one.",
    glyph: "terminal",
  },
  {
    title: "Outside",
    body: "Coastal walks, weeknight ramen, the occasional half-marathon I regret by kilometre five.",
    glyph: "compass",
  },
];

const now =
  "Currently: rebuilding this site in public, logging restaurants like a librarian, and learning more about typography than is healthy.";
```

All placeholder — Jen rewrites later.

## Files touched

- New: `app/pages/about.vue`.
- Edit: `app/components/site/Footer.vue` only if footer needs an `About` entry (already in task 11 columns).

## Verification

- Visit `http://localhost:3000/about` — page renders with nav + footer.
- Tab title reads "About — Jen Lab" (DevTools or browser tab).
- Nav `About` link no longer 404 / hashes to nowhere.
- Mobile 375px: all sections stack cleanly.

## Out of scope

- Real photo / avatar — no asset yet.
- Press / talks / publications list — Jen has none in repo.
