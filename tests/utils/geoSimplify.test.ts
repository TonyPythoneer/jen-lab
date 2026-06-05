import { describe, it, expect } from "vite-plus/test";
import { simplifyRing, simplifyFeatureCollection } from "~/utils/food-map/geoSimplify";

type Position = [number, number];

function countPoints(fc: { features?: { geometry?: { coordinates: unknown } | null }[] }): number {
  let n = 0;
  const walk = (a: unknown): void => {
    if (Array.isArray(a)) {
      if (typeof a[0] === "number") n++;
      else a.forEach(walk);
    }
  };
  for (const f of fc.features ?? []) walk(f.geometry?.coordinates);
  return n;
}

describe("simplifyRing", () => {
  it("drops collinear points, keeping only the endpoints", () => {
    const line: Position[] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ];
    expect(simplifyRing(line, 0.0001)).toEqual([
      [0, 0],
      [3, 0],
    ]);
  });

  it("keeps a corner that sticks out beyond epsilon", () => {
    const line: Position[] = [
      [0, 0],
      [1, 1],
      [2, 0],
    ];
    expect(simplifyRing(line, 0.5)).toEqual([
      [0, 0],
      [1, 1],
      [2, 0],
    ]);
  });

  it("removes a wobble smaller than epsilon", () => {
    const line: Position[] = [
      [0, 0],
      [1, 0.0001],
      [2, 0],
    ];
    expect(simplifyRing(line, 0.01)).toEqual([
      [0, 0],
      [2, 0],
    ]);
  });

  it("returns short rings unchanged", () => {
    const line: Position[] = [
      [0, 0],
      [1, 1],
    ];
    expect(simplifyRing(line, 1)).toEqual(line);
  });
});

describe("simplifyFeatureCollection", () => {
  it("thins a polygon but keeps the ring closed", () => {
    // A square with a redundant midpoint on each edge.
    const fc = {
      features: [
        {
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [2, 0],
                [2, 2],
                [0, 2],
                [0, 0],
              ] as Position[],
            ],
          },
        },
      ],
    };
    simplifyFeatureCollection(fc, 0.0001);
    const ring = fc.features[0]!.geometry!.coordinates[0] as Position[];
    // The midpoint [1,0] is collinear and should be gone.
    expect(ring).not.toContainEqual([1, 0]);
    // First and last point must still match (closed ring).
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("reduces the total vertex count", () => {
    // A square whose edges carry many redundant collinear points. Simplifying
    // should collapse each edge back to its corners.
    const ring: Position[] = [];
    for (let i = 0; i <= 20; i++) ring.push([i / 10, 0]); // bottom edge 0→2
    for (let i = 1; i <= 20; i++) ring.push([2, i / 10]); // right edge
    for (let i = 1; i <= 20; i++) ring.push([2 - i / 10, 2]); // top edge
    for (let i = 1; i <= 20; i++) ring.push([0, 2 - i / 10]); // left edge back to 0,0
    const fc = { features: [{ geometry: { type: "Polygon", coordinates: [ring] } }] };
    const before = countPoints(fc);
    simplifyFeatureCollection(fc, 0.0001);
    const after = countPoints(fc);
    expect(after).toBeLessThan(before);
    expect(after).toBeLessThanOrEqual(6); // 4 corners + closing point
  });

  it("handles MultiPolygon geometry", () => {
    const square = (o: number): Position[] => [
      [o, o],
      [o + 1, o],
      [o + 2, o],
      [o + 2, o + 2],
      [o, o + 2],
      [o, o],
    ];
    const fc = {
      features: [{ geometry: { type: "MultiPolygon", coordinates: [[square(0)], [square(10)]] } }],
    };
    expect(() => simplifyFeatureCollection(fc, 0.0001)).not.toThrow();
    expect(countPoints(fc)).toBeGreaterThan(0);
  });
});
