// Sydney Ferries simulation: the FERRY_ROUTES network built once + vessels sailing
// on one shared canvas. A vessel's `pos` (metres along its polyline) pins it to the path.

import type { Map as LeafletMap, LayerGroup, Polyline, CircleMarker } from "leaflet";
import { FERRY_ROUTES } from "~/utils/food-map/ferryRoutes";
import { createCanvasLayer, type CanvasLayerController } from "./useCanvasLayer";

export interface RiverBoatsController {
  // Re-assert the fixed network colours after a basemap swap.
  refreshTheme(): void;
  setEnabled(on: boolean): void;
  isEnabled(): boolean;
  // Freeze/unfreeze the animation without hiding the fleet — used during pan/zoom
  // so the per-frame redraws don't compete with the map's own interaction work.
  pause(): void;
  resume(): void;
  // Dev-only: show/hide each static vector layer to profile its drag cost.
  setCourseLinesVisible(on: boolean): void;
  setWharfDotsVisible(on: boolean): void;
  destroy(): void;
}

type LeafletNS = typeof import("leaflet");

// A path point as [lat, lng].
type PathPoint = [number, number];

// Pre-measured route geometry: cumulative metres at each vertex + total length.
interface Measured {
  path: PathPoint[];
  cum: number[];
  total: number;
  // Arc-distance (metres) of each wharf, used as pause targets.
  stopDist: number[];
  // Path-vertex index of each wharf, used to place wharf dots.
  stopIndex: number[];
}

// A single moving vessel, always pinned to its route polyline.
interface Vessel {
  path: PathPoint[];
  cum: number[];
  total: number;
  stopDist: number[];
  pos: number; // metres travelled along the path
  dir: 1 | -1; // travel direction along the path
  speed: number; // effective metres per second
  dwellUntil: number; // ms timestamp; >now ⇒ paused at a wharf
  lat: number; // current position, updated each frame; the boat canvas draws here
  lng: number;
  facingRight: boolean;
}

const CONFIG = {
  shipCount: 32, // global soft cap on simultaneous vessels
  maxShipsPerRoute: 6, // per-route ceiling (avoids crowding)

  // On-screen pace, time-compressed (real ferries are ~8 m/s).
  // effective m/s = baseSpeedMetresPerSec * shipSpeedMultiplier.
  baseSpeedMetresPerSec: 70,
  shipSpeedMultiplier: 1.8,

  // Each vessel gets its own multiplier in [min,max] so movement stays un-synced.
  speedVarianceMin: 0.82,
  speedVarianceMax: 1.25,

  // Pause at each wharf, longer layover at terminals (seconds).
  dwellSeconds: 1.4,
  terminalLayoverSeconds: 3.2,

  // ~1 vessel per this many metres of route (then clamped by the caps above).
  metresPerVessel: 2600,

  // Dense dash + slightly heavier weight so routes stay legible on featureless water.
  routeLine: { weight: 1.5, dashArray: "5 4" },
  wharfRadius: 2.6,
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export function createRiverBoats(map: LeafletMap, L: LeafletNS): RiverBoatsController {
  const routes = FERRY_ROUTES.filter(
    (r) => r.path && r.path.length > 1 && r.stops && r.stops.length >= 2,
  );

  const layer: LayerGroup = L.layerGroup();
  // Own sub-groups so the dev toggles can show/hide each layer independently.
  const courseGroup: LayerGroup = L.layerGroup();
  const wharfGroup: LayerGroup = L.layerGroup();
  const reduced = prefersReducedMotion();

  let vessels: Vessel[] = [];
  let courseLines: Polyline[] = [];
  let wharfDots: CircleMarker[] = [];
  let rafId: number | null = null;
  let lastTs = 0;
  let running = false;

  // Declared before the boat canvas: its onDraw (run once at creation) reads it.
  let enabled = false;

  // Sail-ship silhouette as a single Path2D. Faces RIGHT; the draw mirrors it
  // for left-bound travel.
  let boatInk = "#2c2418";
  const boatPath = new Path2D(
    "M11.45 3.2h1.1v12.6h-1.1z" +
      "M12.55 2.7l3.7 0.85-3.7 1.05z" +
      "M13 3.9c4.7 2 6.7 6.8 6 11.2H13z" +
      "M11 5.4C7.9 7.8 6.5 11.5 6.6 15.1H11z" +
      "M2.6 15.7h18.8c-0.9 3.3-3.7 5.1-9.4 5.1S3.5 19 2.6 15.7z",
  );
  const boatCanvas: CanvasLayerController = createCanvasLayer(map, L, {
    paneName: "food-boats",
    paneZIndex: 580, // below the pins pane (600)
    onDraw: (ctx, { project, zoomScale }) => {
      if (!enabled) return;
      // Divide by the live zoom scale so boats hold a constant screen size on zoom.
      const s = ((window.innerWidth <= 640 ? 0.85 : 1) * (26 / 24)) / (zoomScale || 1);
      ctx.fillStyle = boatInk;
      ctx.globalAlpha = 0.94;
      for (const v of vessels) {
        const p = project(v.lat, v.lng);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(v.facingRight ? s : -s, s);
        ctx.translate(-12, -15.7); // anchor (13,17) of the 26px icon → viewBox units
        ctx.fill(boatPath);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  });

  // Pre-measure a path → cumulative metres + total length.
  function measure(points: PathPoint[]): { cum: number[]; total: number } {
    const cum = [0];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += map.distance(points[i - 1]!, points[i]!);
      cum.push(total);
    }
    return { cum, total };
  }

  // Position + horizontal-velocity sign at arc-distance d (metres).
  function sampleAtDist(
    points: PathPoint[],
    cum: number[],
    total: number,
    d: number,
  ): { lat: number; lng: number; dx: number } {
    d = clamp(d, 0, total);
    let i = 1;
    while (i < cum.length && cum[i]! < d) i++;
    if (i >= points.length) i = points.length - 1;
    const a = points[i - 1]!;
    const b = points[i]!;
    const segLen = cum[i]! - cum[i - 1]! || 1;
    const f = (d - cum[i - 1]!) / segLen;
    const lat = a[0] + (b[0] - a[0]) * f;
    const lng = a[1] + (b[1] - a[1]) * f;
    const dx = (b[1] - a[1]) * Math.cos((lat * Math.PI) / 180); // east(+)=right
    return { lat, lng, dx };
  }

  // Fixed colours, never theme vars: the network must read the same on every
  // basemap — a theme-tinted line can vanish over same-coloured water.
  function networkColors(): { route: string; ink: string } {
    return { route: "rgba(46, 36, 26, 0.62)", ink: "#2c2418" };
  }

  function build() {
    layer.clearLayers();
    courseGroup.clearLayers();
    wharfGroup.clearLayers();
    courseGroup.addTo(layer);
    wharfGroup.addTo(layer);
    vessels = [];
    courseLines = [];
    wharfDots = [];

    const colors = networkColors();

    const measured: Measured[] = routes
      .map((r) => {
        const m = measure(r.path);
        return {
          path: r.path,
          cum: m.cum,
          total: m.total,
          stopDist: r.stops.map((s) => m.cum[s.i]!),
          stopIndex: r.stops.map((s) => s.i),
        };
      })
      .filter((m) => m.total > 0);
    if (!measured.length) return;

    measured.forEach((m) => {
      const lineOptions: import("leaflet").PolylineOptions = {
        interactive: false,
        color: colors.route,
        lineCap: "round",
        ...CONFIG.routeLine,
      };
      courseLines.push(L.polyline(m.path, lineOptions).addTo(courseGroup));
      m.stopIndex.forEach((vertexIndex) => {
        wharfDots.push(
          L.circleMarker(m.path[vertexIndex]!, {
            radius: CONFIG.wharfRadius,
            color: colors.ink,
            weight: 1,
            opacity: 0.85,
            fillColor: colors.ink,
            fillOpacity: 0.45,
            interactive: false,
            pane: "overlayPane",
          }).addTo(wharfGroup),
        );
      });
    });

    // Allocate by route length, longest first, within the shipCount budget. A route
    // may get ZERO boats — a 1-boat floor on every tiny OSM leg would blow the budget.
    const desired = measured.map((m) =>
      clamp(Math.round(m.total / CONFIG.metresPerVessel), 0, CONFIG.maxShipsPerRoute),
    );
    const alloc = Array.from({ length: measured.length }, () => 0);
    const longestFirst = measured
      .map((_, i) => i)
      .sort((a, b) => measured[b]!.total - measured[a]!.total);
    let budget = CONFIG.shipCount;
    for (const i of longestFirst) {
      const n = Math.min(desired[i]!, budget);
      alloc[i] = n;
      budget -= n;
      if (budget <= 0) break;
    }

    boatInk = colors.ink;
    const baseSpeed = CONFIG.baseSpeedMetresPerSec * CONFIG.shipSpeedMultiplier;

    measured.forEach((m, ri) => {
      const n = alloc[ri]!;
      for (let k = 0; k < n; k++) {
        // Bidirectional: alternate which terminal a vessel starts from.
        const dir: 1 | -1 = k % 2 === 0 ? 1 : -1;
        const phase = (k + 0.5) / n; // spread along route
        const pos = dir > 0 ? phase * m.total : (1 - phase) * m.total;
        const speed = baseSpeed * rand(CONFIG.speedVarianceMin, CONFIG.speedVarianceMax);
        const start = sampleAtDist(m.path, m.cum, m.total, pos);
        const facingRight = (dir > 0 ? start.dx : -start.dx) >= 0;

        vessels.push({
          path: m.path,
          cum: m.cum,
          total: m.total,
          stopDist: m.stopDist,
          pos,
          dir,
          speed,
          dwellUntil: 0,
          lat: start.lat,
          lng: start.lng,
          facingRight,
        });
      }
    });
  }

  // Next wharf/terminal distance ahead of `pos` in travel direction `dir`.
  function nextTarget(v: Vessel): number {
    const eps = 1;
    if (v.dir > 0) {
      for (let i = 0; i < v.stopDist.length; i++)
        if (v.stopDist[i]! > v.pos + eps) return v.stopDist[i]!;
      return v.total;
    } else {
      for (let i = v.stopDist.length - 1; i >= 0; i--)
        if (v.stopDist[i]! < v.pos - eps) return v.stopDist[i]!;
      return 0;
    }
  }

  function frame(ts: number) {
    if (!running) return;
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
    lastTs = ts;

    for (const v of vessels) {
      if (ts < v.dwellUntil) continue; // paused at a wharf
      const target = nextTarget(v);
      const remaining = (target - v.pos) * v.dir; // metres to next stop ahead
      const step = v.speed * dt;

      if (step >= remaining) {
        v.pos = target;
        const atTerminal = target <= 0 || target >= v.total;
        v.dwellUntil =
          ts + (atTerminal ? CONFIG.terminalLayoverSeconds : CONFIG.dwellSeconds) * 1000;
        if (atTerminal) v.dir = -v.dir as 1 | -1; // turn the service around
      } else {
        v.pos += v.dir * step;
      }

      const p = sampleAtDist(v.path, v.cum, v.total, v.pos);
      v.lat = p.lat;
      v.lng = p.lng;
      v.facingRight = (v.dir > 0 ? p.dx : -p.dx) >= 0;
    }
    boatCanvas.redraw();
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || !enabled) return;
    running = true;
    lastTs = 0;
    rafId = window.requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  // The redraw also covers reduced-motion (start() is a no-op there, so this one
  // draw places the static fleet) and clears the canvas when disabled.
  function applyEnabled() {
    if (enabled) {
      if (!map.hasLayer(layer)) layer.addTo(map);
      start();
    } else {
      stop();
      if (map.hasLayer(layer)) map.removeLayer(layer);
    }
    boatCanvas.redraw();
  }

  function refreshTheme() {
    const colors = networkColors();
    courseLines.forEach((pl) => pl.setStyle({ color: colors.route }));
    wharfDots.forEach((d) => d.setStyle({ color: colors.ink, fillColor: colors.ink }));
    boatInk = colors.ink;
    boatCanvas.redraw();
  }

  build();
  if (reduced) stop();

  return {
    isEnabled: () => enabled,
    setEnabled(val: boolean) {
      enabled = !!val;
      applyEnabled();
    },
    // start() no-ops when disabled or reduced-motion, so resume is always safe.
    pause: stop,
    resume: start,
    setCourseLinesVisible(on: boolean) {
      if (on) courseGroup.addTo(layer);
      else layer.removeLayer(courseGroup);
    },
    setWharfDotsVisible(on: boolean) {
      if (on) wharfGroup.addTo(layer);
      else layer.removeLayer(wharfGroup);
    },
    refreshTheme,
    destroy() {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      boatCanvas.destroy();
      if (map.hasLayer(layer)) map.removeLayer(layer);
      layer.clearLayers();
      vessels = [];
      courseLines = [];
      wharfDots = [];
    },
  };
}
