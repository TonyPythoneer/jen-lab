import { ref } from "vue";

// Remembers the blog list's last filter query, so returning from a post detail
// lands back on the same filtered list. Module-level ref is shared across the
// list and detail pages; SSG renders each route once, so no cross-request leak.
const lastQuery = ref<Record<string, string>>({});

export function useBlogLastQuery() {
  return lastQuery;
}
