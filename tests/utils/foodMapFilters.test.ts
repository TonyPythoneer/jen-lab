import { describe, it, expect } from "vite-plus/test";
import { filterRestaurants, countByRegion, countByCuisine } from "~/utils/foodMapFilters";

// Mirrors the spec's worked example: two regions, three cuisines.
type R = { id: string; area: string; categoryId: string };
const data: R[] = [
  { id: "A", area: "CBD", categoryId: "italian" },
  { id: "B", area: "CBD", categoryId: "japanese" },
  { id: "C", area: "Southbank", categoryId: "historical" },
  { id: "D", area: "Southbank", categoryId: "italian" },
];

describe("filterRestaurants", () => {
  it("returns everything when nothing is selected", () => {
    expect(filterRestaurants(data, { region: null, cuisine: null }).map((r) => r.id)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
  });

  it("filters by region only", () => {
    expect(filterRestaurants(data, { region: "CBD", cuisine: null }).map((r) => r.id)).toEqual([
      "A",
      "B",
    ]);
  });

  it("filters by cuisine only", () => {
    expect(filterRestaurants(data, { region: null, cuisine: "italian" }).map((r) => r.id)).toEqual([
      "A",
      "D",
    ]);
  });

  it("AND-combines region and cuisine", () => {
    expect(
      filterRestaurants(data, { region: "Southbank", cuisine: "italian" }).map((r) => r.id),
    ).toEqual(["D"]);
  });
});

describe("countByCuisine — depends on the selected region", () => {
  it("counts every cuisine when no region is selected", () => {
    expect(countByCuisine(data, { region: null, cuisine: null })).toEqual({
      italian: 2,
      japanese: 1,
      historical: 1,
    });
  });

  it("drops cuisines that have no restaurant in the selected region", () => {
    // CBD has only italian + japanese — historical disappears entirely.
    expect(countByCuisine(data, { region: "CBD", cuisine: null })).toEqual({
      italian: 1,
      japanese: 1,
    });
  });

  it("ignores its own cuisine selection so the cuisine stays switchable", () => {
    expect(countByCuisine(data, { region: "CBD", cuisine: "italian" })).toEqual({
      italian: 1,
      japanese: 1,
    });
  });
});

describe("countByRegion — depends on the selected cuisine", () => {
  it("counts every region when no cuisine is selected", () => {
    expect(countByRegion(data, { region: null, cuisine: null })).toEqual({
      CBD: 2,
      Southbank: 2,
    });
  });

  it("keeps only regions that contain the selected cuisine", () => {
    expect(countByRegion(data, { region: null, cuisine: "italian" })).toEqual({
      CBD: 1,
      Southbank: 1,
    });
    expect(countByRegion(data, { region: null, cuisine: "historical" })).toEqual({
      Southbank: 1,
    });
  });

  it("ignores its own region selection so the region stays switchable", () => {
    expect(countByRegion(data, { region: "CBD", cuisine: "italian" })).toEqual({
      CBD: 1,
      Southbank: 1,
    });
  });
});
