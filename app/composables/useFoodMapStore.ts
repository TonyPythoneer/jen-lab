import type { EnrichedRestaurant } from "~/composables/useRestaurants";

export type FoodMapTab = "food" | "area";

// Module-level state — all food-map components share the same reactive object.
// Safe during SSR/prerender because: (1) all values are immutable defaults, and
// (2) mutations only happen via user interaction, which never fires server-side.
// If this composable is ever called outside <ClientOnly> in a new route, revisit.
const state = reactive({
  tab: "food" as FoodMapTab,
  search: "",
  selectedCategoryId: null as string | null,
  selectedRestaurantId: null as string | null,
  hoveredCategoryId: null as string | null,
});

export function useFoodMapStore() {
  function setTab(t: FoodMapTab) {
    state.tab = t;
    state.selectedCategoryId = null;
  }

  function selectCategory(id: string | null) {
    state.selectedCategoryId = id;
  }

  function selectRestaurant(id: string | null) {
    state.selectedRestaurantId = id;
  }

  function setHovered(id: string | null) {
    state.hoveredCategoryId = id;
  }

  function reset() {
    state.tab = "food";
    state.search = "";
    state.selectedCategoryId = null;
    state.selectedRestaurantId = null;
    state.hoveredCategoryId = null;
  }

  function getVisibleList(all: EnrichedRestaurant[]) {
    let list = all;
    if (state.tab === "food" && state.selectedCategoryId)
      list = list.filter((r) => r.categoryId === state.selectedCategoryId);
    const q = state.search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q) ||
          (r.summary ?? "").toLowerCase().includes(q),
      );
    return list;
  }

  function getSelectedRestaurant(all: EnrichedRestaurant[]) {
    return all.find((r) => r.id === state.selectedRestaurantId) ?? null;
  }

  return {
    state,
    setTab,
    selectCategory,
    selectRestaurant,
    setHovered,
    reset,
    getVisibleList,
    getSelectedRestaurant,
  };
}
