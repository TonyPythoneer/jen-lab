<template>
  <ClientOnly>
    <form class="flex flex-wrap gap-2 mb-6" @submit.prevent="emit('submit')">
      <BlogFilterButton
        :model-value="selectedCategoryIds"
        label="分類"
        clear-label="清除分類"
        :items="categories"
        @update:model-value="emit('update:selectedCategoryIds', $event)"
        @change="emit('change')"
      />

      <BlogFilterButton
        :model-value="selectedTagIds"
        label="標籤"
        clear-label="清除標籤"
        :items="tags"
        @update:model-value="emit('update:selectedTagIds', $event)"
        @change="emit('change')"
      />

      <div class="flex gap-2 flex-1">
        <UInput
          :model-value="searchInput"
          placeholder="搜尋文章..."
          icon="i-lucide-search"
          class="flex-1"
          @update:model-value="emit('update:searchInput', $event)"
        />
        <UButton size="sm" type="submit">搜尋</UButton>
      </div>
    </form>
  </ClientOnly>
</template>

<script setup lang="ts">
interface FilterItem {
  wpId: number;
  name: string;
  parent?: number;
}

defineProps<{
  selectedCategoryIds: number[];
  selectedTagIds: number[];
  searchInput: string;
  categories: FilterItem[];
  tags: FilterItem[];
}>();

const emit = defineEmits<{
  "update:selectedCategoryIds": [value: number[]];
  "update:selectedTagIds": [value: number[]];
  "update:searchInput": [value: string];
  change: [];
  submit: [];
}>();
</script>
