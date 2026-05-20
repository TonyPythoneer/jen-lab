<script setup lang="ts">
const JEN_KNOWS_URL = "/jen-knows";
const JEN_LIU_URL = "/jen-liu";

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
    class="relative bg-ash-white rounded-card overflow-hidden min-h-screen flex flex-col justify-between"
  >
    <HomeBackgroundDots v-bind="heroDotField" />

    <HomeOperaHouseSvg
      aria-hidden="true"
      class="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[140%] opacity-15 pointer-events-none"
    />

    <div class="absolute top-6 left-6 hidden md:flex items-center gap-2">
      <span class="size-2 rounded-full bg-digital-orange animate-pulse" />
      <span class="text-xs uppercase tracking-widest text-abyssal-ink/70">Online</span>
    </div>

    <div
      class="relative z-10 px-6 md:px-12 pt-24 md:pt-28 pb-16 md:pb-20 max-w-[1100px] mx-auto text-center space-y-8"
    >
      <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button px-4 py-1.5' }">
        <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1.5" />
        Sydney · Career × Travel
      </UBadge>

      <h1
        ref="title"
        class="font-display tracking-[0.02em] leading-[0.88] text-abyssal-ink text-6xl sm:text-7xl md:text-8xl lg:text-[148px]"
      >
        Two Worlds.
        <span class="block text-digital-orange">One Jen.</span>
      </h1>

      <p class="text-base md:text-xl text-abyssal-ink/75 max-w-2xl mx-auto leading-relaxed">
        從澳洲職場到雪梨街頭——一個人，兩個身份，用中文記錄走過的每一步。
      </p>

      <div class="flex flex-wrap justify-center gap-2.5 pt-2">
        <UButton
          color="primary"
          size="xl"
          :ui="{ base: 'rounded-button px-8' }"
          :to="JEN_KNOWS_URL"
          trailing-icon="i-lucide-arrow-right"
        >
          探索 Jen Knows
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="xl"
          :ui="{ base: 'rounded-button px-8' }"
          :to="JEN_LIU_URL"
          trailing-icon="i-lucide-arrow-right"
        >
          探索 Jen Liu
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
          <span
            v-if="i < marqueeStrings.length - 1"
            class="size-1.5 rounded-full bg-cyber-violet"
          />
        </span>
      </UMarquee>
    </div>
  </section>
</template>
