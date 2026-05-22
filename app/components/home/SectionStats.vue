<script setup lang="ts">
const stats = [
  { value: "5y", label: "Years tinkering", caption: "Since the first toy app." },
  { value: "120+", label: "Restaurants logged", caption: "Across 11 Sydney suburbs." },
  { value: "30+", label: "Posts drafted", caption: "Half-finished is still progress." },
  { value: "1", label: "Harbour called home", caption: "Stretching from Bondi to Manly." },
];
</script>

<template>
  <section class="flex flex-col items-center gap-4">
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
    <div
      class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4 rounded-card overflow-hidden"
    >
      <div
        v-for="(s, i) in stats"
        :key="s.label"
        class="p-8 md:p-10 flex flex-col gap-6 min-h-[240px] justify-between bg-digital-orange text-pure-white"
        :class="{ 'border-b border-pure-white/20 lg:border-b-0 lg:border-r': i < stats.length - 1 }"
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
