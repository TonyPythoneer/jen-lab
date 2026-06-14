import { describe, it, expect } from "vite-plus/test";
import { fitDistanceForRadius, labelOpacity } from "~/utils/food-map/foodMap3DView";

describe("fitDistanceForRadius", () => {
  it("returns radius / sin(fov/2) — a 60deg fov over radius 100 => 200", () => {
    expect(fitDistanceForRadius(100, 60)).toBeCloseTo(200, 6);
  });
  it("needs more distance for a narrower fov", () => {
    expect(fitDistanceForRadius(100, 30)).toBeGreaterThan(fitDistanceForRadius(100, 60));
  });
});

describe("labelOpacity", () => {
  it("is fully opaque at/under near", () => {
    expect(labelOpacity(50, 100, 300)).toBe(1);
    expect(labelOpacity(100, 100, 300)).toBe(1);
  });
  it("is fully transparent at/over far", () => {
    expect(labelOpacity(300, 100, 300)).toBe(0);
    expect(labelOpacity(400, 100, 300)).toBe(0);
  });
  it("fades linearly between near and far", () => {
    expect(labelOpacity(200, 100, 300)).toBeCloseTo(0.5, 6);
  });
});
