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

        <!-- Search input -->
        <div class="mb-8">
          <UInput
            v-model="q"
            :placeholder="PLACEHOLDER"
            autofocus
            class="text-lg"
            @keyup.enter="submit"
          />
        </div>

        <!-- Category filter -->
        <div class="mb-6">
          <BlogFilterButton
            v-model="selectedCategoryIds"
            label="分類"
            icon="i-lucide-folder"
            :items="categoryTree"
          />
        </div>

        <!-- Tag filter -->
        <div class="mb-8">
          <BlogFilterButton
            v-model="selectedTagIds"
            label="標籤"
            icon="i-lucide-tag"
            :items="tagTree"
          />
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
