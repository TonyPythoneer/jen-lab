# SSG Layout Slot Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix empty main content in SSG prerender by replacing `<slot>` with `<RouterView>` in the default layout.

**Architecture:** `vite-plugin-vue-layouts-next` creates nested Vue Router routes (layout = parent, page = child). The parent must render its child via `<RouterView>`, not `<slot>`. The layout also has an unnecessary `await` on a synchronous `useAsyncData` call; removing it keeps the layout as a sync component.

**Tech Stack:** Vue 3, vite-ssg, vite-plugin-vue-layouts-next, Velite

---

### Task 1: Fix `app/layouts/default.vue`

**Files:**
- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Replace `<slot />` with `<RouterView />`**

Open `app/layouts/default.vue`. Change line 6 from:

```html
      <slot />
```

to:

```html
      <RouterView />
```

`RouterView` is globally registered by `app.use(router)` — no import needed.

- [ ] **Step 2: Remove `await` from the `useAsyncData` call**

In the same file, change line 23 from:

```typescript
const { data: chrome } = await useAsyncData("site:blogs", () =>
  queryCollection("siteBlogs").first(),
);
```

to:

```typescript
const { data: chrome } = useAsyncData("site:blogs", () =>
  queryCollection("siteBlogs").first(),
);
```

The `useAsyncData` shim returns a plain object (not a Promise). Removing `await` prevents the component from being unnecessarily treated as an async component.

- [ ] **Step 3: Build and verify**

```bash
pnpm velite build && pnpm vite-ssg build
```

Then check the prerendered HTML:

```bash
grep -o 'page-breakout[^>]*>[^<]*<' dist/index.html | head -3
```

Expected: matches showing `<div class="page-breakout ...">` with children (not empty).

Also confirm section components appear:

```bash
grep -c 'section-hero\|HomeSectionHero\|page-breakout' dist/index.html
```

Expected: count > 0.

- [ ] **Step 4: Commit**

```bash
git add app/layouts/default.vue
git commit -m "fix(ssg): replace slot with RouterView in default layout

vite-plugin-vue-layouts-next creates nested routes — layout is the
parent route component and must use <RouterView> to render child pages.
The Nuxt-style <slot> had no content source in this context.

Also remove unnecessary await from useAsyncData (shim returns sync object)."
```
