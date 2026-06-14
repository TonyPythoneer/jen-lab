import { describe, it, expect } from "vite-plus/test";
import { Object3D } from "three";
import { computeBbox, makeProjector } from "~/utils/food-map/foodMap3DProjection";
import { resolveBrandPalette } from "~/utils/food-map/brandPalette";
import { buildHarbour, HARBOUR_WATER } from "~/components/food-map/sydneyHarbour";

const palette = resolveBrandPalette(() => "#888888");
const projector = makeProjector(
  computeBbox([
    { lat: -33.8855, lng: 151.1925 },
    { lat: -33.832, lng: 151.2165 },
  ]),
  2000,
);

describe("buildHarbour", () => {
  it("builds a harbour mesh from the polygon without throwing", () => {
    expect(buildHarbour(projector, palette)).toBeInstanceOf(Object3D);
  });
  it("has a polygon of at least 4 points", () => {
    expect(HARBOUR_WATER.length).toBeGreaterThanOrEqual(4);
  });
});
