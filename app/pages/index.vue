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

// NOTE: all testimonials below are fictional placeholders. Replace with real
// quotes before any public deploy.
const testimonials = [
  {
    name: "Skye Harbour",
    org: "Beachside Studio",
    role: "Brand designer",
    quote:
      "Felt like a stroll along the foreshore — I always knew exactly where I was going. The kind of personal site that reads more like a journal than a portfolio.",
    glyph: "coffee" as const,
  },
  {
    name: "Mateo Bondi",
    org: "Night Owl Café",
    role: "Owner / barista",
    quote:
      "Stumbled across this site at 2am and bookmarked half of it. Three of the restaurant picks are now on my regular rotation; the writing kept me reading until close.",
    glyph: "surf" as const,
  },
  {
    name: "Inga Pylon",
    org: "Local Cyclist Co-op",
    role: "Route maker",
    quote:
      "Reminds me of the harbour bridge: bold, useful, hard to miss. The map alone is worth the visit — the side-projects are the dessert.",
    glyph: "ferris" as const,
  },
];

// TODO: replace with real @nuxt/content blog collection once /blogs route is
// restored (task 13). For now, placeholder posts so the row composition can be
// designed.
const blogPosts = [
  {
    date: "18 May 2026",
    tag: "Food",
    title: "What I learned from logging 100 Sydney restaurants.",
    excerpt:
      "A year in, here are the patterns I didn't expect — and the three suburbs that consistently punch above their weight.",
    glyph: "gum-leaf" as const,
    accent: "bg-digital-orange/10",
  },
  {
    date: "04 May 2026",
    tag: "Code",
    title: "Tinkering with Nuxt content collections in production.",
    excerpt:
      "Schema design choices, gotchas with discriminated unions, and what I'd do differently on day two.",
    glyph: "terminal" as const,
    accent: "bg-cyber-violet/10",
  },
  {
    date: "19 Apr 2026",
    tag: "Wander",
    title: "A weekend walk from Bondi to Coogee.",
    excerpt:
      "Eight kilometres, four beaches, one very good banana bread stop. The coastal walk, done slow.",
    glyph: "compass" as const,
    accent: "bg-pixel-glare/30",
  },
  {
    date: "02 Apr 2026",
    tag: "Code",
    title: "Tabs, not stacks: a small UI rule that pays off.",
    excerpt:
      "When to group screens into tabs vs collapse into a stack, with three real examples from this site.",
    glyph: "book" as const,
    accent: "bg-cyber-violet/10",
  },
  {
    date: "21 Mar 2026",
    tag: "Meta",
    title: "Why I rewrote my personal site for the fifth time.",
    excerpt:
      "Less framework churn, more design intent. Notes on choosing a vocabulary and committing to it.",
    glyph: "sail" as const,
    accent: "bg-digital-orange/10",
  },
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

    <!-- Features (task 06): two side-by-side blocks -->
    <section class="space-y-2.5">
      <!-- Block 1 — Workshop with Harbour Bridge -->
      <div
        class="bg-ash-white rounded-card p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        <div class="space-y-5">
          <span class="text-cyber-violet text-xs uppercase tracking-widest">Workshop</span>
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
          >
            The Workshop Where
            <span class="block text-digital-orange">Ideas Get Forged.</span>
          </h3>
          <p class="text-abyssal-ink/75 max-w-prose leading-relaxed">
            Quiet bench, sharp tools, lots of half-finished prototypes. The point of any side
            project isn't the artefact — it's the muscle memory of shipping small things, over and
            over, until the next one feels easy.
          </p>
          <ul class="space-y-2 text-sm text-abyssal-ink/70">
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-digital-orange" />
              Built in Vue 3 + Nuxt 4
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-digital-orange" />
              Deployed to Cloudflare Pages
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-digital-orange" />
              Open in public, half the time
            </li>
          </ul>
          <UButton
            color="neutral"
            variant="outline"
            :ui="{ base: 'rounded-button px-6' }"
            to="/about"
            trailing-icon="i-lucide-arrow-right"
          >
            Read the workbench notes
          </UButton>
        </div>
        <div class="order-first md:order-last">
          <HomeHarbourBridgeSvg class="w-full max-w-[460px] mx-auto" />
        </div>
      </div>

      <!-- Block 2 — Reef with Wave -->
      <div
        class="bg-ash-white rounded-card p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        <div>
          <HomeWaveSvg class="w-full max-w-[460px] mx-auto" />
        </div>
        <div class="space-y-5">
          <span class="text-cyber-violet text-xs uppercase tracking-widest">Reef</span>
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
          >
            Stitched To The
            <span class="block text-digital-orange">Wider Reef.</span>
          </h3>
          <p class="text-abyssal-ink/75 max-w-prose leading-relaxed">
            Everything links to everything: blog references restaurants, restaurants reference
            walks, walks reference notes. One site, lots of currents, all flowing back to the same
            harbour.
          </p>
          <div class="grid grid-cols-3 gap-2 pt-2">
            <div class="bg-basalt-canvas/60 rounded-card p-3 text-center">
              <p class="font-display text-2xl text-abyssal-ink tabular-nums">11</p>
              <p class="text-xs text-abyssal-ink/60 uppercase tracking-widest mt-1">Suburbs</p>
            </div>
            <div class="bg-basalt-canvas/60 rounded-card p-3 text-center">
              <p class="font-display text-2xl text-abyssal-ink tabular-nums">7</p>
              <p class="text-xs text-abyssal-ink/60 uppercase tracking-widest mt-1">Tags</p>
            </div>
            <div class="bg-basalt-canvas/60 rounded-card p-3 text-center">
              <p class="font-display text-2xl text-abyssal-ink tabular-nums">∞</p>
              <p class="text-xs text-abyssal-ink/60 uppercase tracking-widest mt-1">Currents</p>
            </div>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            :ui="{ base: 'rounded-button px-6' }"
            to="/my-best-restaurants-search-in-sydney"
            trailing-icon="i-lucide-arrow-right"
          >
            Follow the currents
          </UButton>
        </div>
      </div>
    </section>

    <!-- Use-case tabs (task 07) -->
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
                {{ (item as any).headline }}
              </h3>
              <p class="text-abyssal-ink/75 leading-relaxed">{{ (item as any).body }}</p>
              <UButton
                v-if="(item as any).cta"
                color="neutral"
                variant="outline"
                :ui="{ base: 'rounded-button px-6' }"
                :to="(item as any).cta.to"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ (item as any).cta.label }}
              </UButton>
              <p v-else class="text-sm text-abyssal-ink/50 italic">Trail journal coming soon.</p>
            </div>
            <div
              class="bg-basalt-canvas rounded-card aspect-square flex items-center justify-center p-10"
            >
              <HomeGlyphSvg :kind="(item as any).glyph" class="w-full max-w-[260px]" />
            </div>
          </div>
        </template>
      </UTabs>
    </section>

    <!-- Testimonials (task 08) -->
    <section class="space-y-8">
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-cyber-violet text-xs uppercase tracking-widest">Echoes</span>
        <h2
          class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
        >
          Echoes From
          <span class="block text-digital-orange">The Harbour.</span>
        </h2>
        <p class="text-abyssal-ink/75 leading-relaxed">
          What strangers, friends and the occasional 2am visitor have said. Names are fictional —
          the sentiments are not.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <article
          v-for="(t, i) in testimonials"
          :key="t.name"
          class="rounded-card p-8 md:p-10 flex flex-col gap-6 min-h-[300px]"
          :class="i === 1 ? 'bg-cyber-violet text-pure-white' : 'bg-ash-white text-abyssal-ink'"
        >
          <div
            class="size-12 rounded-card flex items-center justify-center shrink-0"
            :class="i === 1 ? 'bg-pure-white/15' : 'bg-basalt-canvas'"
          >
            <HomeGlyphSvg :kind="t.glyph" class="size-8" />
          </div>
          <blockquote class="text-base md:text-lg leading-relaxed flex-1 italic">
            "{{ t.quote }}"
          </blockquote>
          <footer class="space-y-0.5">
            <p class="font-medium">{{ t.name }}</p>
            <p :class="i === 1 ? 'text-pure-white/70' : 'text-abyssal-ink/60'" class="text-sm">
              {{ t.role }} · {{ t.org }}
            </p>
          </footer>
        </article>
      </div>
    </section>

    <!-- Blog preview row (task 09) -->
    <section id="blog" class="space-y-6">
      <div class="flex items-end justify-between gap-4 px-1">
        <div class="space-y-2">
          <span class="text-cyber-violet text-xs uppercase tracking-widest">Notebook</span>
          <h2
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
          >
            Latest From
            <span class="block text-digital-orange">The Notebook.</span>
          </h2>
        </div>
        <UButton
          to="/blogs"
          color="neutral"
          variant="ghost"
          :ui="{ base: 'rounded-button shrink-0' }"
          trailing-icon="i-lucide-arrow-right"
        >
          See all
        </UButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
        <NuxtLink
          v-for="post in blogPosts"
          :key="post.title"
          to="/blogs"
          class="group bg-ash-white rounded-card overflow-hidden p-5 flex flex-col gap-4 hover:scale-[1.01] transition-transform"
        >
          <div
            class="aspect-video w-full rounded-card flex items-center justify-center"
            :class="post.accent"
          >
            <HomeGlyphSvg :kind="post.glyph" class="w-1/2" />
          </div>
          <div class="flex items-center gap-2">
            <span
              class="bg-pixel-glare text-abyssal-ink text-xs px-3 py-1 rounded-button font-medium"
            >
              {{ post.date }}
            </span>
            <span class="text-xs uppercase tracking-widest text-abyssal-ink/60">
              {{ post.tag }}
            </span>
          </div>
          <h3
            class="text-base font-bold leading-snug text-abyssal-ink line-clamp-2 group-hover:text-digital-orange transition-colors"
          >
            {{ post.title }}
          </h3>
          <p class="text-sm text-abyssal-ink/70 line-clamp-2 flex-1">
            {{ post.excerpt }}
          </p>
          <span
            class="inline-flex items-center gap-1 text-sm text-abyssal-ink/80 group-hover:text-digital-orange group-hover:translate-x-1 transition-all"
          >
            Read post
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- Newsletter band (task 10) lands next. -->
    <div
      class="bg-ash-white rounded-card p-10 text-center text-abyssal-ink/60 border border-dashed border-abyssal-ink/15"
    >
      Newsletter band lands in task 10.
    </div>
  </div>
</template>
