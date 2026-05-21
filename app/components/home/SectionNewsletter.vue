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
      class="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
    />
    <HomeBackgroundDots v-bind="newsletterDotField" />

    <div class="relative z-10 max-w-2xl mx-auto space-y-6">
      <h2
        class="font-display font-bold tracking-[0.02em] leading-tight text-pure-white text-3xl md:text-5xl"
      >
        這是一份邀請
        <span class="block text-digital-orange mt-2"> 走進個人<br />真實思考空間 </span>
      </h2>

      <h3
        class="font-sans font-normal tracking-wide text-pure-white/80 text-xl md:text-2xl leading-relaxed mt-6 md:mt-8"
      >
        <i>也寫給同樣正在努力向前的你</i>
      </h3>

      <!-- Animated envelope -->
      <HomeEnvelopeAnimation />

      <UButton
        as="a"
        class="mt-8 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
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
