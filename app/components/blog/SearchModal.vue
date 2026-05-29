<template>
  <USlideover
    v-model:open="open"
    side="top"
    :overlay="true"
    :transition="true"
    :dismissible="true"
    :ui="{ overlay: OVERLAY_CLASS }"
  >
    <template #content="{ close }">
      <div class="w-full bg-pure-white px-6 py-5 md:px-8">
        <!-- Top row: search input (underline + magnifier) and Close on one line -->
        <div class="flex items-center gap-4">
          <div class="relative flex-1">
            <input
              ref="searchInput"
              v-model="q"
              :placeholder="PLACEHOLDER"
              class="w-full border-0 bg-transparent py-2 pr-10 text-2xl font-medium text-abyssal-ink outline-none placeholder:text-abyssal-ink/40 md:text-3xl"
              @keyup.enter="submit"
            />
            <UIcon
              name="i-lucide-search"
              class="absolute right-0 top-1/2 size-6 -translate-y-1/2 text-abyssal-ink/60"
            />
            <div class="absolute inset-x-0 bottom-0 h-px bg-abyssal-ink" />
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="關閉搜尋"
            class="rounded-button shrink-0"
            @click="close"
          />
        </div>

        <!-- Filters: 分類 + 標籤 side by side, below the input. Enter in the input submits. -->
        <div class="mt-4 flex flex-wrap gap-3">
          <BlogFilterButton v-model="selectedCategoryIds" label="分類" :items="categoryTree" />
          <BlogFilterButton v-model="selectedTagIds" label="標籤" :items="tagTree" />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { buildBlogSearchRoute } from "~/utils/blogSearchQuery";

const PLACEHOLDER = "Type for blog search";
// The theme's default slideover overlay (bg-elevated) is transparent in this light-only
// palette, so set an explicit gray veil over the page behind the modal.
const OVERLAY_CLASS = "bg-abyssal-ink/40";

const { open, closeSearch } = useBlogSearch();
const { categoryTree, tagTree } = useBlogTaxonomies();

const q = ref("");
const selectedCategoryIds = ref<number[]>([]);
const selectedTagIds = ref<number[]>([]);

// Focus the input when the modal opens — native autofocus is unreliable for a slideover-mounted input.
const searchInput = ref<HTMLInputElement | null>(null);
watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  searchInput.value?.focus();
});

async function submit() {
  await navigateTo(
    buildBlogSearchRoute({
      q: q.value,
      categoryIds: selectedCategoryIds.value,
      tagIds: selectedTagIds.value,
    }),
  );
  closeSearch();
}
</script>
