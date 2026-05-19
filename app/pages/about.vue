<script setup lang="ts">
useSeoMeta({
  title: "About — Jen Lab",
  description:
    "Hi, I'm Jen. I cook things in code, eat things in Sydney, and write a bit about both.",
});

const facets = [
  {
    title: "Origin",
    body: "Grew up between two languages and one harbour. Curious by default, stubborn on the things that matter.",
    glyph: "gum-leaf" as const,
  },
  {
    title: "Workshop",
    body: "Side-projects in Nuxt and Vue. The point of each project is the next one.",
    glyph: "terminal" as const,
  },
  {
    title: "Outside",
    body: "Coastal walks, weeknight ramen, the occasional half-marathon I regret by kilometre five.",
    glyph: "compass" as const,
  },
];

const now =
  "Currently: rebuilding this site in public, logging restaurants like a librarian, and learning more about typography than is healthy.";
</script>

<template>
  <SitePageContainer>
    <!-- Hero -->
    <UPageHero
      orientation="horizontal"
      :ui="{
        root: 'bg-ash-white rounded-card overflow-hidden',
        container: 'p-10',
        title:
          'font-display tracking-[0.02em] leading-[0.94] text-5xl md:text-7xl text-abyssal-ink',
        description: 'text-abyssal-ink/70 max-w-prose text-lg',
      }"
    >
      <template #title>About Jen.</template>
      <template #description>
        Hi, I'm Jen. I cook things in code, eat things in Sydney, and write a bit about both.
      </template>
      <template #links>
        <UButton to="/blogs" color="primary" :ui="{ base: 'rounded-button' }"
          >Read the Blog</UButton
        >
        <UButton
          to="/my-best-restaurants-search-in-sydney"
          color="neutral"
          variant="outline"
          :ui="{ base: 'rounded-button' }"
        >
          See My Restaurants
        </UButton>
      </template>
      <template #default>
        <HomeOperaHouseSvg class="w-full max-w-xs opacity-80" aria-hidden="true" />
      </template>
    </UPageHero>

    <!-- Facets -->
    <UPageGrid class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <UPageCard
        v-for="f in facets"
        :key="f.title"
        :ui="{
          root: 'bg-ash-white rounded-card p-8',
          title: 'font-display tracking-[0.02em] text-2xl text-abyssal-ink mt-4',
          description: 'text-abyssal-ink/70 mt-2',
        }"
      >
        <template #leading>
          <HomeGlyphSvg :kind="f.glyph" class="w-10 h-10" aria-hidden="true" />
        </template>
        <template #title>{{ f.title }}</template>
        <template #description>{{ f.body }}</template>
      </UPageCard>
    </UPageGrid>

    <!-- Now -->
    <div class="bg-abyssal-ink text-pure-white rounded-card p-10 text-center space-y-4">
      <p class="text-pure-white/60 text-xs uppercase tracking-widest">Now</p>
      <p class="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">{{ now }}</p>
    </div>

    <!-- CTA -->
    <UPageHero
      :ui="{
        root: 'bg-cyber-violet rounded-card overflow-hidden',
        container: 'p-10 text-center',
        title: 'font-display tracking-[0.02em] leading-[0.94] text-4xl md:text-5xl text-pure-white',
        description: 'text-pure-white/70 max-w-prose mx-auto',
      }"
    >
      <template #title>Explore the rest.</template>
      <template #description>Restaurants I love. Notes I've written. More to come.</template>
      <template #links>
        <UButton
          to="/my-best-restaurants-search-in-sydney"
          color="primary"
          :ui="{ base: 'rounded-button' }"
        >
          Best Restaurants
        </UButton>
        <UButton
          to="/blogs"
          color="neutral"
          variant="outline"
          :ui="{
            base: 'rounded-button text-pure-white border-pure-white/30 hover:bg-pure-white/10',
          }"
        >
          Blog
        </UButton>
      </template>
    </UPageHero>
  </SitePageContainer>
</template>
