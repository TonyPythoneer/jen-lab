import * as THREE from "three";
import type { BrandPalette } from "~/utils/food-map/brandPalette";

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  build: (palette: BrandPalette) => THREE.Object3D;
}

// A single white shell: an upper-quarter sphere standing up and leaning back.
function shell(w: number, h: number, d: number, lean: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI, 0, Math.PI / 2);
  geo.scale(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = lean;
  return mesh;
}

export function buildOperaHouse(palette: BrandPalette): THREE.Object3D {
  const g = new THREE.Group();
  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(135, 8, 84),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette["ash-white"]),
      roughness: 0.8,
    }),
  );
  podium.position.y = 4;
  g.add(podium);
  // Two rows of decreasing shells, each row leaning outward like the real sails.
  const sizes: [number, number, number][] = [
    [34, 56, 30],
    [27, 44, 25],
    [21, 33, 20],
    [14, 22, 14],
  ];
  for (const row of [
    { z: 15, lean: 0.5 },
    { z: -15, lean: -0.5 },
  ]) {
    sizes.forEach(([w, h, d], i) => {
      const s = shell(w, h, d, row.lean);
      s.position.set(-32 + i * 20, 8, row.z);
      g.add(s);
    });
  }
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
  {
    id: "opera-house",
    name: "Sydney Opera House",
    lat: -33.8568,
    lng: 151.2153,
    build: buildOperaHouse,
  },
  {
    id: "harbour-bridge",
    name: "Sydney Harbour Bridge",
    lat: -33.852,
    lng: 151.211,
    build: buildHarbourBridge,
  },
];
