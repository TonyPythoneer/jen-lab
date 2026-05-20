# 03 — Rewrite SectionProductDots Copy

## Problem

Current copy in `SectionProductDots.vue`:

- Headline: "Built To Stack Up."
- Body: "Every section composes from the same six tokens — colour, radius, type, spacing,
  font, shadow. Add another card and it just fits."

This is design-system developer speak copied from Caldera. A personal site visitor
doesn't care about design tokens. The section has no personal relevance.

## Plan

1. Rewrite headline + body to reflect Jen's actual site personality — something that
   bridges the dot-field aesthetic to the "living lab" concept without dev jargon.
   Keep the dot-field visual (it's good). Only change text content.
   → verify: text reads naturally for a personal site visitor, no dev jargon

## Success criteria

- No design-token / "six tokens" language
- Fits "榛知雪梨" personal site voice
- `vp check` passes
