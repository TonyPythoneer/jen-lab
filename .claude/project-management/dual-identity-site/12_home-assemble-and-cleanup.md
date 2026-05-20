---
name: 12-home-assemble-and-cleanup
description: Wire the 5 sections into index.vue and retire the fake placeholder sections.
---

# 12 — Assemble `index.vue` + retire fake sections

## Goal

Make `app/pages/index.vue` render exactly the five owner-specified sections, and remove the placeholder
section components that no longer appear.

## Why (reasoning chain)

- Sections 07–11 produced/edited the building blocks; this task composes the final page and deletes the
  fake-content sections so nothing dead ships. Doing deletion last avoids breaking earlier steps.

## Inputs / references

- Current `app/pages/index.vue` imports many `HomeSection*` (see it). Retire list: REFERENCE §6.
- Keep: Hero (07), Directions (08), NewProduct (09), Newsletter→subscribe (10), Support (11).

## Steps

1. Set `index.vue` template (inside `<SitePageContainer breakout>`) to, in order:
   `<HomeSectionHero />` → directions section (08) → `<HomeSectionNewProduct />` →
   `<HomeSectionNewsletter />` → `<HomeSectionSupport />`.
   (Decide on `SectionBlog`: owner's spec omits it. Default = remove it from home; Blogs stays in nav.
   If kept, place before subscribe and keep the hero "latest post" badge — otherwise drop both.)
2. Update `useSeoMeta` on `index.vue` to mixed-language, dual-identity description (drop "Living Lab" copy).
3. **Delete** the retired section components (REFERENCE §6 list) once confirmed unreferenced:
   `SectionStats, SectionProductDots, SectionBringing, SectionUseCases, SectionBuiltOn,
SectionTestimonials, SectionCommunity, SectionContact`. Also the old generic `SectionFeatures` if task 08
   created a renamed `SectionDirections` instead of editing it in place.
4. Grep for each deleted component name to ensure no other page imports it before deleting.

## Acceptance criteria

- Homepage shows exactly the 5 sections in order; no fake testimonials/community/stats remain.
- No imports reference deleted components; `pnpm typecheck` clean.

## Gotchas

- `full-bleed` class on a child only matters with `breakout` container — keep the wrapper as is.
- Delete only YOUR-orphaned components (Karpathy §3): each deletion must be a section we intentionally
  retired and confirmed unreferenced.
