<script setup lang="ts">
const appConfig = useAppConfig();

const communityDotField = {
  color: "var(--color-cyber-violet)",
  opacity: 0.22,
  spacing: 28,
  size: 1.5,
  style: {
    maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, black 30%, transparent 100%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, black 30%, transparent 100%)",
  },
};
</script>

<template>
  <section
    class="relative overflow-hidden py-[72px] sm:py-[140px] flex flex-col items-center gap-8"
  >
    <HomeBackgroundDots v-bind="communityDotField" />

    <h2
      class="relative z-10 font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-center text-5xl md:text-6xl lg:text-7xl"
    >
      Join The jen-lab<br />Community.
    </h2>

    <!-- Social links: real contacts from appConfig, no fake counts -->
    <div class="relative z-10 flex flex-wrap justify-center gap-3" aria-label="Social links">
      <a
        v-for="c in appConfig.contacts"
        :key="c.label"
        :href="c.url"
        :aria-label="c.label"
        target="_blank"
        rel="noopener"
        class="bg-ash-white rounded-card px-6 py-4 flex items-center gap-3 transition-colors hover:bg-digital-orange hover:text-pure-white group"
      >
        <UIcon
          :name="c.icon"
          class="size-5 text-digital-orange group-hover:text-pure-white transition-colors"
        />
        <span
          class="font-display tracking-[0.02em] text-xl text-abyssal-ink group-hover:text-pure-white transition-colors"
          >{{ c.label }}</span
        >
      </a>
    </div>
  </section>
</template>
