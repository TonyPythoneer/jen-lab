import { ref } from "vue";

// Module-level ref: one shared flag so the header icon and the global modal stay
// in sync. SSG renders each route once, so there is no cross-request leakage.
const open = ref(false);

export function useBlogSearch() {
  return {
    open,
    openSearch: () => {
      open.value = true;
    },
    closeSearch: () => {
      open.value = false;
    },
  };
}
