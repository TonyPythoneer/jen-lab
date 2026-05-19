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

// Pull real WP posts (newest 8) via the shared wpApi helper. Pattern mirrors
// app/pages_backup/blogs/index.vue — useLazyAsyncData (non-blocking SSR), with
// wpTags pulled from the content collection for chip labels.
import { fetchPosts, stripHtml, formatDate } from "~/utils/wpApi";

const { data: postsResult, status: postsStatus } = useLazyAsyncData(
  "home:blog-carousel",
  () => fetchPosts({ page: 1, perPage: 10 }),
  { server: false },
);
const blogLoading = computed(() => postsStatus.value === "idle" || postsStatus.value === "pending");

const { data: wpTagsData } = useLazyAsyncData(
  "home:wp-tags",
  () => queryCollection("wpTags").order("count", "DESC").all(),
  { server: false },
);

const tagMap = computed(() =>
  Object.fromEntries((wpTagsData.value ?? []).map((t) => [t.wpId, t.name])),
);

const BANNER_TONES = ["orange", "violet", "dark"] as const;

const blogPosts = computed(() =>
  (postsResult.value?.data ?? []).map((p, i) => ({
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    excerpt: stripHtml(p.excerpt.rendered),
    date: formatDate(p.date),
    image: p.jetpack_featured_media_url,
    tagLabel: (p.tags?.[0] !== undefined && tagMap.value[p.tags[0]]) || "Post",
    bannerTone: BANNER_TONES[i % BANNER_TONES.length],
  })),
);

const blogCarousel = ref<{ scrollPrev: () => void; scrollNext: () => void } | null>(null);
function scrollBlogPrev() {
  blogCarousel.value?.scrollPrev();
}
function scrollBlogNext() {
  blogCarousel.value?.scrollNext();
}

const toast = useToast();
const subscribeEmail = ref("");
function onSubscribe() {
  if (!subscribeEmail.value) return;
  toast.add({
    title: "Thanks — placeholder.",
    description: "Backend not wired yet. Your email won't be stored anywhere this round.",
    color: "primary",
  });
  subscribeEmail.value = "";
}

// no script state for product_dots section; CSS handles the pattern via the
// .product_dots class defined in the <style> block below.

const builtOn = [
  { name: "Nuxt 4", caption: "Framework", icon: "i-simple-icons-nuxt", accent: "text-emerald-500" },
  {
    name: "Vue 3",
    caption: "Runtime",
    icon: "i-simple-icons-vuedotjs",
    accent: "text-emerald-600",
  },
  {
    name: "Tailwind 4",
    caption: "Styling",
    icon: "i-simple-icons-tailwindcss",
    accent: "text-sky-500",
  },
  {
    name: "Nuxt UI",
    caption: "Components",
    icon: "i-simple-icons-nuxt",
    accent: "text-emerald-500",
  },
  {
    name: "Cloudflare",
    caption: "Hosting",
    icon: "i-simple-icons-cloudflare",
    accent: "text-orange-500",
  },
  { name: "Vite", caption: "Bundler", icon: "i-simple-icons-vite", accent: "text-yellow-500" },
  {
    name: "TypeScript",
    caption: "Language",
    icon: "i-simple-icons-typescript",
    accent: "text-blue-600",
  },
  { name: "pnpm", caption: "Package mgr", icon: "i-simple-icons-pnpm", accent: "text-yellow-600" },
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

    <!-- Products dots preview (radial fade pattern) -->
    <section
      class="product_dots relative bg-ash-white rounded-card overflow-hidden px-8 py-20 md:py-28 text-center"
    >
      <div class="relative z-10 max-w-2xl mx-auto space-y-5">
        <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button px-4 py-1.5' }">
          <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1.5" />
          More is more
        </UBadge>
        <h2
          class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-5xl md:text-7xl"
        >
          Built To
          <span class="block text-digital-orange">Stack Up.</span>
        </h2>
        <p class="text-abyssal-ink/75 leading-relaxed">
          Every section composes from the same six tokens — colour, radius, type, spacing, font,
          shadow. Add another card and it just fits.
        </p>
      </div>
    </section>

    <!-- Features (task 06): 2×2 diagonal layout with big headline above -->
    <section class="space-y-8">
      <h2
        class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
      >
        More Is More.
        <span class="block">Stack Sideways.</span>
      </h2>

      <!--
        Asymmetric 5:7 / 7:5 grid mirroring the reference layout.
        Row 1: narrow text card (5fr) + wide illustration card (7fr).
        Row 2: wide illustration card (7fr) + narrow text card (5fr).
      -->
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
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              :ui="{ base: 'rounded-button px-5 mt-2' }"
              to="/about"
              trailing-icon="i-lucide-play"
            >
              Learn More About Workshop
            </UButton>
          </div>
        </article>

        <!-- Cell B: wide violet illustration card, top-right (7/12) -->
        <article
          class="md:col-span-7 bg-cyber-violet rounded-card overflow-hidden flex items-center justify-center min-h-[360px] p-10"
        >
          <HomeHarbourBridgeSvg class="w-full h-full max-h-[320px]" />
        </article>

        <!-- Cell C: wide orange illustration card, bottom-left (7/12) -->
        <article
          class="md:col-span-7 bg-digital-orange rounded-card overflow-hidden flex items-center justify-center min-h-[360px] p-10"
        >
          <HomeOperaHouseSvg class="w-full h-full max-h-[320px]" />
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
              <HomeGlyphSvg :kind="item.glyph" class="w-full max-w-[260px]" />
            </div>
          </div>
        </template>
      </UTabs>
    </section>

    <!-- Built On — tech stack card grid -->
    <section class="space-y-6">
      <div class="flex items-end justify-between gap-4 px-1">
        <div class="space-y-2">
          <span class="text-cyber-violet text-xs uppercase tracking-widest">Built on</span>
          <h2
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
          >
            The Stack
            <span class="block text-digital-orange">Beneath The Site.</span>
          </h2>
        </div>
        <span
          class="hidden md:inline text-xs uppercase tracking-widest text-abyssal-ink/60 shrink-0"
        >
          Open source · MIT
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        <div
          v-for="(t, i) in builtOn"
          :key="t.name"
          class="group rounded-card p-6 md:p-8 flex flex-col gap-4 transition-colors"
          :class="
            i === 0 || i === 5
              ? 'bg-cyber-violet text-pure-white'
              : 'bg-ash-white text-abyssal-ink hover:bg-pixel-glare/40'
          "
        >
          <div
            class="size-12 rounded-card flex items-center justify-center"
            :class="
              i === 0 || i === 5 ? 'bg-pure-white/15' : 'bg-basalt-canvas group-hover:bg-pure-white'
            "
          >
            <UIcon
              :name="t.icon"
              class="size-7"
              :class="i === 0 || i === 5 ? 'text-pure-white' : t.accent"
            />
          </div>
          <div class="space-y-1">
            <p class="font-display tracking-[0.02em] text-2xl leading-none">{{ t.name }}</p>
            <p
              class="text-xs uppercase tracking-widest"
              :class="i === 0 || i === 5 ? 'text-pure-white/70' : 'text-abyssal-ink/60'"
            >
              {{ t.caption }}
            </p>
          </div>
        </div>
      </div>
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

    <!-- Blog carousel (full-bleed, scrolls beyond container edges) -->
    <section id="blog" class="space-y-6">
      <!-- Header sits inside the 1200px column -->
      <div class="flex items-end justify-between gap-4 px-1">
        <h2
          class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-6xl"
        >
          Blog.
        </h2>
        <div
          class="flex items-center gap-1 border border-dotted border-abyssal-ink/30 rounded-button p-1"
        >
          <button
            class="size-9 inline-flex items-center justify-center rounded-button hover:bg-ash-white transition-colors text-abyssal-ink"
            aria-label="Previous"
            @click="scrollBlogPrev"
          >
            <UIcon name="i-lucide-arrow-left" class="size-4" />
          </button>
          <span class="border-l border-dotted border-abyssal-ink/30 self-stretch" />
          <button
            class="size-9 inline-flex items-center justify-center rounded-button hover:bg-ash-white transition-colors text-abyssal-ink"
            aria-label="Next"
            @click="scrollBlogNext"
          >
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </button>
        </div>
      </div>

      <SnapCarousel
        ref="blogCarousel"
        :items="blogPosts"
        :loading="blogLoading"
        peek="max(1rem, calc((100vw - 1200px) / 2 + 1rem))"
      >
        <template #skeleton>
          <div class="space-y-3">
            <USkeleton class="w-full aspect-[16/9] rounded-card" />
            <USkeleton class="h-5 w-16 rounded" />
            <USkeleton class="h-4 w-full rounded" />
            <USkeleton class="h-4 w-3/4 rounded" />
            <USkeleton class="h-3 w-20 rounded" />
          </div>
        </template>
        <template #default="{ item }">
          <NuxtLink :to="`/blogs/${item.id}?title=${item.slug}`" class="group block space-y-3">
            <!-- Banner: WP featured image when present; coloured halftone fallback otherwise -->
            <div
              class="relative aspect-[16/9] rounded-card overflow-hidden border-2 border-abyssal-ink"
              :class="{
                'bg-digital-orange': item.bannerTone === 'orange',
                'bg-cyber-violet': item.bannerTone === 'violet',
                'bg-abyssal-ink': item.bannerTone === 'dark',
              }"
            >
              <img
                v-if="item.image"
                :src="item.image"
                :alt="stripHtml(item.title)"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-cover"
              />

              <!-- Fallback: coloured halftone + title fragment when no featured image -->
              <template v-else>
                <div
                  aria-hidden="true"
                  class="absolute inset-0 pointer-events-none"
                  :style="{
                    backgroundImage:
                      'radial-gradient(circle, var(--color-abyssal-ink) 2px, transparent 2.5px)',
                    backgroundSize: '12px 12px',
                    opacity: 0.22,
                    maskImage:
                      'radial-gradient(circle at 25% 50%, black 25%, rgba(0,0,0,0.4) 65%, transparent 100%)',
                    WebkitMaskImage:
                      'radial-gradient(circle at 25% 50%, black 25%, rgba(0,0,0,0.4) 65%, transparent 100%)',
                  }"
                />
                <div class="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <span
                    class="font-display tracking-[0.02em] leading-[0.95] text-2xl md:text-3xl text-pure-white drop-shadow line-clamp-2"
                    v-html="item.title"
                  />
                </div>
              </template>

              <!-- Brand mark bottom-left -->
              <div class="absolute bottom-2 left-3 flex items-center gap-1.5">
                <span class="size-2 bg-pure-white rotate-45 rounded-[1px]" />
                <span class="text-[10px] text-pure-white/80 uppercase tracking-widest font-medium">
                  jen-lab
                </span>
              </div>
            </div>

            <!-- Tag + title + date -->
            <div class="space-y-2 px-1">
              <span
                class="inline-block bg-pixel-glare text-abyssal-ink text-xs px-2.5 py-1 rounded font-medium"
              >
                {{ item.tagLabel }}
              </span>
              <h3
                class="text-base font-bold leading-snug text-abyssal-ink line-clamp-2 group-hover:text-digital-orange transition-colors"
                v-html="item.title"
              />
              <p class="text-sm text-abyssal-ink/60">{{ item.date }}</p>
            </div>
          </NuxtLink>
        </template>
      </SnapCarousel>
    </section>

    <!-- Newsletter band (task 10) -->
    <section
      class="relative bg-abyssal-ink rounded-card overflow-hidden p-8 md:p-16 text-center text-pure-white"
    >
      <!-- Background: faded pixel sails bleeding off right edge -->
      <HomeOperaHouseSvg
        class="absolute -right-40 -top-20 w-[700px] opacity-15 pointer-events-none rotate-12"
      />

      <!-- Pixel Glare dot scatter -->
      <HomeBackgroundDots
        color="var(--color-pixel-glare)"
        :opacity="0.18"
        :spacing="36"
        :size="2"
      />

      <div class="relative z-10 max-w-2xl mx-auto space-y-6">
        <div class="flex justify-center">
          <UBadge color="secondary" variant="solid" :ui="{ base: 'rounded-button px-4 py-1.5' }">
            <UIcon name="i-lucide-mail" class="size-3.5 mr-1.5" />
            Slow mail
          </UBadge>
        </div>

        <h2
          class="font-display tracking-[0.02em] leading-[0.95] text-pure-white text-4xl md:text-6xl"
        >
          Notes From
          <span class="block text-digital-orange">The Workbench.</span>
        </h2>

        <p class="text-pure-white/75 leading-relaxed">
          One short email when something ships. No daily digest, no upsell, no AI-generated thread
          summaries. Unsubscribe with one click.
        </p>

        <form
          class="flex flex-col md:flex-row items-stretch gap-2.5 max-w-xl mx-auto pt-2"
          @submit.prevent="onSubscribe"
        >
          <input
            v-model="subscribeEmail"
            type="email"
            required
            placeholder="you@harbour.au"
            class="flex-1 bg-transparent border border-pure-white/40 text-pure-white placeholder:text-pure-white/50 rounded-input px-6 py-4 focus:outline-none focus:border-pure-white focus:ring-2 focus:ring-pure-white/30 transition-colors"
          />
          <UButton
            type="submit"
            color="primary"
            size="xl"
            :ui="{ base: 'rounded-button px-8 justify-center' }"
            trailing-icon="i-lucide-arrow-right"
          >
            Subscribe
          </UButton>
        </form>

        <p class="text-xs text-pure-white/50 uppercase tracking-widest pt-2">
          Roughly one email per month · 312 readers · 0 spam
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.product_dots {
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.2) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  mask-image: radial-gradient(circle, black 30%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, black 30%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
}
</style>
