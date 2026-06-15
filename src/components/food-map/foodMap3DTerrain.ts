import * as THREE from "three";
import {
  makeTerrainProjector,
  type TileGrid,
  type ScenePoint,
  type Bbox,
} from "~/utils/food-map/foodMap3DProjection";

interface TerrainMeta extends TileGrid {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  attribution: string;
}

export interface Terrain {
  mesh: THREE.Mesh;
  project(lng: number, lat: number): ScenePoint;
  /** world-Y of the terrain surface at lng/lat — markers sit on this */
  sampleHeight(lng: number, lat: number): number;
  /** Level the terrain within innerR into a pad (smooth skirt out to outerR) so a
   *  rigid model sits flush on the coarse DEM relief; returns the pad's world-Y. */
  flattenAround(cx: number, cz: number, innerR: number, outerR: number): number;
  mapW: number;
  mapD: number;
  attribution: string;
  dispose(): void;
}

const TILE = 256;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(`tile failed: ${src}`));
    im.src = src;
  });
}

async function compositeTiles(
  baseUrl: string,
  kind: string,
  ext: "png" | "jpg",
  grid: TileGrid,
  readback: boolean,
): Promise<HTMLCanvasElement> {
  const { z, x0, x1, y0, y1 } = grid;
  const canvas = document.createElement("canvas");
  canvas.width = (x1 - x0 + 1) * TILE;
  canvas.height = (y1 - y0 + 1) * TILE;
  const ctx = canvas.getContext("2d", { willReadFrequently: readback })!;
  const jobs: Promise<void>[] = [];
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      jobs.push(
        loadImage(`${baseUrl}/${kind}/${z}_${x}_${y}.${ext}`).then((im) =>
          ctx.drawImage(im, (x - x0) * TILE, (y - y0) * TILE),
        ),
      );
  await Promise.all(jobs);
  return canvas;
}

// Loads the baked DEM + imagery, decodes Terrarium elevation, and builds a
// displaced satellite-textured terrain. Landmarks are real 3D models placed by
// the scene; the terrain is just the textured ground they sit on.
export async function loadTerrain(
  baseUrl: string,
  targetUnits: number,
  vexag: number,
  segments: number,
  anisotropy: number,
  crop: Bbox,
): Promise<Terrain> {
  const meta = (await (await fetch(`${baseUrl}/meta.json`)).json()) as TerrainMeta;
  const proj = makeTerrainProjector(meta, targetUnits);

  // DEM → height field (Terrarium decode: (R*256 + G + B/256) - 32768 metres)
  const dem = await compositeTiles(baseUrl, "dem", "png", meta, true);
  const demW = dem.width;
  const demH = dem.height;
  const px = dem.getContext("2d")!.getImageData(0, 0, demW, demH).data;
  const height = new Float32Array(demW * demH);
  // Terrarium decode. A handful of NoData pixels decode to <-1000m and would
  // spike the mesh downward, so clamp those back to sea level (real min ≈ -13m).
  for (let i = 0; i < height.length; i++) {
    const j = i * 4;
    const metres = px[j]! * 256 + px[j + 1]! + px[j + 2]! / 256 - 32768;
    height[i] = metres < -50 ? 0 : metres;
  }
  const sampleHeightPx = (u: number, v: number): number => {
    const fx = Math.min(Math.max(u, 0), 1) * (demW - 1);
    const fy = Math.min(Math.max(v, 0), 1) * (demH - 1);
    const cx = Math.floor(fx);
    const cy = Math.floor(fy);
    const nx = Math.min(cx + 1, demW - 1);
    const ny = Math.min(cy + 1, demH - 1);
    const tx = fx - cx;
    const ty = fy - cy;
    const a = height[cy * demW + cx]!;
    const b = height[cy * demW + nx]!;
    const c = height[ny * demW + cx]!;
    const d = height[ny * demW + nx]!;
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
  const sampleHeight = (lng: number, lat: number): number => {
    const p = proj.project(lng, lat);
    const { u, v } = proj.worldToUV(p.x, p.z);
    return sampleHeightPx(u, v) * proj.m2u * vexag;
  };

  // imagery → texture
  const imgCanvas = await compositeTiles(baseUrl, "img", "jpg", meta, false);
  const tex = new THREE.CanvasTexture(imgCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;

  // Mesh cropped to the restaurant bbox + margin, not the full tile span (the
  // tiles reach well past the pins). Texture/DEM still cover all tiles, so each
  // cropped vertex's UV maps to its spot in the full composite.
  const nw = proj.project(crop.minLng, crop.maxLat);
  const se = proj.project(crop.maxLng, crop.minLat);
  const geo = new THREE.PlaneGeometry(se.x - nw.x, se.z - nw.z, segments, segments);
  geo.rotateX(-Math.PI / 2);
  geo.translate((nw.x + se.x) / 2, 0, (nw.z + se.z) / 2);
  const pos = geo.attributes.position!;
  const uv = geo.attributes.uv!;
  for (let i = 0; i < pos.count; i++) {
    const { u, v } = proj.worldToUV(pos.getX(i), pos.getZ(i));
    uv.setXY(i, u, 1 - v);
    pos.setY(i, sampleHeightPx(u, v) * proj.m2u * vexag);
  }
  geo.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.96, metalness: 0 });
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = "terrain";

  return {
    mesh,
    project: proj.project,
    sampleHeight,
    mapW: proj.mapW,
    mapD: proj.mapD,
    attribution: meta.attribution,
    flattenAround(cx, cz, innerR, outerR) {
      const within: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        if (Math.hypot(pos.getX(i) - cx, pos.getZ(i) - cz) <= innerR) within.push(pos.getY(i));
      }
      within.sort((a, b) => a - b);
      // Pad sits at the footprint's low ground (p20), below the DEM's spurious peak.
      const padY = within.length ? within[Math.floor(0.2 * (within.length - 1))]! : 0;
      for (let i = 0; i < pos.count; i++) {
        const d = Math.hypot(pos.getX(i) - cx, pos.getZ(i) - cz);
        if (d >= outerR) continue;
        let t = d <= innerR ? 0 : (d - innerR) / (outerR - innerR);
        t = t * t * (3 - 2 * t); // smoothstep skirt: flat pad → original relief
        pos.setY(i, padY * (1 - t) + pos.getY(i) * t);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      return padY;
    },
    dispose() {
      geo.dispose();
      tex.dispose();
      material.dispose();
    },
  };
}
