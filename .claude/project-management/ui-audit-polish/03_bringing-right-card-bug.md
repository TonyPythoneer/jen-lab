# 03 — Fix SectionBringing Right Card (Static Content Bug)

## Problem

`SectionBringing.vue`: left accordion switches between Food / Code / Writing,
but the right violet card is completely static — it always shows food-related text
("Pick a current and dive in. The food log opens to a Sydney map...") regardless
of which accordion item is active.

Confirmed visually via Playwright screenshots (07_bringing_default vs 07b_bringing_code):
right card text is identical in both states.

## Plan

1. Add a `detail` field to each `bringItem` object (unique text per item).
2. Render the right card body from `bringItems.find(i => i.value === activeAccordion).detail`.
3. Optionally animate the text swap with a `<Transition>` fade.
   → verify: switching accordion changes right card content

## Success criteria

- Right card body text changes when accordion item changes
- No layout shift (card height stays stable — use `min-h` if needed)
- `vp check` passes
