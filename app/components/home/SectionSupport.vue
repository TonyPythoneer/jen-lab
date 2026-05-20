<script setup lang="ts">
const JEN_KNOWS_SUPPORT_URL = "https://portaly.cc/jenknowsau/support";
const JEN_LIU_SUPPORT_URL = "https://portaly.cc/jenliuau/support";
</script>

<template>
  <section class="py-[72px] sm:py-[140px]">
    <div class="bg-ash-white rounded-card p-8 md:p-16 text-center max-w-2xl mx-auto space-y-6">
      <UIcon
        name="fluent-emoji-high-contrast:bubble-tea"
        class="size-12 text-digital-orange mx-auto"
      />

      <h2
        class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-3xl md:text-4xl"
      >
        如果這些內容對你有幫助
      </h2>

      <p class="text-abyssal-ink/70 leading-relaxed">
        歡迎請我喝杯奶茶——完全隨意，你的閱讀本身就是最好的支持。
      </p>

      <div class="flex flex-wrap justify-center gap-3 pt-2">
        <UButton
          as="a"
          :href="JEN_KNOWS_SUPPORT_URL"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="outline"
          size="md"
          :ui="{ base: 'rounded-button' }"
          icon="fluent-emoji-high-contrast:bubble-tea"
        >
          支持 Jen Knows
        </UButton>
        <UButton
          as="a"
          :href="JEN_LIU_SUPPORT_URL"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="outline"
          size="md"
          :ui="{ base: 'rounded-button' }"
          icon="fluent-emoji-high-contrast:bubble-tea"
        >
          支持 Jen Liu
        </UButton>
      </div>
    </div>
  </section>
</template>
