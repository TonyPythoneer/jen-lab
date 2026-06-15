// Real 3D landmark models (Opera House sails, Harbour Bridge arch), each cropped
// to the structure above its base — no platform, garden, or water — and dropped
// onto the terrain. targetSize = longest side in scene units; rotationY aligns
// each model to its real-world bearing.
export interface LandmarkModel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  url: string;
  /** longest horizontal dimension in scene units (the loader scales to this) */
  targetSize: number;
  /** yaw in radians, set to the model's real-world bearing */
  rotationY: number;
  /** Flatten the footprint into a level pad before seating — for models that
   *  rest ON the ground. Omit for span structures (a bridge) that cross water. */
  flattenPad?: boolean;
  /** CC-BY author — fill in from the model's download source before publishing */
  credit: string;
}

export const LANDMARK_MODELS: LandmarkModel[] = [
  {
    id: "opera-house",
    name: "Sydney Opera House",
    lat: -33.8568,
    lng: 151.2153,
    url: "/food-map-3d/models/opera-house.glb",
    targetSize: 55,
    rotationY: 1.361,
    flattenPad: true,
    credit: "",
  },
  {
    id: "harbour-bridge",
    name: "Sydney Harbour Bridge",
    lat: -33.8524,
    lng: 151.2102,
    url: "/food-map-3d/models/harbour-bridge.glb",
    targetSize: 285,
    rotationY: 1.065,
    credit: "",
  },
];
