# 10 — [Caldera gap] Mobile hero: 3 buttons → 2

## Problem

Caldera mobile hero has 2 buttons stacked full-width: primary (orange fill) + secondary (outline).
jen-lab mobile hero has 3 buttons stacked: "Explore Restaurants" (primary) + "Read The Notebook"
(outline) + "About Jen" (ghost).

3 stacked buttons on mobile is heavy. The ghost "About Jen" adds little CTA value — About is
already in the nav. Caldera never puts a nav-duplicate link as a hero CTA.

## Plan

1. Hide the "About Jen" ghost button on mobile only: add `hidden sm:inline-flex` (or `hidden md:inline-flex`)
   so it shows on desktop but not on mobile.
   Do NOT remove it from desktop — it reads fine in a horizontal 3-button row.
   → verify (mobile 390px): only 2 buttons visible in hero; desktop still shows 3

## Success criteria

- Mobile hero shows 2 buttons (primary + outline)
- Desktop hero unchanged (3 buttons in a row)
- `vp check` passes
