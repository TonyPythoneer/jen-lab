<script setup lang="ts">
const KIT_URL = "https://jen-nextsteps.kit.com/60463af80d";
const SUBSCRIBE_LABEL = "訂閱電子報";

const newsletterDotField = {
  color: "var(--color-pixel-glare)",
  opacity: 1,
  spacing: 32,
  size: 2,
  style: {
    maskImage:
      "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)",
  },
};
</script>

<template>
  <section
    class="relative bg-abyssal-ink rounded-card overflow-hidden p-8 md:p-16 text-center text-pure-white"
  >
    <HomeOperaHouseSvg
      aria-hidden="true"
      class="absolute -right-40 -top-20 w-[700px] opacity-15 pointer-events-none rotate-12"
    />
    <HomeBackgroundDots v-bind="newsletterDotField" />

    <div class="relative z-10 max-w-2xl mx-auto space-y-6">
      <div class="flex justify-center">
        <UBadge color="secondary" variant="solid" :ui="{ base: 'rounded-button px-4 py-1.5' }">
          <UIcon name="i-lucide-mail" class="size-3.5 mr-1.5" />
          每週電子報
        </UBadge>
      </div>

      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-pure-white text-4xl md:text-6xl"
      >
        職涯 × 旅遊
        <span class="block text-digital-orange">每週一封。</span>
      </h2>

      <p class="text-pure-white/75 leading-relaxed">
        收到榛知關於澳洲職場與旅遊的最新分享——一鍵到 Kit 完成訂閱，隨時可退訂。
      </p>

      <UButton
        as="a"
        :href="KIT_URL"
        target="_blank"
        rel="noopener"
        color="primary"
        size="xl"
        :ui="{ base: 'rounded-button px-8' }"
        trailing-icon="i-lucide-arrow-right"
      >
        {{ SUBSCRIBE_LABEL }}
      </UButton>
    </div>
  </section>
</template>
