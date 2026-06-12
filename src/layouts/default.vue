<template>
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <SiteHeader />

    <div class="flex-1 pt-[var(--site-header-h)] pb-[var(--section-gap)]">
      <RouterView />
    </div>

    <SiteFooter />

    <!-- Loads on first search open; searchMounted latches true afterwards so the
         close animation still plays. -->
    <BlogSearchModal
      v-if="searchMounted"
      :placeholder="chrome?.search.placeholder"
      :category-label="chrome?.search.categoryLabel"
      :tag-label="chrome?.search.tagLabel"
    />
  </div>
</template>

<script setup lang="ts">
import { useSiteBlogsChrome } from "~/composables/blog/useSiteBlogsChrome";
import { useBlogSearch } from "~/composables/blog/useBlogSearch";

// Lazy import keeps SearchModal (and reka-ui) out of the global page bundle.
const BlogSearchModal = defineAsyncComponent(() => import("~/components/blog/SearchModal.vue"));

// The search modal lives in the global layout, so its wording is fetched here.
const { data: chrome } = useSiteBlogsChrome();

// Mount the modal on first open, then keep it mounted.
const { open: searchOpen } = useBlogSearch();
const searchMounted = ref(false);
watch(searchOpen, (isOpen) => {
  if (isOpen) searchMounted.value = true;
});
</script>
