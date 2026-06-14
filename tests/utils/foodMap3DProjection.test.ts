import { describe, it, expect } from "vite-plus/test";
import { computeBbox, makeProjector } from "~/utils/food-map/foodMap3DProjection";

const pts = [
  { lat: -33.8855, lng: 151.1925 },
  { lat: -33.832, lng: 151.2165 },
  { lat: -33.86, lng: 151.205 },
];

describe("computeBbox", () => {
  it("returns the min/max of lat and lng", () => {
    expect(computeBbox(pts)).toEqual({
      minLat: -33.8855,
      maxLat: -33.832,
      minLng: 151.1925,
      maxLng: 151.2165,
    });
  });
});

describe("makeProjector", () => {
  const bbox = computeBbox(pts);
  const proj = makeProjector(bbox, 2000);

  it("scales the larger bbox dimension to targetUnits", () => {
    expect(Math.max(proj.width, proj.depth)).toBeCloseTo(2000, 3);
  });

  it("maps a more-northern point to a smaller (more negative) z", () => {
    const north = proj.project(151.205, -33.84);
    const south = proj.project(151.205, -33.88);
    expect(north.z).toBeLessThan(south.z);
  });

  it("maps a more-eastern point to a larger x", () => {
    const east = proj.project(151.215, -33.86);
    const west = proj.project(151.194, -33.86);
    expect(east.x).toBeGreaterThan(west.x);
  });
});
