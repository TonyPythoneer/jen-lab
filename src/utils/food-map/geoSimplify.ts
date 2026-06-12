// Douglas-Peucker simplification for GeoJSON outlines.
//
// WHY: the suburb-boundary GeoJSON has ~174k vertices — the dominant cost behind
// drag jank on a weak phone GPU. The outlines are faint hairlines, so most points
// can go with no visible change. Run once after the data loads.
//
// Coordinates are GeoJSON order: [lng, lat]. Epsilon is in degrees.

type Position = [number, number];

// Perpendicular distance from point p to the line through a→b, in coord units.
function perpDistance(p: Position, a: Position, b: Position): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) {
    const ex = p[0] - a[0];
    const ey = p[1] - a[1];
    return Math.sqrt(ex * ex + ey * ey);
  }
  // Distance = |cross product| / |a→b|.
  const cross = Math.abs(dx * (a[1] - p[1]) - (a[0] - p[0]) * dy);
  return cross / Math.sqrt(dx * dx + dy * dy);
}

// Classic Douglas-Peucker on a single ring/line of positions.
export function simplifyRing(points: Position[], epsilon: number): Position[] {
  if (points.length < 3) return points.slice();

  let maxDist = 0;
  let index = 0;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i]!, first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyRing(points.slice(0, index + 1), epsilon);
    const right = simplifyRing(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

// A polygon ring must stay closed and keep enough points to read as an area.
function simplifyClosedRing(ring: Position[], epsilon: number): Position[] {
  const simplified = simplifyRing(ring, epsilon);
  if (simplified.length < 4) return ring; // too degenerate — keep the original ring
  // Re-close if Douglas-Peucker dropped the duplicate closing vertex.
  const a = simplified[0]!;
  const b = simplified[simplified.length - 1]!;
  if (a[0] !== b[0] || a[1] !== b[1]) simplified.push([a[0], a[1]]);
  return simplified;
}

type AnyGeometry = {
  type: string;
  coordinates: unknown;
};

// Walk a geometry's coordinate nesting and simplify every ring/line in place.
function simplifyGeometry(geom: AnyGeometry, epsilon: number): void {
  switch (geom.type) {
    case "LineString":
      geom.coordinates = simplifyRing(geom.coordinates as Position[], epsilon);
      break;
    case "MultiLineString":
    case "Polygon":
      geom.coordinates = (geom.coordinates as Position[][]).map((ring) =>
        geom.type === "Polygon" ? simplifyClosedRing(ring, epsilon) : simplifyRing(ring, epsilon),
      );
      break;
    case "MultiPolygon":
      geom.coordinates = (geom.coordinates as Position[][][]).map((poly) =>
        poly.map((ring) => simplifyClosedRing(ring, epsilon)),
      );
      break;
    default:
      break; // Point / MultiPoint / GeometryCollection — nothing to simplify here
  }
}

interface FeatureLike {
  geometry?: AnyGeometry | null;
}
interface FeatureCollectionLike {
  features?: FeatureLike[];
}

// Simplify a FeatureCollection's geometry in place and return it.
export function simplifyFeatureCollection(
  fc: FeatureCollectionLike,
  epsilon: number,
): FeatureCollectionLike {
  for (const f of fc.features ?? []) {
    if (f.geometry) simplifyGeometry(f.geometry, epsilon);
  }
  return fc;
}
