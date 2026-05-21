<script setup lang="ts">
const titleRef = useTemplateRef<HTMLHeadingElement>("title");
useTextReveal(titleRef);

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
</script>

<template>
  <section
    class="relative bg-ash-white rounded-card overflow-hidden min-h-[calc(100vh_-_var(--site-header-h))] flex flex-col"
  >
    <HomeBackgroundDots v-bind="heroDotField" />

    <HomeOperaHouseSvg
      aria-hidden="true"
      class="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[140%] opacity-15 pointer-events-none"
    />

    <div
      class="relative z-10 px-6 md:px-12 pt-10 md:pt-14 pb-16 md:pb-20 max-w-[1100px] w-full mx-auto text-center space-y-8 flex flex-1 flex-col justify-center items-center"
    >
      <h1
        ref="title"
        class="font-display tracking-[0.02em] leading-[0.88] text-abyssal-ink text-6xl sm:text-7xl md:text-8xl lg:text-[148px]"
      >
        Two Worlds
        <span class="block text-digital-orange">One Jen</span>
      </h1>

      <p
        class="text-base md:text-xl font-black text-abyssal-ink/85 max-w-2xl mx-auto leading-relaxed"
      >
        從澳洲職場到雪梨巷弄<br />一個人，兩個身份<br />用中文記錄走過的每一步
      </p>
    </div>

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
  </section>
</template>
