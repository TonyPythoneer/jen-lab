<script setup lang="ts">
const JEN_KNOWS_URL = "/jen-knows";
const JEN_LIU_URL = "/jen-liu";

const pinWrapper = useTemplateRef<HTMLElement>("pinWrapper");
const { progress } = useScrollProgress(pinWrapper);
</script>

<template>
  <!-- Outer section is the scroll runway; inner div pins while runway scrolls past -->
  <section ref="pinWrapper" class="h-[250vh]">
    <div
      class="sticky top-[var(--site-header-h)] h-[calc(100vh_-_var(--site-header-h))] overflow-hidden space-y-8"
    >
      <h2
        class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl"
      >
        Jen is Jen.
        <span class="block">Jen is always me.</span>
      </h2>

      <div class="space-y-2.5">
        <HomeDirectionPair
          color-bg="bg-cyber-violet"
          image-src="/home/jen-knows-hero.webp"
          image-alt="Jen Knows — 榛知職涯身份"
          title="Jen Knows"
          subtitle="職涯 × 職場"
          subtitle-class="text-cyber-violet"
          description="陪你找到在澳洲的下一步——求職、職場文化、職涯諮詢，以中文深入講清楚。"
          cta-label="訪問 Jen Knows"
          cta-class="bg-cyber-violet hover:bg-cyber-violet/90"
          :cta-to="JEN_KNOWS_URL"
          colored-side="right"
          :scroll-progress="progress"
        />

        <HomeDirectionPair
          color-bg="bg-digital-orange"
          image-src="/home/jen-liu-hero.webp"
          image-alt="Jen Liu — 榛知旅遊身份"
          title="Jen Liu"
          subtitle="旅遊 × 美食"
          subtitle-class="text-digital-orange"
          description="雪梨在地視角，帶你探索澳洲旅遊、美食與自助旅行的大小事。"
          cta-label="訪問 Jen Liu"
          cta-class="bg-digital-orange hover:bg-digital-orange/90"
          :cta-to="JEN_LIU_URL"
          colored-side="left"
          :scroll-progress="progress"
        />
      </div>
    </div>
  </section>
</template>
