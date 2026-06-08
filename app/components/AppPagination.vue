<template>
  <nav class="flex items-center gap-1" aria-label="Pagination">
    <!-- Prev -->
    <button
      type="button"
      :disabled="disabled || page <= 1"
      class="inline-flex size-8 items-center justify-center rounded-button text-sm text-abyssal-ink/50 transition-colors hover:text-abyssal-ink disabled:pointer-events-none disabled:opacity-30"
      @click="$emit('update:page', page - 1)"
    >
      <AppIcon name="i-lucide-chevron-left" class="size-4" />
    </button>

    <!-- Page items via slot. No default body: the sole caller always supplies #item. -->
    <template v-for="item in pageItems" :key="item.key">
      <slot name="item" :item="item" :page="page" />
    </template>

    <!-- Next -->
    <button
      type="button"
      :disabled="disabled || page >= totalPages"
      class="inline-flex size-8 items-center justify-center rounded-button text-sm text-abyssal-ink/50 transition-colors hover:text-abyssal-ink disabled:pointer-events-none disabled:opacity-30"
      @click="$emit('update:page', page + 1)"
    >
      <AppIcon name="i-lucide-chevron-right" class="size-4" />
    </button>
  </nav>
</template>

<script setup lang="ts">
interface PaginationItem {
  key: string;
  type: "page" | "ellipsis";
  value: number | string;
}

const props = defineProps<{
  page: number;
  total: number;
  itemsPerPage: number;
  disabled?: boolean;
}>();

defineEmits<{ "update:page": [page: number] }>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.itemsPerPage)));

// Windowed page list: always show first/last, window of ±1 around current.
const pageItems = computed((): PaginationItem[] => {
  const cur = props.page;
  const max = totalPages.value;
  const items: PaginationItem[] = [];
  let last = 0;

  for (let p = 1; p <= max; p++) {
    const visible = p === 1 || p === max || Math.abs(p - cur) <= 1;
    if (!visible) continue;
    if (last && p - last > 1) items.push({ key: `ellipsis-${last}`, type: "ellipsis", value: "…" });
    items.push({ key: `page-${p}`, type: "page", value: p });
    last = p;
  }
  return items;
});
</script>
