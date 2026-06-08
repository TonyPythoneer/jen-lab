import { wpCategories, wpTags } from "#velite";

// Categories + tags from content collections (synced via `pnpm sync:wp`).
// Velite content is synchronous, so these are plain computeds — they now render
// into the prerendered /blogs HTML instead of filling in client-side.
export function useBlogTaxonomies() {
  const categories = computed(() => [...wpCategories].sort((a, b) => b.wpId - a.wpId));
  const tags = computed(() => [...wpTags].sort((a, b) => b.count - a.count || b.wpId - a.wpId));

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
