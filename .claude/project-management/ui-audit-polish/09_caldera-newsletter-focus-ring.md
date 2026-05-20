# 09 — [Caldera gap] Newsletter input focus ring

## Problem

Caldera's newsletter input on focus: border brightens, no visible ring shadow.
jen-lab's Community section input uses `focus:ring-4 focus:ring-pure-white/20` — the
ring-4 is noticeably heavier than Caldera's restrained focus style.

Affected files:

- `app/components/home/SectionCommunity.vue` line ~72: `focus:ring-4 focus:ring-pure-white/20`
- `app/components/home/SectionContact.vue` line ~84: `focus:ring-2 focus:ring-abyssal-ink/20`
  (this one already uses ring-2 — closer to Caldera, acceptable)
- `app/components/home/SectionNewsletter.vue` line ~67: `focus:ring-2 focus:ring-pure-white/30`
  (ring-2, acceptable)

## Plan

1. In SectionCommunity.vue: change `focus:ring-4` → `focus:ring-2` on the email input.
   → verify: focus ring is subtler, matches Caldera's restrained style

## Success criteria

- Community input focus ring is `ring-2` not `ring-4`
- `vp check` passes
