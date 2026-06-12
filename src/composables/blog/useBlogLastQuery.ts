import { ref } from "vue";

// The blog list's last filter query, so back-from-detail restores the same list.
// Module-level ref; SSG renders each route once, so no cross-request leak.
const lastQuery = ref<Record<string, string>>({});

export function useBlogLastQuery() {
  return lastQuery;
}
