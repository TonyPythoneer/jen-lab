# 11 — Footer (UFooter + UFooterColumns)

Task 02 created a skeleton `app/components/site/Footer.vue`. This task fills it with real content using Nuxt UI's footer primitives.

## Goals

- Rewrite `app/components/site/Footer.vue` as a thin wrapper around `<UFooter>` + `<UFooterColumns>` with config-driven items.
- Socials sourced from `app.config.ts → contacts[]` (already exists).

## Composition

```vue
<script setup lang="ts">
const appConfig = useAppConfig();

const columns = [
  {
    label: "Explore",
    children: [
      { label: "Home", to: "/" },
      { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
      { label: "Blogs", to: "#blog" },
      { label: "About", to: "#about" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Brand kit", to: "#" },
      { label: "Now", to: "#" },
      { label: "Uses", to: "#" },
    ],
  },
];

const socials = appConfig.contacts ?? [];
</script>

<template>
  <UFooter
    :ui="{
      root: 'bg-abyssal-ink text-pure-white rounded-t-card mt-10',
      top: 'p-10 grid md:grid-cols-4 gap-10',
      bottom:
        'border-t border-pure-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4',
    }"
  >
    <template #top>
      <!-- Brand -->
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <HomeGlyphSvg kind="sail" class="w-8 h-8" aria-hidden="true" />
          <span class="font-display text-2xl tracking-[0.02em]">JEN-LAB</span>
        </div>
        <p class="text-pure-white/70 text-sm">Built in Sydney. Shipped from a laptop.</p>
      </div>

      <!-- Columns -->
      <UFooterColumns :columns="columns" :ui="{ label: 'text-pure-white/60 text-sm' }" />

      <!-- Connect -->
      <div>
        <p class="text-pure-white/60 text-sm mb-4">Connect</p>
        <ul class="flex gap-2">
          <li v-for="c in socials" :key="c.label">
            <UButton
              :to="c.url"
              target="_blank"
              rel="noopener"
              color="neutral"
              variant="outline"
              :icon="c.icon"
              :aria-label="c.label"
              :ui="{ base: 'w-10 h-10 rounded-card border-pure-white/20 text-pure-white' }"
            />
          </li>
        </ul>
      </div>
    </template>

    <template #bottom>
      <p class="text-pure-white/60 text-sm">© Jen-Lab 2026. All rights reserved.</p>
      <p class="text-pure-white/60 text-sm flex items-center gap-2">
        Made in Sydney
        <HomeKoalaSvg v-if="useKoalaSvg" class="w-4 h-4" aria-hidden="true" />
        <span v-else>🐨</span>
      </p>
    </template>
  </UFooter>
</template>
```

## Decisions to confirm with Jen before merging this task

- Emoji 🐨 vs custom `HomeKoalaSvg.vue` for sign-off. Toggle hard-coded `useKoalaSvg` constant pending decision.
- Wording of tagline ("Built in Sydney. Shipped from a laptop.").
- Whether placeholder Resources links (Brand kit / Now / Uses) stay or get removed if Jen prefers no broken anchors.

## Files touched

- Edit: `app/components/site/Footer.vue` (rewrite skeleton from task 03).
- Optional new: `app/components/home/KoalaSvg.vue` if Jen picks SVG over emoji.

## Verification

- Footer dark band, last visible element.
- Social icons render from `contacts[]`, each links to external URL with `target="_blank"`.
- Mobile: 4 columns → 2 → 1 stack.
- Bottom strip stacks vertically on mobile.

## Out of scope

- Newsletter signup duplication in footer (Caldera does it; we already have full band in task 10).
