import * as THREE from "three";
import {
  makeTerrainProjector,
  type TileGrid,
  type ScenePoint,
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
  kind: "dem" | "img",
  ext: "png" | "jpg",
  meta: TerrainMeta,
): Promise<HTMLCanvasElement> {
  const { z, x0, x1, y0, y1 } = meta;
  const canvas = document.createElement("canvas");
  canvas.width = (x1 - x0 + 1) * TILE;
  canvas.height = (y1 - y0 + 1) * TILE;
  const ctx = canvas.getContext("2d", { willReadFrequently: kind === "dem" })!;
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
// displaced, satellite-textured terrain mesh aligned to the tile grid.
export async function loadTerrain(
  baseUrl: string,
  targetUnits: number,
  vexag: number,
  segments: number,
  anisotropy: number,
): Promise<Terrain> {
  const meta = (await (await fetch(`${baseUrl}/meta.json`)).json()) as TerrainMeta;
  const proj = makeTerrainProjector(meta, targetUnits);

  // DEM → height field (Terrarium decode: (R*256 + G + B/256) - 32768 metres)
  const dem = await compositeTiles(baseUrl, "dem", "png", meta);
  const demW = dem.width;
  const demH = dem.height;
  const px = dem.getContext("2d")!.getImageData(0, 0, demW, demH).data;
  const height = new Float32Array(demW * demH);
  for (let i = 0; i < height.length; i++) {
    const j = i * 4;
    height[i] = px[j]! * 256 + px[j + 1]! + px[j + 2]! / 256 - 32768;
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

  // imagery → texture
  const imgCanvas = await compositeTiles(baseUrl, "img", "jpg", meta);
  const tex = new THREE.CanvasTexture(imgCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;

  // displaced + textured terrain mesh
  const geo = new THREE.PlaneGeometry(proj.mapW, proj.mapD, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position!;
  const uv = geo.attributes.uv!;
  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i);
    const wz = pos.getZ(i);
    const u = (wx + proj.mapW / 2) / proj.mapW;
    const v = (wz + proj.mapD / 2) / proj.mapD; // 0 north → 1 south
    pos.setY(i, sampleHeightPx(u, v) * proj.m2u * vexag);
    uv.setXY(i, u, 1 - v); // imagery north-up
  }
  geo.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.96, metalness: 0 });
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = "terrain";

  const sampleHeight = (lng: number, lat: number): number => {
    const p = proj.project(lng, lat);
    const { u, v } = proj.worldToUV(p.x, p.z);
    return sampleHeightPx(u, v) * proj.m2u * vexag;
  };

  return {
    mesh,
    project: proj.project,
    sampleHeight,
    mapW: proj.mapW,
    mapD: proj.mapD,
    attribution: meta.attribution,
    dispose() {
      geo.dispose();
      tex.dispose();
      material.dispose();
    },
  };
}
