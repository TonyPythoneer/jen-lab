// Bakes the real terrain for /sydney-food-map-3d: fetches DEM (AWS Terrarium,
// SRTM/USGS) + satellite imagery (EOX Sentinel-2 cloudless, CC BY 4.0) tiles for
// the restaurant bounding box into public/food-map-3d/. Run on demand to refresh:
//   pnpm gen:food-map-tiles
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const Z = 14; // Sentinel-2 native ~10m/px ≈ this zoom; higher just upsamples.
const PAD = 0.08; // pad the bbox so edge markers aren't flush to the terrain rim.

const here = fileURLToPath(new URL(".", import.meta.url));
const OUT = resolve(here, "../public/food-map-3d");
const UA = { "User-Agent": "jen-lab-foodmap3d-tilebake/1.0" };

const demUrl = (z: number, x: number, y: number) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
const imgUrl = (z: number, x: number, y: number) =>
  `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/${z}/${y}/${x}.jpg`;

const lngToTileX = (lng: number, z: number) => Math.floor(((lng + 180) / 360) * 2 ** z);
const latToTileY = (lat: number, z: number) =>
  Math.floor(((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z);

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
const total = (x1 - x0 + 1) * (y1 - y0 + 1) * 2;
console.log(
  `bbox lat ${minLat.toFixed(4)}..${maxLat.toFixed(4)} lng ${minLng.toFixed(4)}..${maxLng.toFixed(4)}`,
);
console.log(`z=${Z} tiles x:${x0}..${x1} y:${y0}..${y1} → ${total} tiles`);

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

let done = 0;
for (let x = x0; x <= x1; x++) {
  for (let y = y0; y <= y1; y++) {
    await fetchTile(demUrl(Z, x, y), `${OUT}/dem/${Z}_${x}_${y}.png`);
    await fetchTile(imgUrl(Z, x, y), `${OUT}/img/${Z}_${x}_${y}.jpg`);
    done += 2;
    process.stdout.write(`\r${done}/${total}`);
  }
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
      attribution:
        "Elevation: Terrarium DEM (SRTM, courtesy USGS). Imagery: Sentinel-2 cloudless 2023 by EOX IT Services GmbH — s2maps.eu, CC BY 4.0.",
    },
    null,
    2,
  ),
);
console.log(`\nbaked ${total} tiles + meta.json → ${OUT}`);
