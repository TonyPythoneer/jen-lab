<script setup lang="ts">
// Card copy comes from content/pages-layout/home.md (section-directions block).
// Each card only picks a `colorKey`; this component owns the actual Tailwind
// classes and the left/right layout so editors never touch CSS.
const COLOR_MAP = {
  violet: {
    colorBg: "bg-cyber-violet",
    subtitleClass: "text-cyber-violet",
    ctaClass: "bg-cyber-violet hover:bg-cyber-violet/90",
    coloredSide: "right" as const,
  },
  orange: {
    colorBg: "bg-digital-orange",
    subtitleClass: "text-digital-orange",
    ctaClass: "bg-digital-orange hover:bg-digital-orange/90",
    coloredSide: "left" as const,
  },
};

type ColorKey = keyof typeof COLOR_MAP;

interface DirectionCard {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  imageSrc: string;
  imageAlt: string;
  colorKey: ColorKey;
}

withDefaults(
  defineProps<{
    heading?: string;
    headingAccent?: string;
    cards?: DirectionCard[];
  }>(),
  {
    heading: "Jen is Jen.",
    headingAccent: "Jen is always me.",
    cards: () => [
      {
        title: "Jen Knows",
        subtitle: "職涯 × 職場",
        description: "陪你找到在澳洲的下一步——求職、職場文化、職涯諮詢，以中文深入講清楚。",
        ctaLabel: "訪問 Jen Knows",
        ctaTo: "/jen-knows",
        imageSrc: "/home/jen-knows-hero.webp",
        imageAlt: "Jen Knows — 榛知職涯身份",
        colorKey: "violet",
      },
      {
        title: "Jen Liu",
        subtitle: "旅遊 × 美食",
        description: "雪梨在地視角，帶你探索澳洲旅遊、美食與自助旅行的大小事。",
        ctaLabel: "訪問 Jen Liu",
        ctaTo: "/jen-liu",
        imageSrc: "/home/jen-liu-hero.webp",
        imageAlt: "Jen Liu — 榛知旅遊身份",
        colorKey: "orange",
      },
    ],
  },
);

const pinWrapper = useTemplateRef<HTMLElement>("pinWrapper");
const { progress } = useScrollProgress(pinWrapper);
</script>

<template>
  <!-- Outer section is the scroll runway; inner div pins while runway scrolls past -->
  <section ref="pinWrapper" class="h-[250vh]">
    <div
      class="sticky top-[var(--site-header-h)] h-[calc(100vh_-_var(--site-header-h))] overflow-hidden flex flex-col gap-6"
    >
      <h2
        class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl shrink-0"
      >
        {{ heading }}
        <span class="block">{{ headingAccent }}</span>
      </h2>

      <div class="flex-1 min-h-0 flex flex-col gap-2.5">
        <HomeDirectionPair
          v-for="card in cards"
          :key="card.title"
          class="flex-1 min-h-0"
          :color-bg="COLOR_MAP[card.colorKey].colorBg"
          :image-src="card.imageSrc"
          :image-alt="card.imageAlt"
          :title="card.title"
          :subtitle="card.subtitle"
          :subtitle-class="COLOR_MAP[card.colorKey].subtitleClass"
          :description="card.description"
          :cta-label="card.ctaLabel"
          :cta-class="COLOR_MAP[card.colorKey].ctaClass"
          :cta-to="card.ctaTo"
          :colored-side="COLOR_MAP[card.colorKey].coloredSide"
          :scroll-progress="progress"
        />
      </div>
    </div>
  </section>
</template>
