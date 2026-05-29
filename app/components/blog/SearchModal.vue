<template>
  <USlideover v-model:open="open" side="top" :overlay="true" :transition="true" :dismissible="true">
    <template #header>
      <!-- Close button positioned top-right -->
    </template>

    <template #content="{ close }">
      <div class="w-full bg-pure-white p-6 md:p-8">
        <!-- Close button -->
        <div class="flex justify-end mb-6">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="關閉搜尋"
            @click="close"
            class="rounded-button"
          />
        </div>

        <!-- Search input: mockup style — large text, bottom underline, magnifier at the right -->
        <div class="relative mb-6">
          <input
            ref="searchInput"
            v-model="q"
            :placeholder="PLACEHOLDER"
            class="w-full border-0 bg-transparent py-3 pr-10 text-2xl font-medium text-abyssal-ink outline-none placeholder:text-abyssal-ink/40 md:text-3xl"
            @keyup.enter="submit"
          />
          <UIcon
            name="i-lucide-search"
            class="absolute right-0 top-1/2 size-6 -translate-y-1/2 text-abyssal-ink/60"
          />
          <div class="absolute inset-x-0 bottom-0 h-px bg-abyssal-ink" />
        </div>

        <!-- Filters: 分類 + 標籤 side by side, below the input -->
        <div class="mb-8 flex flex-wrap gap-3">
          <BlogFilterButton v-model="selectedCategoryIds" label="分類" :items="categoryTree" />
          <BlogFilterButton v-model="selectedTagIds" label="標籤" :items="tagTree" />
        </div>

        <!-- Submit button -->
        <UButton color="primary" variant="solid" class="w-full rounded-button" @click="submit">
          搜尋
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { buildBlogSearchRoute } from "~/utils/blogSearchQuery";

const PLACEHOLDER = "Type for blog search";

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
