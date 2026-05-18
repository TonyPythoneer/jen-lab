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

const stats = [
  { value: "5y", label: "Years tinkering", caption: "Since the first toy app." },
  { value: "120+", label: "Restaurants logged", caption: "Across 11 Sydney suburbs." },
  { value: "30+", label: "Posts drafted", caption: "Half-finished is still progress." },
  { value: "1", label: "Harbour called home", caption: "Stretching from Bondi to Manly." },
];

const marqueeStrings = [
  "Built in Sydney",
  "Brewed at the bench",
  "Cooked in Vue",
  "Plated by Nuxt",
  "Logged in markdown",
  "Walked from Bondi to Coogee",
  "Open in public",
];
</script>

<template>
  <div class="container mx-auto max-w-[1200px] space-y-10 px-4 py-10">
    <!-- Hero -->
    <section class="relative bg-ash-white rounded-card overflow-hidden">
      <!-- Background dot pattern -->
      <HomeBackgroundDots :opacity="0.08" :spacing="28" />

      <!-- Faded Opera House behind everything -->
      <HomeOperaHouseSvg
        class="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[140%] max-w-none opacity-15 pointer-events-none"
      />

      <!-- Floating chips, top corners -->
      <div class="absolute top-6 left-6 hidden md:flex items-center gap-2">
        <span class="size-2 rounded-full bg-digital-orange animate-pulse" />
        <span class="text-xs uppercase tracking-widest text-abyssal-ink/70">Online</span>
      </div>
      <NuxtLink
        to="#blog"
        class="absolute top-6 right-6 hidden md:inline-flex items-center gap-2 bg-abyssal-ink text-pure-white rounded-button px-3 py-1.5 text-xs hover:bg-digital-orange transition-colors"
      >
        <span class="size-1.5 rounded-full bg-pixel-glare" />
        New post · 18 May 2026
        <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
      </NuxtLink>

      <!-- Centered content stack -->
      <div
        class="relative z-10 px-6 md:px-12 pt-24 md:pt-28 pb-16 md:pb-20 max-w-[1100px] mx-auto text-center space-y-8"
      >
        <!-- Eyebrow badge -->
        <div class="flex justify-center">
          <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button px-4 py-1.5' }">
            <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1.5" />
            Sydney → World · Living lab
          </UBadge>
        </div>

        <!-- Giant 2-line headline -->
        <h1
          class="font-display tracking-[0.02em] leading-[0.88] text-abyssal-ink text-6xl sm:text-7xl md:text-8xl lg:text-[148px]"
        >
          The Living Lab
          <span class="block text-digital-orange">Of Jen.</span>
        </h1>

        <!-- Subtitle -->
        <p class="text-base md:text-xl text-abyssal-ink/75 max-w-2xl mx-auto leading-relaxed">
          A personal sandbox where ideas, restaurants and writing share one harbour. Brewed in
          Sydney, served everywhere — half workbench, half tasting menu.
        </p>

        <!-- CTAs -->
        <div class="flex flex-wrap justify-center gap-2.5 pt-2">
          <UButton
            color="primary"
            size="xl"
            :ui="{ base: 'rounded-button px-8' }"
            to="/my-best-restaurants-search-in-sydney"
            trailing-icon="i-lucide-arrow-right"
          >
            Explore Restaurants
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="xl"
            :ui="{ base: 'rounded-button px-8' }"
            to="#blog"
          >
            Read The Notebook
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="xl"
            :ui="{ base: 'rounded-button' }"
            to="/about"
            trailing-icon="i-lucide-arrow-right"
          >
            About Jen
          </UButton>
        </div>
      </div>

      <!-- Bottom marquee strip -->
      <div
        class="relative z-10 border-t border-abyssal-ink/10 bg-basalt-canvas/40 backdrop-blur-sm py-4"
      >
        <UMarquee>
          <span
            v-for="(s, i) in marqueeStrings"
            :key="s"
            class="mx-6 inline-flex items-center gap-3 font-display text-xl tracking-[0.02em] text-abyssal-ink/70"
          >
            {{ s }}
            <span class="size-1.5 rounded-full bg-cyber-violet" v-if="i < marqueeStrings.length" />
          </span>
        </UMarquee>
      </div>
    </section>

    <!-- Stats grid (task 05) -->
    <section class="space-y-4">
      <div class="flex items-end justify-between px-1">
        <h2
          class="font-display tracking-[0.02em] leading-[0.95] text-3xl md:text-4xl text-abyssal-ink"
        >
          By The Numbers.
        </h2>
        <span class="text-xs uppercase tracking-widest text-abyssal-ink/60">As of 18 May 2026</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div
          v-for="(s, i) in stats"
          :key="s.label"
          class="rounded-card p-8 md:p-10 flex flex-col gap-6 min-h-[240px] justify-between"
          :class="
            i % 2 === 0 ? 'bg-digital-orange text-pure-white' : 'bg-ash-white text-abyssal-ink'
          "
        >
          <p class="font-display tracking-[0.02em] leading-[0.9] text-6xl md:text-7xl tabular-nums">
            {{ s.value }}
          </p>
          <div class="space-y-1">
            <p class="text-base font-medium">{{ s.label }}</p>
            <p :class="i % 2 === 0 ? 'text-pure-white/75' : 'text-abyssal-ink/60'" class="text-sm">
              {{ s.caption }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sections 06 – 10 land in subsequent commits. -->
    <div
      class="bg-ash-white rounded-card p-10 text-center text-abyssal-ink/60 border border-dashed border-abyssal-ink/15"
    >
      Features / tabs / testimonials / blog / newsletter land in tasks 06 – 10.
    </div>
  </div>
</template>
