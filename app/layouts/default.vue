<script setup lang="ts">
const navItems = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
  { label: "Blogs", to: "/blogs" },
  { label: "About", to: "/about" },
];
</script>

<template>
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <UHeader
      :ui="{
        root: 'bg-basalt-canvas/95 backdrop-blur border-0',
        container: 'max-w-[1200px]',
      }"
    >
      <template #left>
        <NuxtLink to="/" class="font-display text-2xl tracking-[0.02em] text-abyssal-ink">
          JEN-LAB
        </NuxtLink>
      </template>

      <UNavigationMenu :items="navItems" color="neutral" variant="link" highlight />

      <template #right>
        <UButton to="mailto:jen@jenliu.com.au" color="primary" :ui="{ base: 'rounded-button' }">
          Get In Touch
        </UButton>
      </template>
    </UHeader>

    <div class="flex-1">
      <slot />
    </div>

    <SiteFooter />
  </div>
</template>
