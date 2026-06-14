// Bakes the terrain for /sydney-food-map-3d into public/food-map-3d/:
//  - base: DEM (AWS Terrarium, SRTM/USGS) + satellite imagery (EOX Sentinel-2
//    cloudless, CC BY 4.0) at z14 over the restaurant bbox.
//  - landmark patches: high-res NSW DCS aerial imagery (z18) over the Opera House
//    and Harbour Bridge, draped as crisp decals.
// Refresh: pnpm gen:food-map-tiles
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const Z = 14; // Sentinel-2 native ~10m/px ≈ this zoom; higher just upsamples.
const PATCH_Z = 18; // NSW aerial high-res for the landmarks.
const PAD = 0.08; // pad the base bbox so edge markers aren't flush to the rim.

const here = fileURLToPath(new URL(".", import.meta.url));
const OUT = resolve(here, "../public/food-map-3d");
const UA = { "User-Agent": "jen-lab-foodmap3d-tilebake/1.0" };

const demUrl = (z: number, x: number, y: number) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
const imgUrl = (z: number, x: number, y: number) =>
  `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/${z}/${y}/${x}.jpg`;
const nswUrl = (z: number, x: number, y: number) =>
  `https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Imagery/MapServer/tile/${z}/${y}/${x}`;

const lngToTileX = (lng: number, z: number) => Math.floor(((lng + 180) / 360) * 2 ** z);
const latToTileY = (lat: number, z: number) =>
  Math.floor(((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z);

// High-res landmark patches (lng/lat bbox, snapped to PATCH_Z tiles at runtime).
const LANDMARK_PATCHES = [
  { id: "opera-house", name: "Sydney Opera House", minLng: 151.2138, maxLng: 151.2166, minLat: -33.8585, maxLat: -33.8552 },
  { id: "harbour-bridge", name: "Sydney Harbour Bridge", minLng: 151.2092, maxLng: 151.2132, minLat: -33.8565, maxLat: -33.8497 },
];

async function fetchTile(url: string, out: string): Promise<void> {
  if (existsSync(out)) return;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, buf);
      return;
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${(e as Error).message}`);
    }
  }
}

// --- base bbox from the restaurant coordinates ---
const yml = parse(readFileSync(resolve(here, "../content/food-map/restaurants.yml"), "utf8")) as {
  restaurants: { coordinates: { lat: number; lng: number } }[];
};
let minLat = Infinity,
  maxLat = -Infinity,
  minLng = Infinity,
  maxLng = -Infinity;
for (const { coordinates: c } of yml.restaurants) {
  minLat = Math.min(minLat, c.lat);
  maxLat = Math.max(maxLat, c.lat);
  minLng = Math.min(minLng, c.lng);
  maxLng = Math.max(maxLng, c.lng);
}
const padLat = (maxLat - minLat) * PAD,
  padLng = (maxLng - minLng) * PAD;
minLat -= padLat;
maxLat += padLat;
minLng -= padLng;
maxLng += padLng;

const x0 = lngToTileX(minLng, Z),
  x1 = lngToTileX(maxLng, Z),
  y0 = latToTileY(maxLat, Z), // north has the smaller y
  y1 = latToTileY(minLat, Z);
console.log(`base z=${Z} tiles x:${x0}..${x1} y:${y0}..${y1} → ${(x1 - x0 + 1) * (y1 - y0 + 1) * 2} tiles`);

let done = 0;
for (let x = x0; x <= x1; x++) {
  for (let y = y0; y <= y1; y++) {
    await fetchTile(demUrl(Z, x, y), `${OUT}/dem/${Z}_${x}_${y}.png`);
    await fetchTile(imgUrl(Z, x, y), `${OUT}/img/${Z}_${x}_${y}.jpg`);
    done += 2;
    process.stdout.write(`\rbase ${done}`);
  }
}
process.stdout.write("\n");

// --- high-res landmark patches (NSW aerial) ---
const patches: { id: string; name: string; z: number; x0: number; x1: number; y0: number; y1: number }[] = [];
for (const lm of LANDMARK_PATCHES) {
  const px0 = lngToTileX(lm.minLng, PATCH_Z),
    px1 = lngToTileX(lm.maxLng, PATCH_Z),
    py0 = latToTileY(lm.maxLat, PATCH_Z),
    py1 = latToTileY(lm.minLat, PATCH_Z);
  const n = (px1 - px0 + 1) * (py1 - py0 + 1);
  console.log(`patch ${lm.id}: z=${PATCH_Z} ${px1 - px0 + 1}x${py1 - py0 + 1} = ${n} tiles`);
  for (let x = px0; x <= px1; x++)
    for (let y = py0; y <= py1; y++)
      await fetchTile(nswUrl(PATCH_Z, x, y), `${OUT}/patch/${lm.id}/${PATCH_Z}_${x}_${y}.jpg`);
  patches.push({ id: lm.id, name: lm.name, z: PATCH_Z, x0: px0, x1: px1, y0: py0, y1: py1 });
}

writeFileSync(
  `${OUT}/meta.json`,
  JSON.stringify(
    {
      z: Z,
      x0,
      x1,
      y0,
      y1,
      minLat,
      maxLat,
      minLng,
      maxLng,
      patches,
      attribution:
        "Terrain: Terrarium DEM (SRTM, USGS). City imagery: Sentinel-2 cloudless 2023, EOX — CC BY 4.0. Landmark imagery: © NSW Department of Customer Service (Spatial Services).",
    },
    null,
    2,
  ),
);
console.log(`done → ${OUT}`);
