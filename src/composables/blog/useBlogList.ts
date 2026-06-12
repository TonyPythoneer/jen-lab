import { csvToIds } from "~/utils/shared/csvToIds";

export interface BlogListInit {
  q?: unknown;
  cat?: unknown;
  tag?: unknown;
  page?: unknown;
}

// Pure blog-list state (filters + pagination); the consuming page owns fetch and URL sync.
export function useBlogList(init: BlogListInit) {
  // Filter state
  const search = ref(typeof init.q === "string" ? init.q : "");
  const searchInput = ref(search.value);
  const selectedCategoryIds = ref<number[]>(csvToIds(init.cat));
  const selectedTagIds = ref<number[]>(csvToIds(init.tag));

  const hasActiveFilters = computed(
    () =>
      !!search.value ||
      !!searchInput.value ||
      selectedCategoryIds.value.length > 0 ||
      selectedTagIds.value.length > 0,
  );

  const searchOpen = ref(
    !!search.value || selectedCategoryIds.value.length > 0 || selectedTagIds.value.length > 0,
  );

  function submitSearch() {
    search.value = searchInput.value;
  }

  function clearAllFilters() {
    searchInput.value = "";
    search.value = "";
    selectedCategoryIds.value = [];
    selectedTagIds.value = [];
  }

  // Pagination. scopeKey = filter set; a new scope resets to page 1.
  const currentPage = ref(Math.max(1, Number(init.page) || 1));
  const scopeKey = computed(
    () =>
      `${search.value}|${selectedCategoryIds.value.join(",")}|${selectedTagIds.value.join(",")}`,
  );
  const fullKey = computed(() => `wp-posts:${scopeKey.value}:${currentPage.value}`);

  watch(scopeKey, () => {
    currentPage.value = 1;
  });

  return {
    search,
    searchInput,
    selectedCategoryIds,
    selectedTagIds,
    hasActiveFilters,
    searchOpen,
    submitSearch,
    clearAllFilters,
    currentPage,
    scopeKey,
    fullKey,
  };
}
