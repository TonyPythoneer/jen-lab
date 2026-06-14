import * as THREE from "three";
import type { BrandPalette } from "~/utils/food-map/brandPalette";

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  build: (palette: BrandPalette) => THREE.Object3D;
}

// A single white sail: a half-sphere stretched and tilted.
function sail(height: number, tilt: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(1, 24, 16, 0, Math.PI);
  geo.scale(20, height, 34);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2 + tilt;
  return mesh;
}

export function buildOperaHouse(palette: BrandPalette): THREE.Object3D {
  const g = new THREE.Group();
  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(120, 10, 70),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(palette["ash-white"]), roughness: 0.8 }),
  );
  podium.position.y = 5;
  g.add(podium);
  const heights = [70, 58, 44, 30];
  heights.forEach((h, i) => {
    const s = sail(h, 0.12 * i);
    s.position.set(-40 + i * 26, 10, 6 - i * 4);
    g.add(s);
  });
  // a small second cluster
  heights.slice(0, 2).forEach((h, i) => {
    const s = sail(h * 0.7, 0.18 + 0.1 * i);
    s.position.set(36 + i * 18, 10, -16);
    g.add(s);
  });
  g.name = "opera-house";
  return g;
}

export function buildHarbourBridge(palette: BrandPalette): THREE.Object3D {
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette["abyssal-ink"]),
    roughness: 0.7,
    metalness: 0.2,
  });
  // Arch: half torus across the span.
  const arch = new THREE.Mesh(new THREE.TorusGeometry(110, 6, 12, 48, Math.PI), steel);
  arch.position.y = 6;
  g.add(arch);
  // Deck: a long thin box at the base of the arch.
  const deck = new THREE.Mesh(new THREE.BoxGeometry(230, 5, 18), steel);
  deck.position.y = 24;
  g.add(deck);
  // Two pylons.
  for (const x of [-96, 96]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(12, 60, 24), steel);
    pylon.position.set(x, 30, 0);
    g.add(pylon);
  }
  g.name = "harbour-bridge";
  return g;
}

export const LANDMARKS: Landmark[] = [
  { id: "opera-house", name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, build: buildOperaHouse },
  { id: "harbour-bridge", name: "Sydney Harbour Bridge", lat: -33.852, lng: 151.211, build: buildHarbourBridge },
];
