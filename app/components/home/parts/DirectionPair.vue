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
    scrollProgress?: number;
  }>(),
  {
    coloredSide: "left",
    scrollProgress: 0,
  },
);

const EXIT_VW = 80;
const imageStyle = computed(() => {
  const dir = props.coloredSide === "right" ? 1 : -1;
  return { transform: `translateX(${dir * props.scrollProgress * EXIT_VW}vw)` };
});

// Mobile: white card slides in from the same side as its desktop position
// coloredSide="right" → white is on the left in desktop → slides in from left (-x)
// coloredSide="left"  → white is on the right in desktop → slides in from right (+x)
const isOpen = ref(false);
const panelHiddenClass = computed(() =>
  props.coloredSide === "right" ? "-translate-x-full" : "translate-x-full",
);
</script>

<template>
  <div class="h-full grid grid-cols-1 md:grid-cols-12 md:grid-rows-[1fr] gap-2.5">
    <!-- Colored card: always on top on mobile; left or right on desktop via order -->
    <article
      :class="[
        'relative md:col-span-7 rounded-card overflow-hidden min-h-[200px] md:min-h-0 p-6',
        colorBg,
        coloredSide === 'right' ? 'order-1 md:order-2' : 'order-1',
      ]"
    >
      <img
        :src="imageSrc"
        :alt="imageAlt"
        loading="lazy"
        :style="imageStyle"
        class="absolute inset-0 w-full h-full object-contain p-6 will-change-transform"
      />

      <!-- Mobile: open button — only shown when panel is closed -->
      <button
        v-if="!isOpen"
        class="md:hidden absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
        aria-label="查看詳情"
        @click="isOpen = true"
      >
        <AppIcon name="i-lucide-info" class="size-5" />
      </button>

      <!-- Mobile: white card panel slides over the colored card -->
      <div
        class="md:hidden absolute inset-0 rounded-card bg-ash-white flex flex-col justify-center items-center text-center gap-8 p-8 transition-transform duration-300 ease-in-out"
        :class="isOpen ? 'translate-x-0' : panelHiddenClass"
      >
        <!-- Close: Desktop: hidden; Mobile: top-right of the panel -->
        <button
          class="absolute top-3 right-3 w-9 h-9 rounded-full bg-abyssal-ink/10 flex items-center justify-center"
          aria-label="關閉"
          @click="isOpen = false"
        >
          <AppIcon name="i-lucide-x" class="size-5 text-abyssal-ink" />
        </button>

        <div class="space-y-3">
          <h3 class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl">
            {{ title }}
            <span :class="['block', subtitleClass]">{{ subtitle }}</span>
          </h3>
          <p class="text-sm text-abyssal-ink/75 leading-relaxed max-w-prose">
            {{ description }}
          </p>
        </div>

        <AppButton
          color="neutral"
          size="md"
          :class="['text-white text-base font-medium transition-colors', ctaClass]"
          :ui="{ base: 'rounded-button px-8 py-3' }"
          :to="ctaTo"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ ctaLabel }}
        </AppButton>
      </div>
    </article>

    <!-- White card: desktop only -->
    <article
      :class="[
        'hidden md:flex md:col-span-5 bg-ash-white rounded-card p-8 md:p-10 flex-col justify-center items-center text-center gap-8',
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

      <AppButton
        color="neutral"
        size="md"
        :class="['text-white text-base font-medium transition-colors', ctaClass]"
        :ui="{ base: 'rounded-button px-8 py-3' }"
        :to="ctaTo"
        trailing-icon="i-lucide-arrow-right"
      >
        {{ ctaLabel }}
      </AppButton>
    </article>
  </div>
</template>
