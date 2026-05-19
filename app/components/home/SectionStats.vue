<script setup lang="ts">
const stats = [
  { value: "5y", label: "Years tinkering", caption: "Since the first toy app." },
  { value: "120+", label: "Restaurants logged", caption: "Across 11 Sydney suburbs." },
  { value: "30+", label: "Posts drafted", caption: "Half-finished is still progress." },
  { value: "1", label: "Harbour called home", caption: "Stretching from Bondi to Manly." },
];
</script>

<template>
  <section class="py-[72px] sm:py-[140px] flex flex-col items-center gap-4">
    <h2
      class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-center text-5xl md:text-6xl lg:text-7xl"
    >
      The Most Personal<br />Multi-Surface Lab.
    </h2>
    <UButton
      color="neutral"
      variant="outline"
      :ui="{ base: 'rounded-button px-6' }"
      to="#features"
      trailing-icon="i-lucide-arrow-right"
    >
      Explore The Workbench
    </UButton>
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-card p-8 md:p-10 flex flex-col gap-6 min-h-[240px] justify-between bg-digital-orange text-pure-white transition-transform duration-200 hover:scale-[1.005]"
      >
        <p class="font-display tracking-[0.02em] leading-[0.9] text-6xl md:text-7xl tabular-nums">
          {{ s.value }}
        </p>
        <div class="space-y-1">
          <p class="text-base font-medium">{{ s.label }}</p>
          <p class="text-sm text-pure-white/75">{{ s.caption }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
