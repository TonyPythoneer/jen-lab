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
// The search modal lives in the global layout, so its wording is fetched here
// from content/site/blogs.yml. Shares the "site:blogs" fetch with the blog
// pages (same key, so Nuxt runs it once).
const { data: chrome } = useAsyncData("site:blogs", () => queryCollection("siteBlogs").first());
</script>
