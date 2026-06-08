<template>
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <SiteHeader />

    <div class="flex-1 pt-[var(--site-header-h)] pb-[var(--section-gap)]">
      <RouterView />
    </div>

    <SiteFooter />

    <BlogSearchModal
      :placeholder="chrome?.search.placeholder"
      :category-label="chrome?.search.categoryLabel"
      :tag-label="chrome?.search.tagLabel"
    />
  </div>
</template>

<script setup lang="ts">
import { useSiteBlogsChrome } from "~/composables/blog/useSiteBlogsChrome";

// The search modal lives in the global layout, so its wording is fetched here.
const { data: chrome } = useSiteBlogsChrome();
</script>
