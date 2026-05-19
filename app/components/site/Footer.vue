<script setup lang="ts">
const appConfig = useAppConfig();

const columns = [
  {
    label: "Explore",
    children: [
      { label: "Home", to: "/" },
      { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
      { label: "Blogs", to: "/blogs" },
      { label: "About", to: "/about" },
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
      <UFooterColumns
        :columns="columns"
        :ui="{ label: 'text-pure-white/60 text-xs uppercase tracking-widest mb-3' }"
      />

      <!-- Connect -->
      <div>
        <p class="text-pure-white/60 text-xs uppercase tracking-widest mb-4">Connect</p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="c in socials" :key="c.label">
            <UButton
              :to="c.url"
              target="_blank"
              rel="noopener"
              color="neutral"
              variant="outline"
              :icon="c.icon"
              :aria-label="c.label"
              class="w-10 h-10 rounded-card border-pure-white/20 text-pure-white hover:border-digital-orange hover:text-digital-orange"
            />
          </li>
        </ul>
      </div>
    </template>

    <template #bottom>
      <p class="text-pure-white/60 text-sm">© Jen-Lab 2026. All rights reserved.</p>
      <p class="text-pure-white/60 text-sm flex items-center gap-2">Made in Sydney 🐨</p>
    </template>
  </UFooter>
</template>
