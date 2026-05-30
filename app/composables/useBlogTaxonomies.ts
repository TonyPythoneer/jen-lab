// Categories + tags from content collections (synced via `pnpm sync:wp`).
// Client-only to keep them off the SSR/hydration critical path.
export function useBlogTaxonomies() {
  const cached = (key: string, app: ReturnType<typeof useNuxtApp>) =>
    app.payload.data[key] ?? app.static.data[key];

  const { data: categories } = useLazyAsyncData(
    "wp-categories",
    () => queryCollection("wpCategories").order("wpId", "DESC").all(),
    { server: false, getCachedData: cached },
  );
  const { data: tags } = useLazyAsyncData(
    "wp-tags",
    () => queryCollection("wpTags").order("count", "DESC").order("wpId", "DESC").all(),
    { server: false, getCachedData: cached },
  );

  const ready = computed(() => !!categories.value && !!tags.value);
  const categoryTree = computed(() =>
    (categories.value ?? []).map((c) => ({
      label: c.name,
      value: c.wpId,
      children: c.children?.map((ch) => ({ label: ch.name, value: ch.wpId })),
    })),
  );
  const tagTree = computed(() => (tags.value ?? []).map((t) => ({ label: t.name, value: t.wpId })));
  return { categories, tags, ready, categoryTree, tagTree };
}
