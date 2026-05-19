<script setup lang="ts">
const useCaseItems = [
  {
    label: "Food",
    value: "food",
    headline: "Sydney's Best Plates, Mapped.",
    body: "120+ restaurants logged across the harbour, filterable by area and cuisine. Every entry is a personal visit — no scraped reviews, no SEO bait. Just where I'd send a friend tomorrow.",
    glyph: "gum-leaf" as const,
    cta: { label: "Open Map", to: "/my-best-restaurants-search-in-sydney" },
  },
  {
    label: "Code",
    value: "code",
    headline: "Side-Projects, Half-Broken And Proud.",
    body: "Nuxt experiments, Vue components, the occasional Cloudflare Worker. The repo is mostly toy code I keep around because the next idea always borrows from the last.",
    glyph: "terminal" as const,
    cta: { label: "See GitHub", to: "https://github.com/tonypythoneer" },
  },
  {
    label: "Writing",
    value: "writing",
    headline: "Notes From The Workbench.",
    body: "Long-form posts about what I learned the hard way — design tokens, content collections, why I rewrote my site for the fifth time. Less manifesto, more diary.",
    glyph: "book" as const,
    cta: { label: "Read Blog", to: "/blogs" },
  },
  {
    label: "Wander",
    value: "wander",
    headline: "Trails, Harbours, Weekend Escapes.",
    body: "Bondi to Coogee, Manly to Spit Bridge, the slow ferry to Watsons Bay. Mostly coastal, occasionally inland, always with a stop for coffee on the way back.",
    glyph: "compass" as const,
    cta: null as null | { label: string; to: string },
  },
];

const activeUseCase = ref("food");
</script>

<template>
  <section class="bg-ash-white rounded-card p-8 md:p-12 space-y-8">
    <div class="space-y-3 max-w-2xl">
      <span class="text-cyber-violet text-xs uppercase tracking-widest">Use cases</span>
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
      >
        Four Currents,
        <span class="block text-digital-orange">One Harbour.</span>
      </h2>
      <p class="text-abyssal-ink/75 leading-relaxed">
        What I spend most of my time on. Pick a tab to see the working surface.
      </p>
    </div>

    <UTabs
      v-model="activeUseCase"
      :items="useCaseItems"
      color="primary"
      variant="pill"
      :ui="{ list: 'rounded-button bg-basalt-canvas', trigger: 'rounded-button' }"
    >
      <template #content="{ item }">
        <div class="grid md:grid-cols-2 gap-10 items-center mt-10">
          <div class="space-y-5">
            <h3
              class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
            >
              {{ item.headline }}
            </h3>
            <p class="text-abyssal-ink/75 leading-relaxed">{{ item.body }}</p>
            <UButton
              v-if="item.cta"
              color="neutral"
              variant="outline"
              :ui="{ base: 'rounded-button px-6' }"
              :to="item.cta.to"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ item.cta.label }}
            </UButton>
            <p v-else class="text-sm text-abyssal-ink/50 italic">Trail journal coming soon.</p>
          </div>
          <div
            class="bg-basalt-canvas rounded-card aspect-square flex items-center justify-center p-10"
          >
            <HomeGlyphSvg aria-hidden="true" :kind="item.glyph" class="w-full max-w-[260px]" />
          </div>
        </div>
      </template>
    </UTabs>
  </section>
</template>
