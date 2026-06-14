import * as THREE from "three";
import type { Projector } from "~/utils/food-map/foodMap3DProjection";
import type { BrandPalette } from "~/utils/food-map/brandPalette";

// Closed polygon (lng,lat) of the harbour water inside the restaurant bbox.
// Shoreline runs W->E with a dip at Circular Quay; top edge follows the bbox north.
export const HARBOUR_WATER: [number, number][] = [
  [151.1925, -33.8525],
  [151.2025, -33.8535],
  [151.209, -33.8565],
  [151.2135, -33.8575],
  [151.2153, -33.8568],
  [151.2165, -33.8552],
  [151.2165, -33.832],
  [151.1925, -33.832],
];

// Flat water mesh laid in the ground plane. ShapeGeometry is built in local XY;
// rotateX(-PI/2) maps it into world XZ (normal up) so world z = projector z.
export function buildHarbour(projector: Projector, palette: BrandPalette): THREE.Object3D {
  const shape = new THREE.Shape();
  HARBOUR_WATER.forEach(([lng, lat], i) => {
    const p = projector.project(lng, lat);
    if (i === 0) shape.moveTo(p.x, -p.z);
    else shape.lineTo(p.x, -p.z);
  });
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette["sydney-sky"]),
    roughness: 0.35,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 2; // sits above the land plane; pairs with camera near=10 to avoid z-fighting
  mesh.name = "harbour";
  return mesh;
}
