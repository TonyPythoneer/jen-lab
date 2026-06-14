export interface LngLat {
  lat: number;
  lng: number;
}
export interface Bbox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
export interface ScenePoint {
  x: number;
  z: number;
}
export interface Projector {
  bbox: Bbox;
  targetUnits: number;
  /** scene-unit extent east-west */
  width: number;
  /** scene-unit extent north-south */
  depth: number;
  project(lng: number, lat: number): ScenePoint;
}

const EARTH_RADIUS = 6378137; // Web-Mercator sphere radius, metres
const DEG = Math.PI / 180;

export function lngToMercatorX(lng: number): number {
  return EARTH_RADIUS * lng * DEG;
}
export function latToMercatorY(lat: number): number {
  return EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + (lat * DEG) / 2));
}

export function computeBbox(points: LngLat[]): Bbox {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}

// Centre the bbox at the origin and scale so its larger Mercator dimension
// equals targetUnits. North (higher latitude) maps to negative z (into screen).
export function makeProjector(bbox: Bbox, targetUnits: number): Projector {
  const x0 = lngToMercatorX(bbox.minLng);
  const x1 = lngToMercatorX(bbox.maxLng);
  const y0 = latToMercatorY(bbox.minLat);
  const y1 = latToMercatorY(bbox.maxLat);
  const mercW = Math.abs(x1 - x0);
  const mercH = Math.abs(y1 - y0);
  const scale = targetUnits / Math.max(mercW, mercH);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return {
    bbox,
    targetUnits,
    width: mercW * scale,
    depth: mercH * scale,
    project(lng, lat) {
      const mx = lngToMercatorX(lng);
      const my = latToMercatorY(lat);
      return { x: (mx - cx) * scale, z: (cy - my) * scale };
    },
  };
}
