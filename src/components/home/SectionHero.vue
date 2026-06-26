<script setup lang="ts">
import { useScrollProgress } from "~/composables/shared/useScrollProgress";
// Copy comes from content/pages-layout/home.md (section-hero block). Defaults
// keep the component self-contained for Storybook and as a safe fallback.
withDefaults(
  defineProps<{
    headline?: string;
    headlineAccent?: string;
    subheadingLines?: string[];
    marqueeItems?: string[];
    portraitKnowsSrc?: string;
    portraitLiuSrc?: string;
  }>(),
  {
    headline: "Two Worlds",
    headlineAccent: "One Jen",
    subheadingLines: () => ["從澳洲職場到雪梨巷弄", "一個人，兩個身份", "用中文記錄走過的每一步"],
    marqueeItems: () => [
      "Sydney-based",
      "職涯 × 旅遊",
      "NextSteps Academy",
      "澳洲旅遊作家",
      "Walk Like A Local",
      "中英雙語創作",
      "Open for reading",
    ],
    portraitKnowsSrc: "/home/jen-knows.webp",
    portraitLiuSrc: "/home/jen-liu.webp",
  },
);

// #region Scroll-pinned exit animation
// useScrollProgress drives the portraits off-screen (knows → left, liu → right).
const pinWrapper = useTemplateRef<HTMLElement>("pinWrapper");
const { progress } = useScrollProgress(pinWrapper);

const EXIT_DISTANCE = 75; // vw each portrait travels — enough to clear the viewport edge

const knowsStyle = computed(() => ({
  transform: `translateX(${-progress.value * EXIT_DISTANCE}vw)`,
  opacity: 1 - progress.value,
}));
const liuStyle = computed(() => ({
  transform: `translateX(${progress.value * EXIT_DISTANCE}vw)`,
  opacity: 1 - progress.value,
}));
// #endregion
</script>

<template>
  <section ref="pinWrapper" class="relative h-[200vh]">
    <div
      class="sticky top-[var(--site-header-h)] h-[calc(100dvh_-_var(--site-header-h))] bg-sydney-sky rounded-card overflow-hidden flex flex-col"
    >
      <!-- Content area: Opera House fills only this flex-1 zone, not the marquee -->
      <div class="relative flex-1 overflow-hidden flex items-center justify-center">
        <HomeOperaHouseSvg
          aria-hidden="true"
          class="absolute inset-0 w-full h-full z-0 pointer-events-none"
        />

        <div
          class="relative z-10 px-6 md:px-12 max-w-[1100px] w-full text-center space-y-8 flex flex-col items-center"
        >
          <h1 class="font-display tracking-[0.02em] leading-[0.88] text-abyssal-ink text-7xl">
            {{ headline }}
            <span class="block text-digital-orange">{{ headlineAccent }}</span>
          </h1>

          <p
            class="text-base md:text-xl font-semibold text-abyssal-ink/85 max-w-2xl mx-auto leading-relaxed"
          >
            <template v-for="(line, i) in subheadingLines" :key="i"
              ><br v-if="i > 0" />{{ line }}</template
            >
          </p>

          <!-- Portraits: scroll-driven, knows exits left / liu exits right -->
          <div class="flex flex-row flex-nowrap items-center justify-center">
            <SharedPicture
              :src="portraitKnowsSrc"
              :style="knowsStyle"
              width="270"
              height="938"
              class="h-[180px] md:h-[252px] w-auto will-change-transform"
            />
            <SharedPicture
              :src="portraitLiuSrc"
              :style="liuStyle"
              width="317"
              height="938"
              class="h-[180px] md:h-[252px] w-auto will-change-transform"
            />
          </div>
        </div>
      </div>

      <!-- Marquee: outside Opera House scope, always at section bottom -->
      <div
        class="relative z-10 border-t border-abyssal-ink/10 bg-basalt-canvas/40 backdrop-blur-sm py-4"
      >
        <!-- CSS marquee: content doubled so -50% translate creates a seamless loop -->
        <div class="overflow-hidden">
          <div class="marquee-track">
            <span
              v-for="s in marqueeItems"
              :key="s"
              class="mx-6 inline-flex items-center gap-3 font-display text-3xl tracking-[0.02em] text-abyssal-ink/70"
              >{{ s }}</span
            >
            <span
              v-for="s in marqueeItems"
              :key="`d-${s}`"
              aria-hidden="true"
              class="mx-6 inline-flex items-center gap-3 font-display text-3xl tracking-[0.02em] text-abyssal-ink/70"
              >{{ s }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
