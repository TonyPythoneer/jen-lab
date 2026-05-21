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

    <!-- New product spotlight -->
    <HomeSectionNewProduct />

    <!-- Blog carousel (full-bleed: carousel peeks beyond 1200px) -->
    <HomeSectionBlog class="full-bleed" />

    <!-- 3D rotating blog carousel: 6 cards with 12-card geometry for smooth arc -->
    <!-- <HomeSectionBlog3D :display-count="10" post-size="lg" :debug="true" />

    <!-- Blog3DV2: CSS scroll-driven infinite circular gallery (visual comparison) -->
    <HomeSectionBlog3DV2 :post-count="10" :spin-duration="120" />

    <!-- Subscribe -->
    <HomeSectionNewsletter />

    <!-- Support -->
    <HomeSectionSupport />
  </SitePageContainer>
</template>
