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
    <!-- Sections inserted in tasks 04-10. Currently a placeholder so the layout shell can be reviewed. -->
    <div
      class="bg-ash-white rounded-card p-10 text-center text-abyssal-ink/60 border border-dashed border-abyssal-ink/15"
    >
      Landing sections land in tasks 04 – 10. Use
      <NuxtLink to="/styleguide" class="text-digital-orange underline">/styleguide</NuxtLink>
      to preview the design vocabulary.
    </div>
  </div>
</template>
