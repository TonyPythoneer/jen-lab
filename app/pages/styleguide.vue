<script setup lang="ts">
definePageMeta({ layout: false });

useSeoMeta({
  title: "Styleguide — Jen Lab",
  description:
    "Living catalogue of Nuxt UI primitives themed with Caldera tokens, plus decorative SVGs used across the site.",
  robots: "noindex",
});

const toast = useToast();

// #region Token data
const colors = [
  {
    name: "Basalt Canvas",
    hex: "#e2e2df",
    cssVar: "--color-basalt-canvas",
    role: "Page background, secondary surfaces",
  },
  {
    name: "Ash White",
    hex: "#f7f6f2",
    cssVar: "--color-ash-white",
    role: "Card surfaces, button bg, containers",
  },
  {
    name: "Abyssal Ink",
    hex: "#070607",
    cssVar: "--color-abyssal-ink",
    role: "Headings, body text, strong borders",
  },
  {
    name: "Pure White",
    hex: "#ffffff",
    cssVar: "--color-pure-white",
    role: "Text on dark, input text, icon fills",
  },
  {
    name: "Digital Orange",
    hex: "#fc5000",
    cssVar: "--color-digital-orange",
    role: "Primary CTAs, prominent cards, accents",
  },
  {
    name: "Cyber Violet",
    hex: "#524ae9",
    cssVar: "--color-cyber-violet",
    role: "Decorative shapes, accent cards",
  },
  {
    name: "Pixel Glare",
    hex: "#f5f28e",
    cssVar: "--color-pixel-glare",
    role: "Highlights, graphic accents",
  },
];

const spacingSteps = [4, 8, 9, 10, 12, 16, 18, 20, 24, 32, 40, 48, 56, 64, 80, 92];

const radiusSteps = [
  { name: "caldera-2xl", value: 16, token: "--radius-caldera-2xl" },
  { name: "caldera-2xl-2", value: 20, token: "--radius-caldera-2xl-2" },
  { name: "caldera-3xl", value: 24, token: "--radius-caldera-3xl" },
  { name: "caldera-3xl-2", value: 32, token: "--radius-caldera-3xl-2" },
  { name: "card (40)", value: 40, token: "--radius-card" },
  { name: "input (100)", value: 100, token: "--radius-input" },
  { name: "button (800)", value: 800, token: "--radius-button" },
];

const typeScale = [
  { name: "body-sm", size: "14px", cls: "text-[14px] leading-[1.25] font-sans" },
  { name: "body", size: "16px", cls: "text-[16px] leading-[1.55] font-sans" },
  { name: "subheading", size: "30px", cls: "text-[30px] leading-[1.11] font-sans" },
  {
    name: "heading-sm",
    size: "32px",
    cls: "text-[32px] leading-[0.95] tracking-[0.02em] font-display",
  },
  {
    name: "heading",
    size: "56px",
    cls: "text-[56px] leading-[0.94] tracking-[0.02em] font-display",
  },
  {
    name: "display",
    size: "96px",
    cls: "text-[96px] leading-[0.94] tracking-[0.02em] font-display",
  },
];
// #endregion

// #region Interactive widget state
const checkboxState = ref(true);
const switchState = ref(true);
const radioModel = ref("opt-a");
const radioItems = [
  { label: "Option A", value: "opt-a" },
  { label: "Option B", value: "opt-b" },
  { label: "Option C", value: "opt-c" },
];
const inputModel = ref("");
const textareaModel = ref("");
const selectModel = ref("Sydney");
const selectItems = ["Sydney", "Melbourne", "Brisbane", "Perth"];

const tabItems = [
  { label: "First", value: "first", content: "First panel — Caldera-styled tab content." },
  { label: "Second", value: "second", content: "Second panel — try keyboard arrows." },
  { label: "Third", value: "third", content: "Third panel — last one." },
];

const accordionItems = [
  {
    label: "What is this page?",
    value: "what",
    content: "A visual catalogue of every UI primitive Caldera-themed.",
  },
  {
    label: "Why /styleguide?",
    value: "why",
    content: "Lets the designer validate tokens before composing pages.",
  },
  {
    label: "Will it stay live?",
    value: "stay",
    content: "Yes — living spec, accessible in production via direct URL.",
  },
];

const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "Styleguide" }];

const page = ref(3);

const modalOpen = ref(false);
const drawerOpen = ref(false);
// #endregion

// #region Content data
const placeholderPosts = [
  {
    title: "What I learned from logging 100 Sydney restaurants.",
    date: "18 May 2026",
    description: "Notes on patterns, picks, what surprised me.",
  },
  {
    title: "Tinkering with Nuxt content collections in production.",
    date: "04 May 2026",
    description: "A practical walkthrough of schema design.",
  },
  {
    title: "A weekend walk from Bondi to Coogee.",
    date: "19 Apr 2026",
    description: "Eight kilometres, a sandwich, no regrets.",
  },
];

const marqueeStrings = [
  "Built in Sydney",
  "Caldera tokens",
  "Made by Jen",
  "For the harbour",
  "And the workbench",
];

// Decorative SVG inventory — `done: true` swaps the placeholder cell for the real component.
const svgPlaceholders = [
  { label: "OperaHouseSvg", filledBy: "task 04", done: true },
  { label: "HarbourBridgeSvg", filledBy: "task 06" },
  { label: "WaveSvg", filledBy: "task 06" },
  { label: "GlyphSvg · gum-leaf", filledBy: "task 07" },
  { label: "GlyphSvg · terminal", filledBy: "task 07" },
  { label: "GlyphSvg · book", filledBy: "task 07" },
  { label: "GlyphSvg · compass", filledBy: "task 07" },
  { label: "GlyphSvg · coffee", filledBy: "task 07" },
  { label: "GlyphSvg · surf", filledBy: "task 07" },
  { label: "GlyphSvg · ferris", filledBy: "task 07" },
  { label: "GlyphSvg · sail", filledBy: "task 07" },
  { label: "KoalaSvg (optional)", filledBy: "task 11" },
];
// #endregion

// #region TOC sections
const tocSections = [
  { id: "tokens", label: "Tokens" },
  { id: "buttons", label: "Buttons" },
  { id: "form", label: "Form" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "navigation", label: "Navigation" },
  { id: "page-primitives", label: "Page primitives" },
  { id: "content", label: "Content" },
  { id: "decorative-svgs", label: "Decorative SVGs" },
];
// #endregion

function fireToast() {
  toast.add({
    title: "Saved",
    description: "Placeholder toast triggered from styleguide.",
    color: "primary",
  });
}
</script>

<template>
  <UApp>
    <div class="bg-basalt-canvas min-h-screen px-4 py-10">
      <div
        class="container mx-auto max-w-[1200px] grid grid-cols-1 xl:grid-cols-[180px_1fr] gap-10"
      >
        <!-- Sticky TOC -->
        <nav class="hidden xl:block sticky top-10 self-start space-y-2 text-sm">
          <p class="font-display text-2xl tracking-[0.02em] leading-[0.94] text-abyssal-ink mb-4">
            Styleguide
          </p>
          <a
            v-for="s in tocSections"
            :key="s.id"
            :href="`#${s.id}`"
            class="block text-abyssal-ink/70 hover:text-digital-orange transition-colors"
          >
            {{ s.label }}
          </a>
        </nav>

        <main class="space-y-16 min-w-0">
          <!-- Header -->
          <header class="space-y-3">
            <p class="text-cyber-violet text-sm uppercase tracking-widest">Caldera-flavoured</p>
            <h1
              class="font-display tracking-[0.02em] leading-[0.94] text-5xl md:text-7xl text-abyssal-ink"
            >
              Jen Lab — Styleguide
            </h1>
            <p class="text-abyssal-ink/70 max-w-prose">
              Every Nuxt UI primitive themed with Caldera tokens, plus a catalogue of decorative
              SVGs the landing page draws from. Living spec; updates as tasks land.
            </p>
          </header>

          <!-- Tokens -->
          <section id="tokens" class="space-y-8">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Tokens
            </h2>

            <!-- Colors -->
            <div class="space-y-3">
              <h3 class="text-sm uppercase tracking-widest text-cyber-violet">Colors</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div
                  v-for="c in colors"
                  :key="c.name"
                  class="bg-ash-white rounded-card p-5 space-y-3"
                >
                  <div
                    class="w-full aspect-video rounded-card border border-abyssal-ink/10"
                    :style="{ background: c.hex }"
                  />
                  <div class="space-y-1">
                    <p
                      class="font-display text-2xl tracking-[0.02em] leading-none text-abyssal-ink"
                    >
                      {{ c.name }}
                    </p>
                    <p class="text-sm text-abyssal-ink/60 font-mono">{{ c.hex }}</p>
                    <p class="text-xs text-abyssal-ink/50">{{ c.cssVar }}</p>
                    <p class="text-sm text-abyssal-ink/70 pt-1">{{ c.role }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Spacing -->
            <div class="space-y-3">
              <h3 class="text-sm uppercase tracking-widest text-cyber-violet">Spacing scale</h3>
              <div class="bg-ash-white rounded-card p-6 space-y-2">
                <div v-for="n in spacingSteps" :key="n" class="flex items-center gap-4">
                  <span class="font-mono text-xs text-abyssal-ink/60 w-20">{{ n }}px</span>
                  <span
                    class="block bg-digital-orange h-3 rounded-sm"
                    :style="{ width: `${n}px` }"
                  />
                </div>
              </div>
            </div>

            <!-- Radius -->
            <div class="space-y-3">
              <h3 class="text-sm uppercase tracking-widest text-cyber-violet">Border radius</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                <div
                  v-for="r in radiusSteps"
                  :key="r.name"
                  class="bg-ash-white rounded-card p-4 space-y-2"
                >
                  <div
                    class="w-full aspect-square bg-cyber-violet"
                    :style="{ borderRadius: `${r.value}px` }"
                  />
                  <p class="text-xs font-mono text-abyssal-ink/70">{{ r.name }}</p>
                  <p class="text-xs text-abyssal-ink/50">{{ r.value }}px</p>
                </div>
              </div>
            </div>

            <!-- Typography -->
            <div class="space-y-3">
              <h3 class="text-sm uppercase tracking-widest text-cyber-violet">Type scale</h3>
              <div class="bg-ash-white rounded-card p-6 space-y-6">
                <div
                  v-for="t in typeScale"
                  :key="t.name"
                  class="flex items-baseline gap-6 border-b border-abyssal-ink/5 pb-4 last:border-0 last:pb-0"
                >
                  <span class="font-mono text-xs text-abyssal-ink/50 w-24 shrink-0"
                    >{{ t.name }} / {{ t.size }}</span
                  >
                  <span :class="['text-abyssal-ink', t.cls]">The harbour at dawn.</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Buttons -->
          <section id="buttons" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Buttons
            </h2>

            <div class="bg-ash-white rounded-card p-8 space-y-6">
              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Primary (pill)</p>
                <div class="flex flex-wrap items-center gap-2.5">
                  <UButton color="primary" size="sm" :ui="{ base: 'rounded-button' }"
                    >Subscribe</UButton
                  >
                  <UButton color="primary" size="md" :ui="{ base: 'rounded-button' }"
                    >Subscribe</UButton
                  >
                  <UButton color="primary" size="lg" :ui="{ base: 'rounded-button' }"
                    >Subscribe</UButton
                  >
                  <UButton color="primary" size="xl" :ui="{ base: 'rounded-button' }"
                    >Subscribe</UButton
                  >
                  <UButton color="primary" :ui="{ base: 'rounded-button' }" loading
                    >Loading</UButton
                  >
                  <UButton color="primary" :ui="{ base: 'rounded-button' }" disabled
                    >Disabled</UButton
                  >
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">
                  Secondary (outline pill)
                </p>
                <div class="flex flex-wrap items-center gap-2.5">
                  <UButton color="neutral" variant="outline" :ui="{ base: 'rounded-button' }"
                    >Read more</UButton
                  >
                  <UButton
                    color="neutral"
                    variant="outline"
                    :ui="{ base: 'rounded-button' }"
                    trailing-icon="i-lucide-arrow-right"
                    >Continue</UButton
                  >
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Ghost</p>
                <div class="flex flex-wrap items-center gap-2.5">
                  <UButton color="neutral" variant="ghost" :ui="{ base: 'rounded-button' }"
                    >See all →</UButton
                  >
                  <UButton color="primary" variant="ghost" :ui="{ base: 'rounded-button' }"
                    >Brand ghost</UButton
                  >
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Soft accent</p>
                <div class="flex flex-wrap items-center gap-2.5">
                  <UButton color="secondary" variant="soft" :ui="{ base: 'rounded-button' }"
                    >Slow mail</UButton
                  >
                  <UButton color="primary" variant="soft" :ui="{ base: 'rounded-button' }"
                    >New</UButton
                  >
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Icon</p>
                <div class="flex flex-wrap items-center gap-2.5">
                  <UButton
                    icon="i-lucide-plus"
                    color="primary"
                    :ui="{ base: 'rounded-card w-10 h-10 justify-center' }"
                  />
                  <UButton
                    icon="i-lucide-heart"
                    color="neutral"
                    variant="outline"
                    :ui="{ base: 'rounded-card w-10 h-10 justify-center' }"
                  />
                  <UButton
                    icon="i-lucide-share-2"
                    color="neutral"
                    variant="ghost"
                    :ui="{ base: 'rounded-card w-10 h-10 justify-center' }"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Form -->
          <section id="form" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Form
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div class="bg-ash-white rounded-card p-8 space-y-5">
                <UFormField label="Email" hint="We won't share it.">
                  <UInput
                    v-model="inputModel"
                    type="email"
                    placeholder="you@harbour.au"
                    icon="i-lucide-mail"
                    :ui="{ base: 'rounded-input' }"
                  />
                </UFormField>

                <UFormField label="City">
                  <USelect
                    v-model="selectModel"
                    :items="selectItems"
                    :ui="{ base: 'rounded-input' }"
                  />
                </UFormField>

                <UFormField label="Bio">
                  <UTextarea
                    v-model="textareaModel"
                    placeholder="Tell us about your favourite Sydney walk."
                    :rows="3"
                    :ui="{ base: 'rounded-card' }"
                  />
                </UFormField>

                <UFormField label="Email with error" :error="'Required'">
                  <UInput placeholder="missing" :ui="{ base: 'rounded-input' }" />
                </UFormField>
              </div>

              <div class="bg-ash-white rounded-card p-8 space-y-6">
                <div class="space-y-2">
                  <p class="text-sm uppercase tracking-widest text-cyber-violet">Checkbox</p>
                  <UCheckbox v-model="checkboxState" label="I agree to the harbour terms" />
                </div>

                <div class="space-y-2">
                  <p class="text-sm uppercase tracking-widest text-cyber-violet">Switch</p>
                  <USwitch v-model="switchState" label="Receive slow mail" />
                </div>

                <div class="space-y-2">
                  <p class="text-sm uppercase tracking-widest text-cyber-violet">Radio group</p>
                  <URadioGroup v-model="radioModel" :items="radioItems" />
                </div>
              </div>
            </div>
          </section>

          <!-- Feedback -->
          <section id="feedback" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Feedback
            </h2>

            <div class="bg-ash-white rounded-card p-8 space-y-6">
              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Badges</p>
                <div class="flex flex-wrap gap-2.5">
                  <UBadge color="primary" variant="solid" :ui="{ base: 'rounded-button' }"
                    >Solid primary</UBadge
                  >
                  <UBadge color="primary" variant="soft" :ui="{ base: 'rounded-button' }"
                    >Soft primary</UBadge
                  >
                  <UBadge color="primary" variant="outline" :ui="{ base: 'rounded-button' }"
                    >Outline primary</UBadge
                  >
                  <UBadge color="secondary" variant="solid" :ui="{ base: 'rounded-button' }"
                    >Solid violet</UBadge
                  >
                  <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button' }"
                    >Soft violet</UBadge
                  >
                  <UBadge color="neutral" variant="outline" :ui="{ base: 'rounded-button' }"
                    >Outline neutral</UBadge
                  >
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Alerts</p>
                <UAlert
                  color="primary"
                  variant="soft"
                  title="Heads up"
                  description="A primary alert message in soft tone."
                />
                <UAlert
                  color="warning"
                  variant="soft"
                  title="Pending"
                  description="A warning alert message."
                />
                <UAlert
                  color="success"
                  variant="soft"
                  title="All clear"
                  description="A success alert message."
                />
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Skeleton</p>
                <div class="space-y-2">
                  <USkeleton class="h-4 w-3/4 rounded-card" />
                  <USkeleton class="h-4 w-1/2 rounded-card" />
                  <USkeleton class="h-10 w-32 rounded-button" />
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Toast</p>
                <UButton color="primary" :ui="{ base: 'rounded-button' }" @click="fireToast">
                  Trigger toast
                </UButton>
              </div>
            </div>
          </section>

          <!-- Overlays -->
          <section id="overlays" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Overlays
            </h2>

            <div class="bg-ash-white rounded-card p-8 flex flex-wrap gap-2.5">
              <UModal
                v-model:open="modalOpen"
                title="Modal title"
                description="Caldera-styled modal placeholder."
              >
                <UButton color="neutral" variant="outline" :ui="{ base: 'rounded-button' }"
                  >Open modal</UButton
                >
                <template #body>
                  <p class="text-abyssal-ink/80">
                    Body content. Close with esc, click outside, or the X button.
                  </p>
                </template>
              </UModal>

              <UDrawer
                v-model:open="drawerOpen"
                title="Drawer title"
                description="Caldera-styled drawer placeholder."
              >
                <UButton color="neutral" variant="outline" :ui="{ base: 'rounded-button' }"
                  >Open drawer</UButton
                >
                <template #body>
                  <p class="text-abyssal-ink/80">Drawer content. Slides in from the side.</p>
                </template>
              </UDrawer>
            </div>
          </section>

          <!-- Navigation -->
          <section id="navigation" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Navigation
            </h2>

            <div class="bg-ash-white rounded-card p-8 space-y-8">
              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Tabs (pill)</p>
                <UTabs
                  :items="tabItems"
                  color="primary"
                  variant="pill"
                  :ui="{ list: 'rounded-button', trigger: 'rounded-button' }"
                />
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Tabs (link)</p>
                <UTabs :items="tabItems" color="primary" variant="link" />
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Accordion</p>
                <UAccordion :items="accordionItems" />
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Breadcrumb</p>
                <UBreadcrumb :items="breadcrumbItems" />
              </div>

              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-cyber-violet">Pagination</p>
                <UPagination v-model:page="page" :total="100" :items-per-page="10" />
              </div>
            </div>
          </section>

          <!-- Page primitives -->
          <section id="page-primitives" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Page primitives
            </h2>

            <!-- UPageHero compact -->
            <UPageHero
              orientation="horizontal"
              :ui="{
                root: 'bg-ash-white rounded-card overflow-hidden',
                container: 'p-10',
                title:
                  'font-display tracking-[0.02em] leading-[0.94] text-4xl md:text-6xl text-abyssal-ink',
                description: 'text-abyssal-ink/80 max-w-prose',
              }"
            >
              <template #headline>
                <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button' }"
                  >UPageHero</UBadge
                >
              </template>
              <template #title>A Hero In Pill And Slab.</template>
              <template #description>
                Compact configuration of UPageHero with Caldera tokens. Slot the OperaHouseSvg here
                once task 04 ships.
              </template>
              <template #links>
                <UButton color="primary" :ui="{ base: 'rounded-button' }">Primary</UButton>
                <UButton color="neutral" variant="outline" :ui="{ base: 'rounded-button' }"
                  >Secondary</UButton
                >
              </template>
            </UPageHero>

            <!-- UPageGrid + UPageCard -->
            <UPageGrid class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <UPageCard
                v-for="(s, i) in [
                  { v: '5y', l: 'Years tinkering' },
                  { v: '120+', l: 'Restaurants logged' },
                  { v: '30+', l: 'Blog posts drafted' },
                  { v: '1', l: 'Harbour called home' },
                ]"
                :key="s.l"
                :variant="i % 2 === 0 ? 'solid' : 'subtle'"
                :color="i % 2 === 0 ? 'primary' : 'neutral'"
                :ui="{
                  root: 'rounded-card p-10',
                  title: 'font-display tracking-[0.02em] leading-[0.94] text-6xl tabular-nums',
                  description: 'text-base mt-2',
                }"
              >
                <template #title>{{ s.v }}</template>
                <template #description>{{ s.l }}</template>
              </UPageCard>
            </UPageGrid>

            <!-- UPageFeature -->
            <UPageFeature
              orientation="horizontal"
              :ui="{
                root: 'bg-ash-white rounded-card p-10',
                title:
                  'font-display tracking-[0.02em] leading-[0.95] text-3xl md:text-4xl text-abyssal-ink',
                description: 'text-abyssal-ink/80 mt-4 max-w-prose',
              }"
            >
              <template #leading>
                <span class="text-cyber-violet text-sm uppercase tracking-widest"
                  >UPageFeature</span
                >
              </template>
              <template #title>Feature With Two Columns.</template>
              <template #description>
                Body text on the left, decorative SVG on the right. Swap the right slot with
                HarbourBridgeSvg or WaveSvg after task 06.
              </template>
              <template #default>
                <div
                  class="aspect-square w-full bg-cyber-violet/10 rounded-card flex items-center justify-center"
                >
                  <span class="text-cyber-violet/60 text-sm">SVG slot</span>
                </div>
              </template>
            </UPageFeature>

            <!-- UPageCTA -->
            <UPageCTA
              :ui="{
                root: 'bg-abyssal-ink rounded-card p-10 relative overflow-hidden',
                title:
                  'font-display tracking-[0.02em] leading-[0.95] text-pure-white text-3xl md:text-4xl text-center',
                description: 'text-pure-white/80 text-center mt-4 max-w-prose mx-auto',
              }"
            >
              <template #headline>
                <UBadge color="secondary" variant="solid" :ui="{ base: 'rounded-button mx-auto' }"
                  >UPageCTA</UBadge
                >
              </template>
              <template #title>The CTA Band.</template>
              <template #description
                >Dark band with optional embedded form. The newsletter task wires the real form
                in.</template
              >
              <template #links>
                <UButton color="primary" :ui="{ base: 'rounded-button' }">Subscribe</UButton>
              </template>
            </UPageCTA>
          </section>

          <!-- Content -->
          <section id="content" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Content
            </h2>

            <!-- UBlogPosts -->
            <div class="space-y-3">
              <h3 class="text-sm uppercase tracking-widest text-cyber-violet">UBlogPosts</h3>
              <UBlogPosts class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <UBlogPost
                  v-for="p in placeholderPosts"
                  :key="p.title"
                  :title="p.title"
                  :description="p.description"
                  :date="p.date"
                  orientation="vertical"
                  :ui="{
                    root: 'bg-ash-white rounded-card overflow-hidden p-6',
                    title: 'text-base font-bold line-clamp-2 mt-3',
                    date: 'inline-block bg-pixel-glare text-abyssal-ink text-xs px-3 py-1 rounded-button',
                  }"
                >
                  <template #image>
                    <div
                      class="aspect-video w-full bg-cyber-violet/10 rounded-card flex items-center justify-center"
                    >
                      <span class="text-cyber-violet/60 text-xs">Image slot</span>
                    </div>
                  </template>
                </UBlogPost>
              </UBlogPosts>
            </div>

            <!-- UMarquee -->
            <div class="space-y-3">
              <h3 class="text-sm uppercase tracking-widest text-cyber-violet">UMarquee</h3>
              <div class="bg-ash-white rounded-card p-6">
                <UMarquee>
                  <span
                    v-for="s in marqueeStrings"
                    :key="s"
                    class="font-display text-2xl tracking-[0.02em] text-abyssal-ink mx-8"
                  >
                    {{ s }}
                  </span>
                </UMarquee>
              </div>
            </div>
          </section>

          <!-- Decorative SVGs -->
          <section id="decorative-svgs" class="space-y-6">
            <h2 class="font-display text-4xl tracking-[0.02em] leading-[0.95] text-abyssal-ink">
              Decorative SVGs
            </h2>
            <p class="text-abyssal-ink/70 max-w-prose">
              Sydney / Australia motif components used across the landing pages. Each cell is a
              placeholder until the corresponding task lands.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              <div
                v-for="s in svgPlaceholders"
                :key="s.label"
                class="bg-ash-white rounded-card p-5 space-y-3"
              >
                <div
                  class="w-full aspect-square bg-cyber-violet/10 rounded-card flex items-center justify-center overflow-hidden"
                >
                  <HomeOperaHouseSvg
                    v-if="s.label === 'OperaHouseSvg' && s.done"
                    class="w-full h-full p-2"
                  />
                  <span v-else class="text-cyber-violet/60 text-xs text-center px-2"
                    >Placeholder</span
                  >
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-mono text-abyssal-ink">{{ s.label }}</p>
                  <p class="text-xs text-abyssal-ink/50">filled by {{ s.filledBy }}</p>
                </div>
              </div>
            </div>
          </section>

          <footer
            class="pt-10 border-t border-abyssal-ink/10 text-center text-sm text-abyssal-ink/50"
          >
            Living styleguide · updates as MIMIC_CALDERA tasks land.
          </footer>
        </main>
      </div>
    </div>
  </UApp>
</template>
