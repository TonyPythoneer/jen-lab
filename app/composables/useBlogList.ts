import { csvToIds } from "~/utils/csvToIds";
import type { WpPostsPage } from "~/utils/wpApi";

export interface BlogListInit {
  q?: unknown;
  cat?: unknown;
  tag?: unknown;
  page?: unknown;
}

/**
 * Pure blog-list state: filters, pagination, and the per-scope page cache.
 * No Nuxt-bound APIs — the consuming page owns `useLazyAsyncData` / URL sync
 * and feeds results back via `recordResult`. Keeps this unit-testable with
 * plain Vitest (see CLAUDE.md "When to extract a composable").
 */
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

  // Pagination + per-scope cache. scopeKey = filter set; a new scope wipes the cache.
  const currentPage = ref(Math.max(1, Number(init.page) || 1));
  const scopeKey = computed(
    () =>
      `${search.value}|${selectedCategoryIds.value.join(",")}|${selectedTagIds.value.join(",")}`,
  );
  const fullKey = computed(() => `wp-posts:${scopeKey.value}:${currentPage.value}`);

  const pageCache = ref(new Map<number, WpPostsPage>());
  const totalPages = ref(1);

  watch(scopeKey, () => {
    pageCache.value.clear();
    currentPage.value = 1;
    totalPages.value = 1;
  });

  function recordResult(result: WpPostsPage) {
    pageCache.value.set(currentPage.value, result);
    if (totalPages.value === 1) totalPages.value = result.totalPages;
  }

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
    pageCache,
    totalPages,
    recordResult,
  };
}
