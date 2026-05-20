---
name: 08-home-directions
description: Rebuild the "More Is More. Stack Sideways." section as the two-direction intro with girl images.
---

# 08 — Homepage §2: "More Is More. Stack Sideways." dual-direction cards

## Goal

Repurpose `app/components/home/SectionFeatures.vue` (keep the headline + 2-row asymmetric grid) into the
two-direction intro: each direction = one white text card + one colored illustration card holding that
identity's girl image.

## Why (reasoning chain)

- Owner explicitly named this section ("More Is More. Stack Sideways.") as the home for the two intros.
- The existing markup already is a 2-row, 5/7 + 7/5 grid of alternating text/illustration cards — perfect
  skeleton. We swap the generic copy + SVG illustrations for real copy + the cropped girl photos.
- Pairing: **white card = intro text**, **colored card = girl image** (owner's spec).

## Inputs / references

- File + grid pattern: `app/components/home/SectionFeatures.vue` (read it; keep `grid md:grid-cols-12`,
  `md:grid-rows-2`, the 5/7 split, gaps, radii).
- Images from task 01: `/home/jen-knows-hero.webp` (raised hand) and `/home/jen-liu-hero.webp` (camera).
- Copy source: profile bios in `content/home/jen-knows.md` / `jen-liu.md` (REFERENCE §3). Hardcoding short
  marketing copy here is fine (it's homepage chrome, not the canonical content) — but define link `to`
  targets as consts.
- Tokens: REFERENCE §2 — colored cards use `bg-cyber-violet` and `bg-digital-orange` (one each).

## Steps

1. Keep the `<h2>` "More Is More. / Stack Sideways." headline.
2. Row 1 = **Jen Knows**: white text card (English subhead + 繁中 intro: 職涯/職場, CTA「進入 Jen Knows」
   → `/jen-knows`) + colored card containing `<img src="/home/jen-knows-hero.webp">` (object-contain or
   cover, girl centered).
3. Row 2 = **Jen Liu**: white text card (旅遊/雪梨美食, CTA「進入 Jen Liu」→ `/jen-liu`) + colored card with
   `<img src="/home/jen-liu-hero.webp">`. Alternate the colored card side vs row 1 for visual rhythm.
4. Images: `loading="lazy"`, meaningful `alt`, sit nicely within the card padding; ensure they don't
   overflow on mobile (`max-h`, `object-contain`).
5. Consider renaming the file to `SectionDirections.vue` for clarity (update import in `index.vue`, task 12).
   Optional — if renamed, do it as a clean move, not a copy.

## Acceptance criteria

- Two rows, each = text card + image card; correct girl in each; both CTAs route correctly.
- Responsive: stacks cleanly to 1 column on mobile; images not clipped awkwardly.

## Gotchas

- The original cards have fixed `min-h-[360px]` — verify the photos look right at that height; adjust.
- Don't reintroduce the decorative SVGs (HarbourBridge/OperaHouse) in the colored cards — girls replace them.
