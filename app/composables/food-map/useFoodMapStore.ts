import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { filterRestaurants } from "~/utils/food-map/foodMapFilters";

// Module-level state — all food-map components share the same reactive object.
// Safe during SSR/prerender because: (1) all values are immutable defaults, and
// (2) mutations only happen via user interaction, which never fires server-side.
// If this composable is ever called outside <ClientOnly> in a new route, revisit.
//
// Region (`selectedArea`) and Cuisine (`selectedCategoryId`) are two single-select
// facets that AND-combine and depend on each other (see foodMapFilters).
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

  // Single-select: re-clicking the active cuisine clears it.
  function selectCategory(id: string | null) {
    state.selectedCategoryId = id === null || state.selectedCategoryId === id ? null : id;
    state.drawerOpen = true;
  }

  function selectArea(area: string | null) {
    state.selectedArea = area === null || state.selectedArea === area ? null : area;
    state.drawerOpen = true;
  }

  function selectRestaurant(id: string | null) {
    state.selectedRestaurantId = id;
    // Picking a place — from the list or a map popup — shows its detail, so the
    // drawer must be open for that detail to be visible.
    if (id) state.drawerOpen = true;
  }

  function setHovered(id: string | null) {
    // The group hover-highlight is a desktop affordance. On mobile a tap fires
    // mouseover too, which would leave the group effect stuck, so skip it there.
    if (typeof window !== "undefined" && window.innerWidth <= 640) return;
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
    let list = filterRestaurants(all, {
      region: state.selectedArea,
      cuisine: state.selectedCategoryId,
    });
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
