<script setup lang="ts">
const heroDotField = { opacity: 0.08, spacing: 28 };

const marqueeStrings = [
  "Sydney-based",
  "職涯 × 旅遊",
  "NextSteps Academy",
  "澳洲旅遊作家",
  "Walk Like A Local",
  "中英雙語創作",
  "Open for reading",
];

// #region Scroll-pinned exit animation
// Wrapper is taller than the viewport; the inner panel is `sticky`, so it pins
// while the extra runway scrolls past. useScrollProgress turns that runway into
// 0→1 progress; here we map it to drive the portraits off-screen (knows → left,
// liu → right) before the next section is allowed to scroll in.
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
      class="sticky top-[var(--site-header-h)] h-[calc(100vh_-_var(--site-header-h))] bg-[skyblue] rounded-card overflow-hidden flex flex-col"
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
            Two Worlds
            <span class="block text-digital-orange">One Jen</span>
          </h1>

          <p
            class="text-base md:text-xl font-black text-abyssal-ink/85 max-w-2xl mx-auto leading-relaxed"
          >
            從澳洲職場到雪梨巷弄<br />一個人，兩個身份<br />用中文記錄走過的每一步
          </p>

          <!-- Portraits: scroll-driven, knows exits left / liu exits right -->
          <div class="flex flex-row flex-nowrap items-center justify-center">
            <img
              src="/home/jen-knows.png"
              :style="knowsStyle"
              class="h-[252px] w-auto will-change-transform"
            />
            <img
              src="/home/jen-liu.png"
              :style="liuStyle"
              class="h-[252px] w-auto will-change-transform"
            />
          </div>
        </div>
      </div>

      <!-- Marquee: outside Opera House scope, always at section bottom -->
      <div
        class="relative z-10 border-t border-abyssal-ink/10 bg-basalt-canvas/40 backdrop-blur-sm py-4"
      >
        <UMarquee>
          <span
            v-for="(s, i) in marqueeStrings"
            :key="s"
            class="mx-6 inline-flex items-center gap-3 font-display text-3xl tracking-[0.02em] text-abyssal-ink/70"
          >
            {{ s }}
          </span>
        </UMarquee>
      </div>
    </div>
  </section>
</template>
