# 03 — Layout Shell (UHeader + UFooter + Blank Index)

First runnable milestone. After this task `pnpm dev` shows a Caldera-styled empty page with Nuxt UI's `UHeader` + `UFooter` — no custom wrapper components.

## Goals

- `app/layouts/default.vue`:

  ```vue
  <template>
    <UApp>
      <UHeader :ui="{ root: 'bg-basalt-canvas border-0' }">
        <template #left>
          <NuxtLink to="/" class="font-display text-2xl tracking-[0.02em]">JEN-LAB</NuxtLink>
        </template>
        <UNavigationMenu :items="navItems" />
        <template #right>
          <UButton color="primary" :ui="{ base: 'rounded-button' }" to="mailto:a3574587@gmail.com">
            Get In Touch
          </UButton>
        </template>
      </UHeader>

      <UMain>
        <slot />
      </UMain>

      <SiteFooter />
    </UApp>
  </template>
  ```

- `app/components/site/Footer.vue` — thin wrapper around `UFooter` + `UFooterColumns`. Fleshed out further in task 11; this task is just the skeleton.
- `app/pages/index.vue` — collapse to:

  ```vue
  <script setup lang="ts">
  useSeoMeta({
    title: "Jen Lab — The Living Lab Of Jen",
    description:
      "A personal sandbox where ideas, restaurants and writing share one harbour. Brewed in Sydney, served everywhere.",
    ogTitle: "Jen Lab — The Living Lab Of Jen",
    ogDescription: "A personal sandbox where ideas, restaurants and writing share one harbour.",
    ogType: "website",
    // TODO: ogImage — Jen to supply 1200×630 og asset.
  });
  </script>

  <template>
    <div class="container mx-auto max-w-[1200px] space-y-10 px-4 py-10">
      <!-- sections inserted in tasks 04-10 -->
    </div>
  </template>
  ```

## Nav items

```ts
const navItems = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
  { label: "Blogs", to: "/blogs" },
  { label: "About", to: "/about" },
];
```

`/blogs` and `/about` get their own Caldera-styled pages in tasks 12–13. Until those land, these links will 404 — acceptable as the index page is built first, sequential tasks fill them in.

## Anchor scroll-margin fix

`UHeader` is sticky; in-page anchors (e.g. `#blog` preview row from landing) need clear room. In `main.css` `@layer base` (added in task 01):

```css
:where(h1, h2, h3, [id]) {
  scroll-margin-top: 5rem;
}
```

## Style notes

- `UHeader` default already provides sticky behavior + mobile burger drawer; only override colors via `:ui` prop and Tailwind classes (`bg-basalt-canvas`).
- Pill CTA: rely on `--radius-button: 800px` token; pass `rounded-button` (Tailwind v4 auto-generates utility from theme var).
- `UApp` provides toast / modal portal; needed later for task 10 newsletter toast.

## Files touched

- New: `app/layouts/default.vue`, `app/components/site/Footer.vue`.
- Edit: `app/pages/index.vue` (replace contents).
- `nuxt.config.ts` — confirm `pages: true` and default layout autoload (likely already configured).

## Verification

- `pnpm dev` → http://localhost:3000 shows: `UHeader` top, blank middle, footer bottom.
- Resize 375px: burger drawer opens via `UHeader` built-in behavior; no horizontal overflow.
- Nav links route or anchor without console error.

## Out of scope

- Footer fleshing-out (task 11). Hero / sections (task 04+).
