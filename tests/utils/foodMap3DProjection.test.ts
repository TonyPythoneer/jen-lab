import { describe, it, expect } from "vite-plus/test";
import {
  computeBbox,
  makeProjector,
  tileXToLng,
  tileYToLat,
  makeTerrainProjector,
} from "~/utils/food-map/foodMap3DProjection";

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

describe("tile grid helpers", () => {
  it("tileXToLng maps tile 0 to -180 and the midpoint to 0", () => {
    expect(tileXToLng(0, 1)).toBeCloseTo(-180, 6);
    expect(tileXToLng(1, 1)).toBeCloseTo(0, 6);
  });
  it("tileYToLat maps the middle row to the equator and the top row above it", () => {
    expect(tileYToLat(1, 1)).toBeCloseTo(0, 6);
    expect(tileYToLat(0, 2)).toBeGreaterThan(0);
  });
});

describe("makeTerrainProjector", () => {
  // The baked Sydney grid (z14, 3 tiles wide x 5 tall).
  const grid = { z: 14, x0: 15072, x1: 15074, y0: 9829, y1: 9833 };
  const p = makeTerrainProjector(grid, 2000);

  it("scales the east-west span to targetUnits", () => {
    expect(p.mapW).toBeCloseTo(2000, 3);
  });
  it("is taller than wide for this north-south bbox", () => {
    expect(p.mapD).toBeGreaterThan(p.mapW);
  });
  it("centers the grid: the NW tile corner sits at (-mapW/2, -mapD/2)", () => {
    const nw = p.project(tileXToLng(grid.x0, grid.z), tileYToLat(grid.y0, grid.z));
    expect(nw.x).toBeCloseTo(-p.mapW / 2, 3);
    expect(nw.z).toBeCloseTo(-p.mapD / 2, 3);
  });
});
