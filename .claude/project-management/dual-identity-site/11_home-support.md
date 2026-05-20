---
name: 11-home-support
description: Add one warm, low-pressure support/donate section to the homepage.
---

# 11 — Homepage §5: Soft support / donate section

## Goal

Create `app/components/home/SectionSupport.vue` — a single warm "buy me a milk tea" support beat.

## Why (reasoning chain)

- Owner wants supporters to feel invited, not pressured (REFERENCE §1). Tone is the whole point: gratitude +
  optionality, never a guilt trip or paywall language.
- One gentle section is enough; do not scatter donate CTAs across the page.

## Inputs / references

- Support links: Jen Knows `https://portaly.cc/jenknowsau/support`, Jen Liu `https://portaly.cc/jenliuau/support`.
- Tokens: REFERENCE §2. Milk-tea icon used elsewhere: `fluent-emoji-high-contrast:bubble-tea`.

## Steps

1. Soft surface (e.g. `bg-ash-white` or a light tinted card), generous padding, friendly 繁中 copy:
   something like「如果這些內容對你有幫助，歡迎請我喝杯奶茶 ☕ — 完全隨意，你的閱讀本身就是支持。」
2. CTA(s): a milk-tea button. Decide between ONE button (pick the main Portaly, likely jenknowsau) or TWO
   small buttons (Jen Knows / Jen Liu). Keep it light — one is probably calmer. Define URLs/labels as consts.
3. Avoid hard words (donate/捐款/贊助). Use 支持 / 請我喝奶茶. No guilt framing, no amounts, no urgency.

## Acceptance criteria

- One unobtrusive support section with warm copy and a working milk-tea link.
- Tone reads as invitation, not obligation; no aggressive language.

## Gotchas

- Don't place this above the fold or make it the loudest element — it sits near the page end (before footer).
