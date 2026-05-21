<script setup lang="ts">
useSeoMeta({
  title: "榛知 — 職涯 × 旅遊，從雪梨出發",
  description: "榛知 Jen：澳洲職涯顧問 × 旅遊作家。兩個身份，一個在雪梨的真實故事。",
  ogTitle: "榛知 — 職涯 × 旅遊，從雪梨出發",
  ogDescription: "澳洲職涯顧問 × 旅遊作家。探索 Jen Knows 職場資源，或跟著 Jen Liu 走訪澳洲。",
  ogType: "website",
});
</script>

<template>
  <SitePageContainer breakout>
    <!-- Hero -->
    <HomeSectionHero />

    <!-- Directions: dual-identity intro cards -->
    <HomeSectionDirections />

    <!-- 3D rotating blog carousel (CSS preserve-3d, GPU spin) -->
    <HomeSectionBlog3DV2 :post-count="10" :spin-duration="90" />

    <!-- Subscribe -->
    <HomeSectionNewsletter />

    <!-- Support -->
    <HomeSectionSupport />
  </SitePageContainer>
</template>
