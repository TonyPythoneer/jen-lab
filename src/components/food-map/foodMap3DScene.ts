import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { computeBbox, makeProjector, type Projector } from "~/utils/food-map/foodMap3DProjection";
import { fitDistanceForRadius, labelOpacity } from "~/utils/food-map/foodMap3DView";
import { readCssVarsFromDocument, type BrandPalette } from "~/utils/food-map/brandPalette";
import { LANDMARKS } from "./landmarks";
import { buildHarbour } from "./sydneyHarbour";

const TARGET_UNITS = 2000;
const FOV = 50;
const PIN_HEIGHT = 34;

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
  private projector: Projector | null = null;
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

    // near=10 (not 1): a tiny near plane wrecks depth precision at this distance,
    // making the water and land z-fight.
    this.camera = new THREE.PerspectiveCamera(FOV, w / h, 10, 40000);

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
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(18);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa0a6, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(-1, 2, 1.2);
    this.scene.add(sun);
    this.scene.add(this.worldGroup);

    this.renderer.domElement.addEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.addEventListener("click", this.onClick);

    this.loop();
  }

  onSelect(cb: (id: string | null) => void): void {
    this.selectCb = cb;
  }
  onHover(cb: (id: string | null) => void): void {
    this.hoverCb = cb;
  }

  setData(restaurants: EnrichedRestaurant[]): void {
    this.clearWorld();
    const pts = restaurants.map((r) => ({ lat: r.coordinates.lat, lng: r.coordinates.lng }));
    for (const l of LANDMARKS) pts.push({ lat: l.lat, lng: l.lng });
    const projector = makeProjector(computeBbox(pts), TARGET_UNITS);
    this.projector = projector;

    this.worldGroup.add(this.buildLand());
    this.worldGroup.add(buildHarbour(projector, this.palette));
    for (const l of LANDMARKS) {
      const g = l.build(this.palette);
      const p = projector.project(l.lng, l.lat);
      g.position.set(p.x, 0, p.z);
      this.worldGroup.add(g);
    }
    for (const r of restaurants) this.addMarker(r, projector);

    this.frameCamera(projector);
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

  private buildLand(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(TARGET_UNITS * 8, TARGET_UNITS * 8);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.palette["basalt-canvas"]),
      roughness: 0.95,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "land";
    return mesh;
  }

  private addMarker(r: EnrichedRestaurant, projector: Projector): void {
    const p = projector.project(r.coordinates.lng, r.coordinates.lat);
    const baseColor = new THREE.Color(r.categoryColor);
    const group = new THREE.Group();
    group.position.set(p.x, 0, p.z);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, PIN_HEIGHT, 8),
      new THREE.MeshStandardMaterial({
        color: baseColor.clone().multiplyScalar(0.7),
        roughness: 0.6,
      }),
    );
    stem.position.y = PIN_HEIGHT / 2;
    group.add(stem);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(8, 18, 14),
      new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.4 }),
    );
    head.position.y = PIN_HEIGHT + 4;
    head.userData.markerId = r.id;
    group.add(head);

    const div = document.createElement("div");
    div.className = "fm3d-label";
    div.textContent = r.name;
    const label = new CSS2DObject(div);
    label.position.set(0, PIN_HEIGHT + 20, 0);
    label.center.set(0.5, 1);
    group.add(label);

    this.worldGroup.add(group);
    this.markers.push({ id: r.id, group, head, label, baseColor });
  }

  private frameCamera(projector: Projector): void {
    const radius = Math.max(projector.width, projector.depth) * 0.5;
    const dist = fitDistanceForRadius(radius, FOV);
    this.camera.position.set(0, dist * 0.8, dist * 0.85);
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = dist * 0.35;
    this.controls.maxDistance = dist * 1.9;
    this.controls.update();
  }

  private applyMarkerStates(): void {
    for (const m of this.markers) {
      const active = m.id === this.selectedId || m.id === this.hoveredId;
      const mat = m.head.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(active ? m.baseColor : new THREE.Color(0x000000));
      m.head.scale.setScalar(active ? 1.5 : 1);
    }
  }

  private updateLabelOpacity(): void {
    const camDist = this.camera.position.distanceTo(this.controls.target);
    // Restaurant labels stay hidden when zoomed out (77 names would overlap) and
    // fade in as you zoom closer. Hovered/selected always shows below.
    const base = labelOpacity(camDist, TARGET_UNITS * 0.3, TARGET_UNITS * 0.7);
    for (const m of this.markers) {
      const active = m.id === this.selectedId || m.id === this.hoveredId;
      (m.label.element as HTMLElement).style.opacity = String(active ? 1 : base);
    }
  }

  private pick(): string | null {
    if (!this.projector) return null;
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
    this.markers = [];
    for (let i = this.worldGroup.children.length - 1; i >= 0; i--) {
      const child = this.worldGroup.children[i]!;
      this.worldGroup.remove(child);
      child.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose?.();
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
