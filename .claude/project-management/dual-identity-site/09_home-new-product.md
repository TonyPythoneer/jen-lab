---
name: 09-home-new-product
description: Add a homepage spotlight section for the new Australia travel book.
---

# 09 — Homepage §3: New-product spotlight (Australia travel book)

## Goal

Create a new homepage section component (e.g. `app/components/home/SectionNewProduct.vue`) that spotlights
the Australia travel book as the headline new product.

## Why (reasoning chain)

- Owner wants a dedicated "新品介紹" beat on the homepage — distinct from the per-page product lists. It's a
  marketing spotlight, so a bespoke section (big banner + copy + buy CTA) reads better than reusing the
  compact `Product.vue` card.

## Inputs / references

- Product data lives in `content/home/jen-liu.md` → the 《雪梨 附：藍山...》 entry (banner
  `/home/jen-liu/products/sydney.webp`, purchase `https://www.books.com.tw/products/0011050556`) and/or
  《開始在澳洲自助旅行》 (`starting-your-solo-trip-in-australia.webp`,
  `https://www.books.com.tw/products/0011024538`). Pick the one to headline (likely 《雪梨》, the newest).
- Tokens: REFERENCE §2.

## Steps

1. Build a split layout: large product banner on one side, copy on the other (English kicker like
   "Fresh Off The Press" + 繁中 title/brief + bullet highlights from the book's description) and a primary
   buy `UButton` → books.com.tw link (`target="_blank" rel="noopener"`).
2. Use a distinct surface (e.g. `bg-ash-white` card or a colored band) so it stands apart from §2.
3. Define banner src, title, buy URL/label as consts in `<script setup>` (no hardcoded domain strings in
   template). Copy text may be inline 繁中 marketing prose.
4. `loading="lazy"` on the banner; sensible `alt`.

## Acceptance criteria

- Section shows the book banner, title, brief highlights, and a working buy button.
- Visually distinct from §2; responsive (image stacks above copy on mobile).

## Gotchas

- This duplicates a product that also appears on `/jen-liu` — intentional (spotlight vs catalog). Don't try
  to dedupe across pages.
