// Custom Leaflet canvas layer: all markers draw onto ONE canvas (one compositor
// layer instead of 100+ DOM markers), repositioned only when a gesture ends.

import type { Map as LeafletMap, Point } from "leaflet";

type LeafletNS = typeof import("leaflet");

export interface CanvasDrawHelpers {
  // lat/lng → canvas CSS pixel (the ctx is already scaled by dpr, so use CSS px).
  project: (lat: number, lng: number) => { x: number; y: number };
  size: { x: number; y: number };
  dpr: number;
  // Live zoom-animation scale (1 when steady). Divide marker SIZES by it so they
  // hold a constant screen size instead of pulsing; positions are unaffected.
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

// Cap the backing store: a full-screen canvas at DPR 3 is a huge bitmap to fill
// on every redraw; 1.5× is near-indistinguishable and far cheaper.
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

  // `leaflet-zoom-animated` sets transform-origin 0 0 (the pivot setTransform
  // assumes — otherwise markers drift) and the easing zoom CSS transition.
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

  // View FROZEN at the last settle: mid-zoom we keep drawing in the pre-zoom
  // projection and let the CSS transform move it — live re-projection would drift.
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
    // Project in the FROZEN zoom, not the live map — identical when steady, and
    // stays correct mid-zoom (the CSS transform animates the position).
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

  // Match the canvas to an in-flight view (mirrors L.Renderer._updateTransform) so
  // markers stay glued to the map during an animation instead of snapping at the end.
  function applyViewTransform(center: ReturnType<LeafletMap["getCenter"]>, zoom: number) {
    try {
      const scale = map.getZoomScale(zoom, curZoom);
      const mapAny = map as unknown as {
        _getNewPixelOrigin: (c: typeof center, z: number) => Point;
      };
      // Scale the bitmap's absolute pixel base (startPixelOrigin + origin) by the
      // zoom and re-anchor to the new pixel origin; dropping `origin` drifts markers.
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
    // Steady-state redraw. Re-captures the view for exact positions — but never
    // mid-zoom, where capturing at the target zoom would drift markers off the tiles.
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
