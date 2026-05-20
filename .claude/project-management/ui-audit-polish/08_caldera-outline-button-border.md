# 08 — [Caldera gap] Outline buttons: border-2 → border (1px)

## Problem

Caldera's outline buttons use a single `border` (1px). jen-lab uses `border-2` throughout,
making outline buttons visually heavier than the source design.

Affected locations (grep `border-2` in Vue files, filter to button/outline contexts):

- `app/components/home/SectionHero.vue` — "Read The Notebook" outline btn
- `app/components/home/SectionStats.vue` — "Explore The Workbench" btn
- `app/components/home/SectionFeatures.vue` — "Learn More" btns
- `app/components/home/SectionBringing.vue` — accordion detail card (non-btn border is ok)
- `app/components/home/SectionUseCases.vue` — "Open Map" / "See GitHub" / "Read Blog"
- `app/pages/about.vue` — CTA buttons
- `app/components/site/Header.vue` — blog carousel nav (dotted, keep as-is)
- `app/components/site/Footer.vue` — dotted HR (keep as-is)

Note: `border-2 border-dotted` lines/dividers are NOT buttons — leave those alone.
Only change UButton outline variant `:ui="{ base: '...' }"` overrides and raw `<button>` elements.

## Plan

1. Grep all `UButton` with `variant="outline"` — check if they have a custom `border-*` in `:ui`
   override. Most UButton outline styles inherit from Nuxt UI defaults; only custom overrides
   need touching.
2. For raw `<button>` elements with explicit `border-2`: change to `border`.
3. The blog carousel nav buttons (`border border-dotted`) already use `border` — no change needed.
   → verify: outline buttons look visually lighter; dotted dividers unchanged

## Success criteria

- No `border-2` on any interactive outline button (only on decorative lines/dividers)
- Visual match closer to Caldera's lighter outline style
- `vp check` passes
