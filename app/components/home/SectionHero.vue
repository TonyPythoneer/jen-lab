<script setup lang="ts">
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
  <section class="relative bg-ash-white rounded-card overflow-hidden">
    <HomeBackgroundDots :opacity="0.08" :spacing="28" />

    <HomeOperaHouseSvg
      aria-hidden="true"
      class="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[140%] max-w-none opacity-15 pointer-events-none"
    />

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

    <div
      class="relative z-10 px-6 md:px-12 pt-24 md:pt-28 pb-16 md:pb-20 max-w-[1100px] mx-auto text-center space-y-8"
    >
      <div class="flex justify-center">
        <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button px-4 py-1.5' }">
          <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1.5" />
          Sydney → World · Living lab
        </UBadge>
      </div>

      <h1
        class="font-display tracking-[0.02em] leading-[0.88] text-abyssal-ink text-6xl sm:text-7xl md:text-8xl lg:text-[148px]"
      >
        The Living Lab
        <span class="block text-digital-orange">Of Jen.</span>
      </h1>

      <p class="text-base md:text-xl text-abyssal-ink/75 max-w-2xl mx-auto leading-relaxed">
        A personal sandbox where ideas, restaurants and writing share one harbour. Brewed in Sydney,
        served everywhere — half workbench, half tasting menu.
      </p>

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
</template>
