// Dependent filter maths for the food map: Region (`area`) and Cuisine
// (`categoryId`) are two single-select facets that constrain each other.
// Each facet's option counts are taken against the dataset filtered by the
// OTHER facet only, so the value you already picked never narrows its own list
// (it stays switchable). Options that reach zero are dropped from the count
// record, which is how the UI knows to hide / disable them — that is what makes
// impossible combinations impossible to select.

export interface RestaurantFacets {
  area: string;
  categoryId: string;
}

export interface FoodMapSelection {
  region: string | null;
  cuisine: string | null;
}

// AND-combine both facets. A null facet means "no constraint".
export function filterRestaurants<R extends RestaurantFacets>(
  restaurants: readonly R[],
  selection: FoodMapSelection,
): R[] {
  const { region, cuisine } = selection;
  return restaurants.filter(
    (r) => (!region || r.area === region) && (!cuisine || r.categoryId === cuisine),
  );
}

function tally(values: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
  return counts;
}

// How many restaurants each cuisine has within the selected region. Counts
// ignore the cuisine selection so picking a cuisine keeps the rest visible.
export function countByCuisine<R extends RestaurantFacets>(
  restaurants: readonly R[],
  selection: FoodMapSelection,
): Record<string, number> {
  const region = selection.region;
  return tally(restaurants.filter((r) => !region || r.area === region).map((r) => r.categoryId));
}

// How many restaurants each region has within the selected cuisine. Counts
// ignore the region selection so picking a region keeps the rest visible.
export function countByRegion<R extends RestaurantFacets>(
  restaurants: readonly R[],
  selection: FoodMapSelection,
): Record<string, number> {
  const cuisine = selection.cuisine;
  return tally(restaurants.filter((r) => !cuisine || r.categoryId === cuisine).map((r) => r.area));
}
