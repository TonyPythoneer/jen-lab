# SSG Layout `<slot>` → `<RouterView>` Fix

## Problem

`dist/index.html` prerenders header/footer correctly but the main content area is `<!--[--><!--]-->` (empty fragment). After client hydration, the page content remains empty.

## Root Cause

`vite-plugin-vue-layouts-next` wraps routes into a nested Vue Router structure:

```
{ path: '/', component: DefaultLayout, children: [{ path: '/', component: IndexPage }] }
```

Vue Router renders child routes via `<RouterView>` in the parent component. `app/layouts/default.vue` still uses `<slot>` (Nuxt pattern), so `IndexPage` is never rendered. Header/footer appear because they are directly in the layout template; the slot just stays empty.

## Fix (Plan B)

**File:** `app/layouts/default.vue`

1. Replace `<slot />` with `<RouterView />` in the main content div.
2. Remove `await` from `useAsyncData` call — the shim returns a synchronous object, so `await` is a no-op that unnecessarily makes the component async.

## Scope

- One file changed, two lines.
- No changes to routing config, Velite data, or the `useAsyncData` shim.
- Applies to all prerendered routes (`/`, `/jen-knows`, `/jen-liu`, `/blogs`, `/sydney-food-map`).

## Verification

`pnpm velite build && pnpm vite-ssg build` — `dist/index.html` should contain the five home section divs (`HomeSectionHero`, `HomeSectionDirections`, etc.) inside `<div class="page-breakout">`.
