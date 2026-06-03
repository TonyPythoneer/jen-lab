import type { EnrichedRestaurant } from "~/composables/useRestaurants";

// Module-level state — all food-map components share the same reactive object.
// Safe during SSR/prerender because: (1) all values are immutable defaults, and
// (2) mutations only happen via user interaction, which never fires server-side.
// If this composable is ever called outside <ClientOnly> in a new route, revisit.
const state = reactive({
  search: "",
  selectedCategoryId: null as string | null,
  selectedArea: null as string | null,
  selectedRestaurantId: null as string | null,
  hoveredCategoryId: null as string | null,
  // Google-style top-down list panel. Search-focus or a filter chip opens it.
  drawerOpen: false,
});

export function useFoodMapStore() {
  function openDrawer() {
    state.drawerOpen = true;
  }

  function closeDrawer() {
    state.drawerOpen = false;
  }

  // Chips are single-select toggles: clicking the active one clears it.
  function selectCategory(id: string | null) {
    state.selectedCategoryId = state.selectedCategoryId === id ? null : id;
    state.drawerOpen = true;
  }

  function selectArea(area: string | null) {
    state.selectedArea = state.selectedArea === area ? null : area;
    state.drawerOpen = true;
  }

  function selectRestaurant(id: string | null) {
    state.selectedRestaurantId = id;
    // Picking a place — from the list or a map popup — shows its detail, so the
    // drawer must be open for that detail to be visible.
    if (id) state.drawerOpen = true;
  }

  function setHovered(id: string | null) {
    state.hoveredCategoryId = id;
  }

  function reset() {
    state.search = "";
    state.selectedCategoryId = null;
    state.selectedArea = null;
    state.selectedRestaurantId = null;
    state.hoveredCategoryId = null;
    state.drawerOpen = false;
  }

  function getVisibleList(all: EnrichedRestaurant[]) {
    let list = all;
    if (state.selectedCategoryId)
      list = list.filter((r) => r.categoryId === state.selectedCategoryId);
    if (state.selectedArea) list = list.filter((r) => r.area === state.selectedArea);
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
    openDrawer,
    closeDrawer,
    selectCategory,
    selectArea,
    selectRestaurant,
    setHovered,
    reset,
    getVisibleList,
    getSelectedRestaurant,
  };
}
