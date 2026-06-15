import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { fitDistanceForRadius, labelOpacity } from "~/utils/food-map/foodMap3DView";
import { readCssVarsFromDocument, type BrandPalette } from "~/utils/food-map/brandPalette";
import { computeBbox, type Bbox } from "~/utils/food-map/foodMap3DProjection";
import { loadTerrain, type Terrain } from "./foodMap3DTerrain";
import { LANDMARK_MODELS, type LandmarkModel } from "./landmarks";

// Dispose a material and any textures it references (GLTF models bring their own).
function disposeMaterial(mat: THREE.Material): void {
  for (const value of Object.values(mat)) {
    if (value instanceof THREE.Texture) value.dispose();
  }
  mat.dispose();
}

// Grow a lng/lat bbox by a fraction of its span on every side.
function expandBbox(b: Bbox, frac: number): Bbox {
  const dLat = (b.maxLat - b.minLat) * frac;
  const dLng = (b.maxLng - b.minLng) * frac;
  return {
    minLat: b.minLat - dLat,
    maxLat: b.maxLat + dLat,
    minLng: b.minLng - dLng,
    maxLng: b.maxLng + dLng,
  };
}

const TARGET_UNITS = 2000;
const FOV = 50;
const VEXAG = 3; // Sydney is flat; lift the slight relief so it reads in 3D.
const TERRAIN_SEG = 256;
const PIN_HEIGHT = 26;
const TILES_BASE = "/food-map-3d";
// Grow the terrain past the restaurant bbox so pins don't sit on the edge.
const CROP_MARGIN = 0.12;

interface Marker {
  id: string;
  group: THREE.Group;
  head: THREE.Mesh;
  label: CSS2DObject;
  baseColor: THREE.Color;
}

export class FoodMap3DScene {
  private container: HTMLElement;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private labelRenderer: CSS2DRenderer;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private palette: BrandPalette;
  private worldGroup = new THREE.Group();
  private markers: Marker[] = [];
  private landmarks: THREE.Group[] = [];
  private gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  private terrain: Terrain | null = null;
  private selectedId: string | null = null;
  private hoveredId: string | null = null;
  private selectCb: ((id: string | null) => void) | null = null;
  private hoverCb: ((id: string | null) => void) | null = null;
  private raf = 0;
  private disposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.palette = readCssVarsFromDocument();
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;

    // near=10 (not 1): a tiny near plane wrecks depth precision at this distance.
    this.camera = new THREE.PerspectiveCamera(FOV, w / h, 10, 60000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(new THREE.Color(this.palette["basalt-canvas"]));
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(w, h);
    const ld = this.labelRenderer.domElement;
    ld.style.position = "absolute";
    ld.style.top = "0";
    ld.style.left = "0";
    ld.style.pointerEvents = "none";
    container.appendChild(ld);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(15);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8d99a6, 1.05));
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.0);
    sun.position.set(-1, 1.6, 0.8);
    this.scene.add(sun);
    this.scene.add(this.worldGroup);

    this.renderer.domElement.addEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.addEventListener("click", this.onClick);

    this.loop();

    if (import.meta.env.DEV) (globalThis as Record<string, unknown>).__fm3dScene = this;
  }

  onSelect(cb: (id: string | null) => void): void {
    this.selectCb = cb;
  }
  onHover(cb: (id: string | null) => void): void {
    this.hoverCb = cb;
  }

  async setData(restaurants: EnrichedRestaurant[]): Promise<void> {
    this.clearWorld();
    const crop = expandBbox(computeBbox(restaurants.map((r) => r.coordinates)), CROP_MARGIN);
    const terrain = await loadTerrain(
      TILES_BASE,
      TARGET_UNITS,
      VEXAG,
      TERRAIN_SEG,
      this.renderer.capabilities.getMaxAnisotropy(),
      crop,
    );
    if (this.disposed) {
      terrain.dispose();
      return;
    }
    this.terrain = terrain;
    this.worldGroup.add(terrain.mesh);
    for (const r of restaurants) this.addMarker(r, terrain);
    this.frameCamera(restaurants, terrain);
    void this.loadLandmarks(terrain);
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
    this.applyMarkerStates();
  }

  resize(): void {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.renderer.domElement.removeEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.removeEventListener("click", this.onClick);
    this.clearWorld();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labelRenderer.domElement.remove();
  }

  // --- internals ---

  private addMarker(r: EnrichedRestaurant, terrain: Terrain): void {
    const { x, z } = terrain.project(r.coordinates.lng, r.coordinates.lat);
    const y = terrain.sampleHeight(r.coordinates.lng, r.coordinates.lat);
    const baseColor = new THREE.Color(r.categoryColor);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, PIN_HEIGHT, 8),
      new THREE.MeshStandardMaterial({
        color: baseColor.clone().multiplyScalar(0.7),
        roughness: 0.5,
      }),
    );
    stem.position.y = PIN_HEIGHT / 2;
    group.add(stem);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(6, 18, 14),
      new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.35 }),
    );
    head.position.y = PIN_HEIGHT + 3;
    head.userData.markerId = r.id;
    group.add(head);

    const div = document.createElement("div");
    div.className = "fm3d-label";
    div.textContent = r.name;
    const label = new CSS2DObject(div);
    label.position.set(0, PIN_HEIGHT + 14, 0);
    label.center.set(0.5, 1);
    group.add(label);

    this.worldGroup.add(group);
    this.markers.push({ id: r.id, group, head, label, baseColor });
  }

  private async loadLandmarks(terrain: Terrain): Promise<void> {
    await Promise.all(
      LANDMARK_MODELS.map((m) =>
        this.loadLandmark(m, terrain).catch((e) => console.error(`landmark ${m.id} failed`, e)),
      ),
    );
  }

  // Drop one .glb on the terrain: scaled so its longest side spans targetSize,
  // re-origined to its footprint centre + base so it sits flush and rotates in place.
  private async loadLandmark(model: LandmarkModel, terrain: Terrain): Promise<void> {
    const gltf = await this.gltfLoader.loadAsync(model.url);
    if (this.disposed) return;
    const obj = gltf.scene;
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    obj.position.set(-center.x, -box.min.y, -center.z);

    const group = new THREE.Group();
    group.add(obj);
    const scale = model.targetSize / Math.max(size.x, size.z);
    group.scale.setScalar(scale);
    group.rotation.y = model.rotationY;
    const { x, z } = terrain.project(model.lng, model.lat);
    group.position.set(x, this.seatLandmark(model, terrain, x, z, size, scale), z);
    group.name = `landmark-${model.id}`;

    this.worldGroup.add(group);
    this.landmarks.push(group);
  }

  // Seat a landmark on the terrain. Pad-seated models (opera) flatten their
  // footprint to a level pad — the coarse DEM relief would float or bury a rigid
  // model; span structures (bridge) rest on the mesh surface as-is.
  private seatLandmark(
    model: LandmarkModel,
    terrain: Terrain,
    x: number,
    z: number,
    size: THREE.Vector3,
    scale: number,
  ): number {
    if (model.flattenPad) {
      const r = 0.5 * Math.hypot(size.x * scale, size.z * scale);
      return terrain.flattenAround(x, z, r, r * 2.5);
    }
    terrain.mesh.updateMatrixWorld();
    this.raycaster.ray.origin.set(x, 1e4, z);
    this.raycaster.ray.direction.set(0, -1, 0);
    const hit = this.raycaster.intersectObject(terrain.mesh, false)[0];
    return hit ? hit.point.y : terrain.sampleHeight(model.lng, model.lat);
  }

  // Frame the camera to the restaurant area (terrain extends beyond for context).
  private frameCamera(restaurants: EnrichedRestaurant[], terrain: Terrain): void {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const r of restaurants) {
      const { x, z } = terrain.project(r.coordinates.lng, r.coordinates.lat);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    // The crop already pads the terrain edges, so skip the extra fit margin and
    // pull the default camera in tight on the restaurant cluster.
    const radius = 0.5 * Math.hypot(maxX - minX, maxZ - minZ);
    const dist = fitDistanceForRadius(radius, FOV);
    this.camera.position.set(cx, dist * 0.7, cz + dist * 0.7);
    this.controls.target.set(cx, 0, cz);
    this.controls.minDistance = dist * 0.2;
    this.controls.maxDistance = dist * 2.4;
    this.controls.update();
  }

  private applyMarkerStates(): void {
    for (const m of this.markers) {
      const active = m.id === this.selectedId || m.id === this.hoveredId;
      const mat = m.head.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(active ? m.baseColor : new THREE.Color(0x000000));
      m.head.scale.setScalar(active ? 1.6 : 1);
    }
  }

  private updateLabelOpacity(): void {
    const camDist = this.camera.position.distanceTo(this.controls.target);
    // Hidden when zoomed out (77 names would overlap), fade in on zoom.
    const base = labelOpacity(camDist, TARGET_UNITS * 0.45, TARGET_UNITS * 1.0);
    for (const m of this.markers) {
      const active = m.id === this.selectedId || m.id === this.hoveredId;
      (m.label.element as HTMLElement).style.opacity = String(active ? 1 : base);
    }
  }

  private pick(): string | null {
    if (!this.terrain) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const heads = this.markers.map((m) => m.head);
    const hit = this.raycaster.intersectObjects(heads, false)[0];
    return (hit?.object.userData.markerId as string | undefined) ?? null;
  }

  private onPointerMove = (e: PointerEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const id = this.pick();
    if (id !== this.hoveredId) {
      this.hoveredId = id;
      this.applyMarkerStates();
      this.hoverCb?.(id);
      this.renderer.domElement.style.cursor = id ? "pointer" : "grab";
    }
  };

  private onClick = (): void => {
    const id = this.pick();
    this.selectedId = id;
    this.applyMarkerStates();
    this.selectCb?.(id);
  };

  private clearWorld(): void {
    this.terrain?.dispose();
    this.terrain = null;
    this.markers = [];
    this.landmarks = [];
    for (let i = this.worldGroup.children.length - 1; i >= 0; i--) {
      const child = this.worldGroup.children[i]!;
      this.worldGroup.remove(child);
      child.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach(disposeMaterial);
        else if (m) disposeMaterial(m);
      });
    }
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    this.controls.update();
    this.updateLabelOpacity();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };
}
