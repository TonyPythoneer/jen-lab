---
name: 04-jen-knows-page
description: Create the /jen-knows route — career identity, all content blocks, Caldera styled.
---

# 04 — `/jen-knows` page

## Goal

Create `app/pages/jen-knows.vue` that fetches the Jen Knows content and renders it via `<ProfilePage>`.

## Why (reasoning chain)

- This is the career destination. The homepage "Jen Knows" card (task 08) links here.
- Page owns the Nuxt-bound fetch (`useLazyAsyncData`) and passes the doc + per-identity links into the
  shared presentational `<ProfilePage>` (task 03). Keeps the split clean.
- `useLazyAsyncData` (NOT `useAsyncData`) per CLAUDE.md — non-blocking shell.

## Inputs / references

- Data: `queryCollection("home").path("/home/jen-knows").first()` (REFERENCE §3).
- Subscribe: `https://jen-nextsteps.kit.com/60463af80d`. Support: `https://portaly.cc/jenknowsau/support`.
- Content includes: portals (blog, NextSteps booking, career tool, restaurant map, Crossing column),
  videos (4 YouTube), products (澳洲職場指南 2.0, 海外遊子回台手冊). See `content/home/jen-knows.md`.

## Steps

1. Mirror the fetch pattern from `app/pages_backup/index.vue` but for a single profile:
   ```ts
   const { data: page } = useLazyAsyncData("profile:jen-knows", () =>
     queryCollection("home").path("/home/jen-knows").first(),
   );
   ```
2. SEO via `useSeoMeta` (title 中英混搭, description from `page.profile.tabs[0].bio`, ogImage avatar).
   Use `useHead` title like `榛知 | NextSteps Academy` (see backup `profiles` map).
3. Template: `<SitePageContainer>` wrapping `<ProfilePage>` with `display-name="Jen Knows"`,
   `:subscribe-url` / `:support-url` consts, `:page="page"`. Guard with `v-if="page"`.
4. No hardcoded domain strings in template — define `displayName`, URLs, head title as consts in script.

## Acceptance criteria

- Visiting `/jen-knows` renders header + portals + videos + products, Caldera styled, no console errors.
- Links open correctly; SEO tags populated.

## Gotchas

- Each `useLazyAsyncData` needs a unique key — use `"profile:jen-knows"`.
- Avatar path is `/home/jen-knows/avatar.webp`.
