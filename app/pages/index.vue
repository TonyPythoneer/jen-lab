<script setup lang="ts">
const COMPONENT_MAP: Record<string, ReturnType<typeof resolveComponent>> = {
  "section-hero": resolveComponent("HomeSectionHero"),
  "section-directions": resolveComponent("HomeSectionDirections"),
  "section-blog": resolveComponent("HomeSectionBlog3D"),
  "section-newsletter": resolveComponent("HomeSectionNewsletter"),
  "section-support": resolveComponent("HomeSectionSupport"),
};

const { data: page } = useLazyAsyncData("pages-layout:home", () =>
  queryCollection("pagesLayout").path("/pages-layout/home").first(),
);

function sectionProps(section: { component: string; [key: string]: unknown }) {
  const { component, ...props } = section;
  return props;
}

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
    <template v-if="page">
      <component
        v-for="section in page.sections"
        :key="section.component"
        :is="COMPONENT_MAP[section.component]"
        v-bind="sectionProps(section)"
      />
    </template>
  </SitePageContainer>
</template>
