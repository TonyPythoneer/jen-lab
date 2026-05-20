---
name: 03-profile-page-component
description: Build the shared ProfilePage component that both direction pages render.
---

# 03 — Build shared `<ProfilePage>` component

## Goal

Create `app/components/profile/Page.vue` (auto-imported as `<ProfilePage>`) that takes one fetched `home`
document and renders a Caldera-styled page: a hero header + the section blocks.

## Why (reasoning chain)

- `/jen-knows` and `/jen-liu` are structurally identical (same schema, different data). That is exactly the
  "second consumer" trigger for extraction in CLAUDE.md — so a shared component is justified, not premature.
- Keep Nuxt-bound data fetching OUT of this component. The pages (04/05) call `useLazyAsyncData` and pass
  the resulting doc in as a prop. This component is presentational → testable, no setup-only APIs
  (CLAUDE.md "pure vs Nuxt-bound" split).
- The old `ContentBody.vue` already implements the `section.component` dispatch. Reuse that pattern; either
  render `<HomeContentBody>` inside the body, or inline an equivalent dispatch. Prefer reusing
  `ContentBody` to avoid duplicating the discriminated-union switch.

## Inputs / references

- Content shape + dispatch: REFERENCE §3, and existing `app/components/home/ContentBody.vue`.
- Subscribe + support links: REFERENCE §4. Tokens: REFERENCE §2.

## Props

```ts
defineProps<{
  page: Collections["home"]; // the fetched doc
  subscribeUrl: string; // Kit link
  supportUrl: string; // Portaly link (per identity)
  displayName: string; // English big name, e.g. "Jen Knows"
}>();
```

## Steps

1. **Header block** (replaces old `Profile.vue` look): big `font-display` English `displayName`, Chinese
   tagline from `page.profile.tabs[0].bio`, avatar (`page.profile.avatar`), and two buttons —
   訂閱電子報 → `subscribeUrl`, 請我喝奶茶 → `supportUrl` (both `target="_blank" rel="noopener"`).
   If `tabs.length > 1`, render the bios with `UTabs` (Jen Knows has an "About me" tab).
2. **Body**: render the section blocks. Reuse `<HomeContentBody :page="page" :show="true" />`, OR map
   `page.sections` and dispatch to `HomePortal` / `HomeProduct` / `HomeImageCarousel` / `HomeYoutubeCarousel`
   (now Caldera-styled from task 02). Wrap each section with a Caldera heading (English label + zh sub).
3. Use a responsive grid for `portal-list` (e.g. `sm:grid-cols-2`) and `product-list`; carousels full width.
4. No hardcoded domain strings: section labels come from data; the only literal English is `displayName`
   which is a prop. Button labels (訂閱電子報 / 請我喝奶茶) are UI chrome — define as consts in script.

## Acceptance criteria

- `<ProfilePage>` renders header + all four section types without errors when fed either doc.
- No teal/brutalist styles; matches REFERENCE §2 tokens.
- No `useAsyncData`/`useRoute` inside this component (stays presentational).

## Gotchas

- `ContentBody` wraps sections in `CollapsibleSeparator` + an entry `Transition` gated by `show`. If you
  reuse it, pass `:show="true"` (data is already resolved by the page). If that animation/look fights the
  new design, inline the dispatch instead — your call, document which you chose at the top of the file.
