---
name: 07-home-hero
description: Rewrite the homepage hero into a mixed-language big-picture intro of the dual identity.
---

# 07 — Homepage §1: Hero (big-picture intro)

## Goal

Rewrite `app/components/home/SectionHero.vue` so the first screen introduces 榛知 as one person with two
worlds (career × travel), in 中英混搭.

## Why (reasoning chain)

- The current hero sells a fake English "Living Lab" concept. The real story is the dual identity — the
  hero must set that up so §2 (the two cards) lands.
- Reuse the existing structure (dot field, Opera House watermark, marquee, badge) — it's already polished;
  only swap copy + CTAs. Surgical (Karpathy §3).

## Inputs / references

- File: `app/components/home/SectionHero.vue`. Tokens/heading pattern: REFERENCE §2.
- Language decision: English display headline, Chinese sub-copy + CTAs (REFERENCE §1).

## Steps

1. Headline: keep `font-display` big type. English line for punch (e.g. "Two Worlds. One Jen." or similar)
   with the second line in `text-digital-orange`. Owner can wordsmith later — keep it short.
2. Sub-copy: 1–2 sentences 繁中 explaining 職涯 (Jen Knows) × 旅遊 (Jen Liu), Sydney-based.
3. CTAs (define `to` targets as consts): 探索 Jen Knows → `/jen-knows`, 探索 Jen Liu → `/jen-liu`.
   Remove the old "About Jen" button.
4. Marquee strings: replace placeholder English lines with on-brand short phrases (mix ok).
5. Keep the "latest post" badge only if `SectionBlog` stays on the homepage; otherwise drop it (it links to
   `#blog`). Decide alongside task 12.

## Acceptance criteria

- Hero introduces the dual identity in mixed language; both CTAs route to the new pages.
- No dead `#blog`/`/about` references left in the hero.

## Gotchas

- `min-h-[calc(100dvh-var(--site-header-h))]` depends on the header ResizeObserver var — leave it.
