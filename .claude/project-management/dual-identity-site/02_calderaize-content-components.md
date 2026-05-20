---
name: 02-calderaize-content-components
description: Restyle the shared content renderers (Portal/Product/ImageCarousel/YoutubeCarousel) into Caldera.
---

# 02 — Caldera-ize shared content components

## Goal

Restyle the four content-renderer components so the direction pages (tasks 04/05) inherit the new visual
language instead of the old teal/brutalist look:

- `app/components/home/Portal.vue`
- `app/components/home/Product.vue`
- `app/components/home/ImageCarousel.vue`
- `app/components/home/YoutubeCarousel.vue`

## Why (reasoning chain)

- These are the leaf components every section dispatches to (see `ContentBody.vue`). Restyling them once
  propagates to both direction pages — do the leaves before the pages that compose them.
- Editing them in place is SAFE: their only current consumer is the dormant `app/pages_backup/index.vue`,
  which is not a live route (REFERENCE §6). No live page regresses.
- Keep props/logic untouched — this is a **styling-only, surgical** change (Karpathy §3). Don't rename
  props, don't change the markdown/v-html pipeline in `Product.vue`, don't touch carousel behavior.

## Inputs / references

- Design tokens: REFERENCE §2. Old look to remove: `bg-teal-*`, `bg-[#f7f7f7]`,
  `rounded-4xl`, `shadow-[6px_6px_0px_rgba(0,0,0,0.7)]`.

## Steps (per component, swap classes only)

1. `Portal.vue` — link card: `bg-ash-white rounded-card` + subtle border/shadow; icon chip uses
   `bg-digital-orange/10 text-digital-orange` (drop teal); hover = gentle lift, not brutalist.
2. `Product.vue` — card surface `bg-ash-white rounded-card`; banner placeholder bg → `bg-basalt-canvas`
   (drop `bg-teal-400`); title `font-display`/`text-abyssal-ink`; keep `UCollapsible` + `v-html`
   `product-description` block and its `:deep()` styles intact; purchase `UButton color="primary"`.
3. `ImageCarousel.vue` — image frame `rounded-card`; keep `ClientOnly` + zoom `UModal`.
4. `YoutubeCarousel.vue` — thumb frame `rounded-card`; play badge hover `bg-digital-orange` (or keep red —
   YouTube affordance); keep `ClientOnly` + fullscreen `UModal`.

## Acceptance criteria

- No `teal`, `#f7f7f7`, `rounded-4xl`, or the brutalist box-shadow remain in these four files.
- Props, emits, `v-html` pipeline, carousel/modal behavior unchanged.
- Components still type-check (`pnpm typecheck` clean for these files).

## Gotchas

- `Product.vue` `description` prop exists only to absorb the `v-bind="product"` spread — keep it.
- Don't touch `Profile.vue` here; it is replaced by the new page header in task 03.
