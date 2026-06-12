import type { foodMap } from "#velite";

type Category = foodMap["categories"][number];
type Restaurant = foodMap["restaurants"][number];
export type { Category }; // single source of truth for the category object type
export type CategoryId = Category["id"];
export type RestaurantArea = Restaurant["area"];

export type EnrichedRestaurant = Restaurant & {
  categoryColor: string;
  categoryName: string;
};

// Dynamic import keeps the 44KB dataset in its own chunk, deliberately outside
// the static #velite path. Do NOT replace with a static import.
async function loadData() {
  const { categories, restaurants } = (await import("#food-map-data")).default as foodMap;

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const enrichedRestaurants: EnrichedRestaurant[] = restaurants.map((r) => {
    const c = categoryById.get(r.categoryId)!;
    return { ...r, categoryColor: c.color, categoryName: c.name };
  });
  const restaurantAreaSet = new Set<RestaurantArea>(restaurants.map((r) => r.area));

  return { categories, restaurantAreaSet, enrichedRestaurants };
}

export function useRestaurants() {
  const data = ref<Awaited<ReturnType<typeof loadData>> | null>(null);
  void loadData().then((d) => (data.value = d));

  // Filters — each independently nullable, all AND-combined.
  const selectedArea = ref<RestaurantArea | null>(null);
  const selectedCategoryId = ref<CategoryId | null>(null);
  const searchedName = ref("");
  const selectedRestaurantId = ref<string | null>(null);

  const isReady = computed(() => data.value !== null);
  const categories = computed(() => data.value?.categories ?? []);
  const restaurantAreaSet = computed(
    () => data.value?.restaurantAreaSet ?? new Set<RestaurantArea>(),
  );

  const filteredRestaurantList = computed<EnrichedRestaurant[]>(() => {
    const all = data.value?.enrichedRestaurants ?? [];
    const area = selectedArea.value;
    const categoryId = selectedCategoryId.value;
    const search = searchedName.value.trim().toLowerCase();
    return all.filter(
      (r) =>
        (!area || r.area === area) &&
        (!categoryId || r.categoryId === categoryId) &&
        (!search || r.name.toLowerCase().includes(search)),
    );
  });

  const selectedRestaurant = computed(
    () => filteredRestaurantList.value.find((r) => r.id === selectedRestaurantId.value) ?? null,
  );

  const clearFilters = () => {
    selectedArea.value = null;
    selectedCategoryId.value = null;
    searchedName.value = "";
  };

  return {
    selectedArea,
    selectedCategoryId,
    searchedName,
    selectedRestaurantId,
    isReady,
    categories,
    restaurantAreaSet,
    filteredRestaurantList,
    selectedRestaurant,
    clearFilters,
  };
}
