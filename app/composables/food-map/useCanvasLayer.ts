// A thin custom Leaflet canvas layer.
//
// WHY: Leaflet draws each marker as its own DOM element with a translate3d, so 77
// restaurant pins + 32 boats become 100+ GPU compositor layers — which a weak phone
// can't recomposite per frame while the map is dragged. Drawing them all onto ONE
// <canvas> collapses that to a single layer that pans as a bitmap.
//
// The canvas sits in its own map pane. During a pan the whole pane is transformed by
// Leaflet, so the canvas rides along for free (no redraw). We only reposition +
// redraw when the gesture ends (moveend/zoomend) — the same trick Leaflet's own
// canvas renderer uses. A zoomanim handler scales the canvas with the tiles so pins
// don't detach mid-zoom, then it snaps back crisp at zoomend.

import type { Map as LeafletMap, Point } from "leaflet";

type LeafletNS = typeof import("leaflet");

export interface CanvasDrawHelpers {
  // lat/lng → canvas CSS pixel (the ctx is already scaled by dpr, so use CSS px).
  project: (lat: number, lng: number) => { x: number; y: number };
  size: { x: number; y: number };
  dpr: number;
  // Live zoom-animation scale (1 when steady). The canvas itself is CSS-scaled by
  // this during a zoom; draw marker SIZES divided by it so they end up a constant
  // screen size (like Google) instead of pulsing with the zoom. Positions are
  // unaffected — the canvas transform still moves them with the tiles.
  zoomScale: number;
}

export interface CanvasLayerOptions {
  paneName: string;
  paneZIndex: number;
  onDraw: (ctx: CanvasRenderingContext2D, helpers: CanvasDrawHelpers) => void;
}

export interface CanvasLayerController {
  redraw(): void;
  destroy(): void;
}

// Cap the backing store at 1.5× device pixels — a full-screen canvas at DPR 3 is a
// huge bitmap to fill on every redraw; 1.5× is near-indistinguishable and far cheaper.
const DPR_CAP = 1.5;

export function createCanvasLayer(
  map: LeafletMap,
  L: LeafletNS,
  opts: CanvasLayerOptions,
): CanvasLayerController {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

  if (!map.getPane(opts.paneName)) {
    const created = map.createPane(opts.paneName);
    created.style.zIndex = String(opts.paneZIndex);
    created.style.pointerEvents = "none"; // hit-testing is done on the map, not the canvas
  }
  const pane = map.getPane(opts.paneName)!;

  // `leaflet-zoom-animated` is what makes our setTransform() math correct + smooth:
  // it sets `transform-origin: 0 0` (so a zoom's scale pivots from the top-left, the
  // way setTransform assumes — otherwise markers stay put / drift), and adds the zoom
  // CSS transition so a button/wheel zoom eases instead of snapping.
  const canvas = L.DomUtil.create(
    "canvas",
    "food-canvas-layer leaflet-zoom-animated",
  ) as HTMLCanvasElement;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.transformOrigin = "0 0";
  pane.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  // The view captured at the last settle (reset). During a zoom these stay FROZEN at
  // the pre-zoom view, so we keep drawing marker positions in the pre-zoom projection
  // and let the canvas's CSS transform move them with the tiles. Re-projecting against
  // the live map mid-zoom would drift (Leaflet sets the map to the target zoom up front).
  let origin: Point = map.containerPointToLayerPoint([0, 0]);
  let startPixelOrigin: Point = map.getPixelOrigin();
  let curZoom = map.getZoom();
  let liveScale = 1; // live CSS scale during a zoom/fly; 1 when steady
  let zoomRaf: number | null = null;

  function captureView() {
    curZoom = map.getZoom();
    origin = map.containerPointToLayerPoint([0, 0]);
    startPixelOrigin = map.getPixelOrigin();
  }

  function sizeCanvas() {
    const size = map.getSize();
    const w = Math.round(size.x * dpr);
    const h = Math.round(size.y * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    canvas.style.width = size.x + "px";
    canvas.style.height = size.y + "px";
  }

  function draw() {
    const size = map.getSize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.x, size.y);
    // Project in the FROZEN (captured) zoom, not the live map — equals the live
    // projection when steady, and stays correct mid-zoom (the CSS transform animates
    // the position). Equivalent to latLngToLayerPoint(ll) − origin at capture time.
    const project = (lat: number, lng: number) => {
      const pp = map.project([lat, lng], curZoom);
      return { x: pp.x - startPixelOrigin.x - origin.x, y: pp.y - startPixelOrigin.y - origin.y };
    };
    opts.onDraw(ctx, { project, size: { x: size.x, y: size.y }, dpr, zoomScale: liveScale });
  }

  // Read the canvas's live CSS scale (set by the zoom transform, browser-interpolated).
  function readLiveScale(): number {
    const t = getComputedStyle(canvas).transform;
    if (!t || t === "none") return 1;
    try {
      return new DOMMatrix(t).a || 1;
    } catch {
      return 1;
    }
  }
  // While a zoom/fly is in flight, redraw every frame at the live scale so the markers
  // hold a constant on-screen size. Started on zoomstart, stopped in reset (zoomend).
  function zoomTick() {
    liveScale = readLiveScale();
    draw();
    zoomRaf = window.requestAnimationFrame(zoomTick);
  }
  function startZoomTick() {
    if (zoomRaf == null) zoomRaf = window.requestAnimationFrame(zoomTick);
  }

  function reset() {
    if (zoomRaf != null) {
      window.cancelAnimationFrame(zoomRaf);
      zoomRaf = null;
    }
    liveScale = 1;
    captureView();
    // Clear any zoom transform (scale back to 1) and place the canvas at the view's
    // top-left. setPosition writes translate3d only, so the zoom scale is dropped.
    L.DomUtil.setPosition(canvas, origin);
    sizeCanvas();
    draw();
  }

  // Transform the canvas to match an in-flight view (mirrors L.Renderer._updateTransform),
  // so pins/boats stay glued to the map during an animation instead of snapping at the
  // end. `center`/`zoom` are the animation's current target.
  function applyViewTransform(center: ReturnType<LeafletMap["getCenter"]>, zoom: number) {
    try {
      const scale = map.getZoomScale(zoom, curZoom);
      const mapAny = map as unknown as {
        _getNewPixelOrigin: (c: typeof center, z: number) => Point;
      };
      // Our canvas content is drawn at (layerPoint − origin) in the pre-zoom view, so a
      // bitmap pixel maps to absolute pixel (startPixelOrigin + origin + Q). The transform
      // must scale that by the zoom and re-anchor to the NEW pixel origin. Including the
      // `origin` term is what was missing — without it, a pan before a zoom (origin ≠ 0)
      // drifts the markers by scale × origin, worst on an off-centre pinch.
      const offset = startPixelOrigin
        .add(origin)
        .multiplyBy(scale)
        .subtract(mapAny._getNewPixelOrigin(center, zoom));
      (
        L.DomUtil as unknown as { setTransform: (el: HTMLElement, o: Point, s: number) => void }
      ).setTransform(canvas, offset, scale);
    } catch {
      // Private-API drift — fall back to the plain snap-on-end behaviour.
    }
  }
  // zoomanim = a discrete zoom animation (gives the target center/zoom up front).
  function onAnimZoom(e: { center: ReturnType<LeafletMap["getCenter"]>; zoom: number }) {
    applyViewTransform(e.center, e.zoom);
  }
  // zoom = fires every frame of a flyTo (which a pin-select uses) — without this the
  // pins would sit still until the fly finished. Drag-pans never fire it.
  function onZoom() {
    applyViewTransform(map.getCenter(), map.getZoom());
  }

  map.on("moveend zoomend viewreset resize", reset);
  map.on("zoomanim", onAnimZoom as never);
  map.on("zoom", onZoom);
  map.on("zoomstart", startZoomTick);
  reset();

  return {
    // Steady-state redraw (boat motion, selection/hover changes). Refreshes the
    // captured view so positions stay exact — but NOT mid-zoom (zoomRaf active), where
    // re-capturing at the target zoom would drift the markers off the tiles.
    redraw() {
      if (zoomRaf == null) captureView();
      draw();
    },
    destroy() {
      if (zoomRaf != null) window.cancelAnimationFrame(zoomRaf);
      map.off("moveend zoomend viewreset resize", reset);
      map.off("zoomanim", onAnimZoom as never);
      map.off("zoom", onZoom);
      map.off("zoomstart", startZoomTick);
      canvas.remove();
    },
  };
}
