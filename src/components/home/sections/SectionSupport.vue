<script setup lang="ts">
type SupportBrand = "jen-liu" | "jen-knows";

interface SupportLink {
  brand: SupportBrand;
  label: string;
  url: string;
}

const SUPPORTS: readonly SupportLink[] = [
  { brand: "jen-knows", label: "支持 Jen Knows", url: "https://portaly.cc/jenknowsau/support" },
  { brand: "jen-liu", label: "支持 Jen Liu", url: "https://portaly.cc/jenliuau/support" },
];

const props = defineProps<{ brand?: SupportBrand }>();

// Show one brand's button, or all when no brand is given.
const visible = computed(() =>
  props.brand ? SUPPORTS.filter((s) => s.brand === props.brand) : SUPPORTS,
);
</script>

<template>
  <section class="">
    <div class="bg-ash-white rounded-card p-8 md:p-16 text-center max-w-2xl mx-auto space-y-6">
      <!-- CSS bubble tea -->
      <HomeBubbleTeaCss />

      <h2
        class="font-display tracking-[0.02em] leading-[0.94] text-abyssal-ink text-3xl md:text-4xl"
      >
        如果這些內容對你有幫助
      </h2>

      <p class="text-abyssal-ink/70 leading-relaxed">
        歡迎請我喝杯奶茶——完全隨意，你的閱讀本身就是最好的支持。
      </p>

      <div class="flex flex-wrap justify-center gap-3 pt-2">
        <Button
          v-for="s in visible"
          :key="s.brand"
          as="a"
          :href="s.url"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="outline"
          size="md"
          :ui="{ base: 'rounded-button' }"
          icon="fluent-emoji-high-contrast:bubble-tea"
        >
          {{ s.label }}
        </Button>
      </div>
    </div>
  </section>
</template>
