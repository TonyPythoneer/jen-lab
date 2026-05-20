---
name: 05-jen-liu-page
description: Create the /jen-liu route — travel identity, all content blocks, Caldera styled.
---

# 05 — `/jen-liu` page

## Goal

Create `app/pages/jen-liu.vue` that fetches the Jen Liu content and renders it via `<ProfilePage>`.

## Why (reasoning chain)

- Travel destination, linked from the homepage "Jen Liu" card (task 08). Symmetric to task 04 — same
  pattern, different data + links. Build it right after 04 so the two pages stay consistent.

## Inputs / references

- Data: `queryCollection("home").path("/home/jen-liu").first()` (REFERENCE §3).
- Subscribe: `https://jen-nextsteps.kit.com/60463af80d`. Support: `https://portaly.cc/jenliuau/support`.
- Content includes: products (《雪梨...》, 雪梨市區美食手冊, 開始在澳洲自助旅行), galleries
  (traveling-in-nsw-towns, food-in-greater-sydney). Single profile tab (澳洲旅遊作家).
  See `content/home/jen-liu.md`.

## Steps

1. Same fetch pattern as task 04, key `"profile:jen-liu"`, path `/home/jen-liu`.
2. SEO: title `榛知 | 澳洲旅遊作家`; description/og from profile.
3. Template: `<SitePageContainer>` → `<ProfilePage>` with `display-name="Jen Liu"`, jen-liu support URL,
   `:page`. Guard `v-if="page"`.
4. No hardcoded domain strings in template (consts in script).

## Acceptance criteria

- `/jen-liu` renders header + products + galleries, Caldera styled, no console errors.
- Image-carousel zoom modal works; product purchase links open.

## Gotchas

- Jen Liu has only ONE profile tab → `<ProfilePage>` must handle the single-tab case gracefully
  (no tab strip needed, or a single inert tab).
- Avatar `/home/jen-liu/avatar.webp` is 256×187 (not square) — don't force a square crop that distorts.
