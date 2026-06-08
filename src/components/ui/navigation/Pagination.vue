<template>
  <PaginationRoot
    as="nav"
    :page="page"
    :total="total"
    :items-per-page="itemsPerPage"
    :disabled="disabled"
    class="flex items-center gap-1"
    aria-label="Pagination"
    @update:page="$emit('update:page', $event)"
  >
    <!-- Prev (reka supplies the click + disabled-at-bound via as-child) -->
    <PaginationPrev as-child>
      <button
        type="button"
        class="inline-flex size-8 items-center justify-center rounded-button text-sm text-abyssal-ink/50 transition-colors hover:text-abyssal-ink disabled:pointer-events-none disabled:opacity-30"
      >
        <Icon name="i-lucide-chevron-left" class="size-4" />
      </button>
    </PaginationPrev>

    <!-- Page items: keep our own ±1 windowing; the sole caller supplies #item -->
    <template v-for="item in pageItems" :key="item.key">
      <PaginationListItem v-if="item.type === 'page'" :value="Number(item.value)" as-child>
        <slot name="item" :item="item" :page="page" />
      </PaginationListItem>
      <slot v-else name="item" :item="item" :page="page" />
    </template>

    <!-- Next -->
    <PaginationNext as-child>
      <button
        type="button"
        class="inline-flex size-8 items-center justify-center rounded-button text-sm text-abyssal-ink/50 transition-colors hover:text-abyssal-ink disabled:pointer-events-none disabled:opacity-30"
      >
        <Icon name="i-lucide-chevron-right" class="size-4" />
      </button>
    </PaginationNext>
  </PaginationRoot>
</template>

<script setup lang="ts">
import { PaginationRoot, PaginationPrev, PaginationNext, PaginationListItem } from "reka-ui";

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
