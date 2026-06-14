import * as THREE from "three";
import {
  makeTerrainProjector,
  tileXToLng,
  tileYToLat,
  type TileGrid,
  type ScenePoint,
} from "~/utils/food-map/foodMap3DProjection";

interface PatchMeta extends TileGrid {
  id: string;
  name: string;
}
interface TerrainMeta extends TileGrid {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  patches?: PatchMeta[];
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

// A flat, north-up textured plane (used for both the terrain texture mapping and
// the high-res landmark decals).
function gridUVs(geo: THREE.PlaneGeometry, w: number, d: number): void {
  const pos = geo.attributes.position!;
  const uv = geo.attributes.uv!;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + w / 2) / w;
    const v = (pos.getZ(i) + d / 2) / d;
    uv.setXY(i, u, 1 - v); // imagery north-up
  }
}

// Fade a patch canvas's outer border to transparent so a high-res decal blends
// into the low-res base instead of showing a hard rectangle.
function featherEdges(canvas: HTMLCanvasElement, marginFrac: number): void {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  const m = Math.min(W, H) * marginFrac;
  const mask = document.createElement("canvas");
  mask.width = W;
  mask.height = H;
  const mc = mask.getContext("2d")!;
  mc.fillStyle = "#fff";
  mc.fillRect(m, m, W - 2 * m, H - 2 * m);
  const edge = (gx0: number, gy0: number, gx1: number, gy1: number, rx: number, ry: number, rw: number, rh: number) => {
    const g = mc.createLinearGradient(gx0, gy0, gx1, gy1);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,1)");
    mc.fillStyle = g;
    mc.fillRect(rx, ry, rw, rh);
  };
  edge(0, 0, m, 0, 0, m, m, H - 2 * m); // left
  edge(W, 0, W - m, 0, W - m, m, m, H - 2 * m); // right
  edge(0, 0, 0, m, m, 0, W - 2 * m, m); // top
  edge(0, H, 0, H - m, m, H - m, W - 2 * m, m); // bottom
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

// Loads the baked DEM + imagery, decodes Terrarium elevation, builds a displaced
// satellite-textured terrain, and drapes high-res landmark decals over it.
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
  const dem = await compositeTiles(baseUrl, "dem", "png", meta, true);
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

  // displaced + textured terrain mesh
  const geo = new THREE.PlaneGeometry(proj.mapW, proj.mapD, segments, segments);
  geo.rotateX(-Math.PI / 2);
  gridUVs(geo, proj.mapW, proj.mapD);
  const pos = geo.attributes.position!;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + proj.mapW / 2) / proj.mapW;
    const v = (pos.getZ(i) + proj.mapD / 2) / proj.mapD;
    pos.setY(i, sampleHeightPx(u, v) * proj.m2u * vexag);
  }
  geo.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.96, metalness: 0 });
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = "terrain";

  // high-res landmark decals (drawn on top of the low-res base)
  const disposers: (() => void)[] = [
    () => {
      geo.dispose();
      tex.dispose();
      material.dispose();
    },
  ];
  for (const patch of meta.patches ?? []) {
    const canvas = await compositeTiles(baseUrl, `patch/${patch.id}`, "jpg", patch, false);
    featherEdges(canvas, 0.16);
    const westLng = tileXToLng(patch.x0, patch.z);
    const eastLng = tileXToLng(patch.x1 + 1, patch.z);
    const northLat = tileYToLat(patch.y0, patch.z);
    const southLat = tileYToLat(patch.y1 + 1, patch.z);
    const nw = proj.project(westLng, northLat);
    const se = proj.project(eastLng, southLat);
    const w = se.x - nw.x;
    const d = se.z - nw.z;
    const pgeo = new THREE.PlaneGeometry(w, d, 1, 1);
    pgeo.rotateX(-Math.PI / 2);
    gridUVs(pgeo, w, d);
    const ptex = new THREE.CanvasTexture(canvas);
    ptex.colorSpace = THREE.SRGBColorSpace;
    ptex.anisotropy = anisotropy;
    const pmat = new THREE.MeshStandardMaterial({
      map: ptex,
      color: new THREE.Color(1.35, 1.35, 1.35), // NSW aerial is darker than the Sentinel-2 base
      roughness: 0.9,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const pmesh = new THREE.Mesh(pgeo, pmat);
    const cyHeight = sampleHeight((westLng + eastLng) / 2, (northLat + southLat) / 2);
    pmesh.position.set((nw.x + se.x) / 2, cyHeight + 0.5, (nw.z + se.z) / 2);
    pmesh.name = `patch-${patch.id}`;
    mesh.add(pmesh);
    disposers.push(() => {
      pgeo.dispose();
      ptex.dispose();
      pmat.dispose();
    });
  }

  return {
    mesh,
    project: proj.project,
    sampleHeight,
    mapW: proj.mapW,
    mapD: proj.mapD,
    attribution: meta.attribution,
    dispose() {
      for (const d of disposers) d();
    },
  };
}
