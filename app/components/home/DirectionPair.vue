<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    colorBg: string;
    imageSrc: string;
    imageAlt: string;
    title: string;
    subtitle: string;
    subtitleClass: string;
    description: string;
    ctaLabel: string;
    ctaClass: string;
    ctaTo: string;
    coloredSide?: "left" | "right";
  }>(),
  {
    coloredSide: "left",
  },
);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5">
    <!-- Colored card: always on top on mobile; left or right on desktop via order -->
    <article
      :class="[
        'relative md:col-span-7 rounded-card overflow-hidden min-h-[360px] p-6',
        colorBg,
        coloredSide === 'right' ? 'order-1 md:order-2' : 'order-1',
      ]"
    >
      <img
        :src="imageSrc"
        :alt="imageAlt"
        loading="lazy"
        class="absolute inset-0 w-full h-full object-contain p-6"
      />
    </article>

    <!-- White card: always below colored card on mobile -->
    <article
      :class="[
        'md:col-span-5 bg-ash-white rounded-card p-8 md:p-10 flex flex-col justify-center items-center text-center gap-8 min-h-[360px]',
        coloredSide === 'right' ? 'order-2 md:order-1' : 'order-2',
      ]"
    >
      <div class="space-y-3">
        <h3
          class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
        >
          {{ title }}
          <span :class="['block', subtitleClass]">{{ subtitle }}</span>
        </h3>
        <p class="text-sm md:text-base text-abyssal-ink/75 leading-relaxed max-w-prose">
          {{ description }}
        </p>
      </div>

      <UButton
        color="neutral"
        size="md"
        :class="['text-white text-base font-medium transition-colors', ctaClass]"
        :ui="{ base: 'rounded-button px-8 py-3' }"
        :to="ctaTo"
        trailing-icon="i-lucide-arrow-right"
      >
        {{ ctaLabel }}
      </UButton>
    </article>
  </div>
</template>
