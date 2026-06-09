<script setup lang="ts">
import { pagesLayout } from "#velite";

const COMPONENT_MAP: Record<string, ReturnType<typeof resolveComponent>> = {
  "section-hero": resolveComponent("HomeSectionHero"),
  "section-directions": resolveComponent("HomeSectionDirections"),
  "section-blog": resolveComponent("HomeSectionBlog3D"),
  "section-newsletter": resolveComponent("HomeSectionNewsletter"),
  "section-support": resolveComponent("HomeSectionSupport"),
};

// Synchronous Velite read, so the homepage SEO from content is baked into the
// prerendered HTML.
const page = computed(() => pagesLayout.find((r) => r.path === "/pages-layout/home"));

function sectionProps(section: { component: string; [key: string]: unknown }) {
  const { component, ...props } = section;
  return props;
}

useSeoMeta({
  title: () => page.value?.seo?.title,
  description: () => page.value?.seo?.description,
  ogTitle: () => page.value?.seo?.ogTitle,
  ogDescription: () => page.value?.seo?.ogDescription,
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
