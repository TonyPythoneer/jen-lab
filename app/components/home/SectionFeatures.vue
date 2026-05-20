<template>
  <section class="py-[72px] sm:py-[140px] space-y-8">
    <h2
      class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
    >
      More Is More.
      <span class="block">Stack Sideways.</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:grid-rows-2 md:auto-rows-fr">
      <!-- Cell A: narrow text card, top-left (5/12) -->
      <article
        class="md:col-span-5 bg-ash-white rounded-card p-8 md:p-10 flex flex-col justify-between gap-8 min-h-[360px]"
      >
        <div class="size-12 rounded-card bg-basalt-canvas flex items-center justify-center">
          <span class="size-5 bg-digital-orange rotate-45 rounded-sm" />
        </div>
        <div class="space-y-3">
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
          >
            The Workshop,
            <span class="block">For Massive Builds.</span>
          </h3>
          <p class="text-sm md:text-base text-abyssal-ink/75 leading-relaxed max-w-prose">
            With the workshop bench, ideas and prototypes get their own dedicated chunk to build
            without compromises. Quiet tools, fewer meetings, more shipping.
          </p>
        </div>
      </article>

      <!-- Cell B: wide violet illustration card, top-right (7/12) -->
      <article
        class="md:col-span-7 bg-cyber-violet rounded-card overflow-hidden flex items-center justify-center min-h-[360px] p-10"
      >
        <HomeHarbourBridgeSvg aria-hidden="true" class="w-full h-full max-h-[320px]" />
      </article>

      <!-- Cell C: wide orange illustration card, bottom-left (7/12) -->
      <article
        class="md:col-span-7 bg-digital-orange rounded-card overflow-hidden flex items-center justify-center min-h-[360px] p-10"
      >
        <HomeOperaHouseSvg aria-hidden="true" class="w-full h-full max-h-[320px]" />
      </article>

      <!-- Cell D: narrow text card, bottom-right (5/12) -->
      <article
        class="md:col-span-5 bg-ash-white rounded-card p-8 md:p-10 flex flex-col justify-between gap-8 min-h-[360px]"
      >
        <div class="size-12 rounded-card bg-basalt-canvas flex items-center justify-center">
          <span class="size-5 bg-cyber-violet rotate-45 rounded-sm" />
        </div>
        <div class="space-y-3">
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
          >
            Stitched To The World
            <span class="block">Via The Harbour.</span>
          </h3>
          <p class="text-sm md:text-base text-abyssal-ink/75 leading-relaxed max-w-prose">
            Connect your reading list to a constellation of restaurants, walks and weekend trips.
            Cross-link entries, follow currents, surface what's nearby — all from one map.
          </p>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            :ui="{ base: 'rounded-button px-5 mt-2' }"
            to="/my-best-restaurants-search-in-sydney"
            trailing-icon="i-lucide-play"
          >
            Learn More About Map
          </UButton>
        </div>
      </article>
    </div>
  </section>
</template>
