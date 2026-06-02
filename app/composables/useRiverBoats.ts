// =============================================================================
// useRiverBoats — Sydney Ferries SIMULATION (painter + vessel movement)
// -----------------------------------------------------------------------------
// Renders the shared route data layer (FERRY_ROUTES) and drives vessels along it
// as a believable, active ferry network. Depends ONLY on Leaflet (the `map`
// passed in) + FERRY_ROUTES. It knows nothing about Vue, the store, or drawers.
//
// ── ONE NETWORK, EVERY MAP STYLE ─────────────────────────────────────────────
// The route network is DATA, not decoration. The fleet + course lines + wharves
// are built ONCE and live in one Leaflet layer group, present on every theme.
// Switching the cartographic style never rebuilds or hides the network. The route
// styling is DECOUPLED from the theme: colours are fixed in networkColors() so the
// network reads identically on every basemap. (Per-theme tinting was the old bug —
// a blue line on the blue-water style dropped out of sight.)
//
// ── VESSELS FOLLOW REAL ROUTE GEOMETRY (no free movement, no shortcuts) ───────
// A vessel is parametrised by `pos` = metres travelled along its route polyline,
// so it is ALWAYS attached to the path. It runs as a point-to-point service:
//     terminal A → (pause at each intermediate wharf) → terminal B → reverse → …
// It never jumps to a random position and never disappears mid-route — at a
// terminal it lays over briefly, then sails the return journey. Bidirectional
// traffic comes free: half the vessels on a route start from each terminal.
//
// ── FREQUENCY-DRIVEN FLEET ───────────────────────────────────────────────────
// Each route's vessel count scales with its length, capped by maxShipsPerRoute
// and the global shipCount. Per-vessel speed variance keeps movement un-synced.
//
// ── PERF / DEGRADATION ───────────────────────────────────────────────────────
// One rAF loop total (dt clamped); pauses on document.hidden; prefers-reduced-
// motion places vessels statically. Enabled-state is owned by the caller.
// =============================================================================

import type { Map as LeafletMap, LayerGroup, Polyline, CircleMarker, Marker } from "leaflet";
import { FERRY_ROUTES } from "~/utils/ferry-routes";

export interface RiverBoatsController {
  // Re-read --boat-route/--boat-ink and recolour lines, wharf dots, and boats.
  refreshTheme(): void;
  // Show + animate the whole network, or hide it.
  setEnabled(on: boolean): void;
  isEnabled(): boolean;
  // Stop rAF, remove the layer, drop listeners.
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
  marker: Marker;
  el: HTMLElement | null; // the inner .river-boat element (for flip/fade)
  facingRight: boolean;
}

// ── TUNABLE CONFIG ───────────────────────────────────────────────────────────
const CONFIG = {
  shipCount: 32, // global soft cap on simultaneous vessels
  maxShipsPerRoute: 6, // per-route ceiling (avoids crowding)

  // On-screen pace. Real ferries are ~8 m/s; we compress time so the network
  // feels lively. effective m/s = baseSpeedMetresPerSec * shipSpeedMultiplier.
  baseSpeedMetresPerSec: 70,
  shipSpeedMultiplier: 1.8,

  // Each vessel gets its own multiplier in [min,max] → natural movement.
  speedVarianceMin: 0.82,
  speedVarianceMax: 1.25,

  // Service realism: pause at each wharf, longer layover at terminals (sec).
  dwellSeconds: 1.4,
  terminalLayoverSeconds: 3.2,

  // ~1 vessel per this many metres of route (then clamped by the caps above).
  metresPerVessel: 2600,

  // 0 (snappy) … 1 (very smooth) — eases the facing flip + spawn fade.
  animationSmoothness: 0.7,

  routeLine: { weight: 1.3, dashArray: "1 6" }, // colour comes from theme
  wharfRadius: 2.6,
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

// Solid sail-ship silhouette: hull + billowing mainsail and jib on a mast,
// topped with a pennant. fill=currentColor so the theme tints it. Art faces
// RIGHT; the engine mirrors it for left-bound travel.
const BOAT_SVG =
  '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
  '<g fill="currentColor">' +
  '<path d="M11.45 3.2h1.1v12.6h-1.1z"/>' +
  '<path d="M12.55 2.7l3.7 0.85-3.7 1.05z"/>' +
  '<path d="M13 3.9c4.7 2 6.7 6.8 6 11.2H13z"/>' +
  '<path d="M11 5.4C7.9 7.8 6.5 11.5 6.6 15.1H11z"/>' +
  '<path d="M2.6 15.7h18.8c-0.9 3.3-3.7 5.1-9.4 5.1S3.5 19 2.6 15.7z"/>' +
  "</g></svg>";

export function createRiverBoats(map: LeafletMap, L: LeafletNS): RiverBoatsController {
  // Source from FERRY_ROUTES, keeping only routes with usable geometry.
  const routes = FERRY_ROUTES.filter(
    (r) => r.path && r.path.length > 1 && r.stops && r.stops.length >= 2,
  );

  const layer: LayerGroup = L.layerGroup();
  const reduced = prefersReducedMotion();

  let vessels: Vessel[] = [];
  let courseLines: Polyline[] = [];
  let wharfDots: CircleMarker[] = [];
  let rafId: number | null = null;
  let lastTs = 0;
  let running = false;
  // The caller owns this; default off until setEnabled is called.
  let enabled = false;

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

  // Ferry styling is DECOUPLED from the map theme on purpose. The route layer must
  // read the same on every basemap — warm parchment, blue water, or topographic —
  // so its colours are fixed here, not pulled from the theme's --boat-* vars. This
  // is why some routes used to vanish on the blue "Harbour Blue" style: a per-theme
  // blue line over blue water dropped out. A fixed dark ink shows on all of them.
  function networkColors(): { route: string; ink: string } {
    return { route: "rgba(46, 36, 26, 0.62)", ink: "#2c2418" };
  }

  // ── BUILD the whole network from CONFIG (runs once) ──────────────────────────
  function build() {
    layer.clearLayers();
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

    // Course line + wharf dots per route.
    measured.forEach((m) => {
      const lineOptions: import("leaflet").PolylineOptions = {
        interactive: false,
        color: colors.route,
        lineCap: "round",
        ...CONFIG.routeLine,
      };
      courseLines.push(L.polyline(m.path, lineOptions).addTo(layer));
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
          }).addTo(layer),
        );
      });
    });

    // Allocate vessels: ~length/metresPerVessel, clamped, then trimmed to the
    // global shipCount (longest routes keep their boats first).
    const alloc = measured.map((m) =>
      clamp(Math.round(m.total / CONFIG.metresPerVessel), 1, CONFIG.maxShipsPerRoute),
    );
    let sum = alloc.reduce((s, n) => s + n, 0);
    while (sum > CONFIG.shipCount) {
      // Reduce the route with the most vessels (but never below 1).
      let idx = -1;
      let best = 1;
      measured.forEach((_, i) => {
        if (alloc[i]! > best) {
          best = alloc[i]!;
          idx = i;
        }
      });
      if (idx === -1) break;
      alloc[idx]!--;
      sum--;
    }

    const flip = CONFIG.animationSmoothness;
    const flipMs = Math.round(140 + flip * 360);
    const fadeMs = Math.round(500 + flip * 1400);
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

        const marker = L.marker([start.lat, start.lng], {
          icon: L.divIcon({
            className: "river-boat-wrap",
            html:
              '<div class="river-boat" style="--boat-ink:' +
              colors.ink +
              ";transition:transform " +
              flipMs +
              "ms ease, opacity " +
              fadeMs +
              'ms ease">' +
              BOAT_SVG +
              "</div>",
            iconSize: [26, 26],
            iconAnchor: [13, 17],
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -200,
        }).addTo(layer);

        const el = marker.getElement()
          ? (marker.getElement()!.querySelector(".river-boat") as HTMLElement | null)
          : null;
        const facingRight = (dir > 0 ? start.dx : -start.dx) >= 0;
        if (el) {
          el.style.transform = facingRight ? "scaleX(1)" : "scaleX(-1)";
          el.style.opacity = "0";
        }
        const delay = reduced ? 0 : (k / Math.max(1, n)) * 1400 + ri * 220 + Math.random() * 500;
        if (el) setTimeout(() => (el.style.opacity = "0.94"), delay);

        vessels.push({
          path: m.path,
          cum: m.cum,
          total: m.total,
          stopDist: m.stopDist,
          pos,
          dir,
          speed,
          dwellUntil: 0,
          marker,
          el,
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

  // ── SIMULATION LOOP ──────────────────────────────────────────────────────────
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
        // Arrived at the next wharf / terminal.
        v.pos = target;
        const atTerminal = target <= 0 || target >= v.total;
        v.dwellUntil =
          ts + (atTerminal ? CONFIG.terminalLayoverSeconds : CONFIG.dwellSeconds) * 1000;
        if (atTerminal) v.dir = -v.dir as 1 | -1; // turn the service around
      } else {
        v.pos += v.dir * step;
      }

      const p = sampleAtDist(v.path, v.cum, v.total, v.pos);
      v.marker.setLatLng([p.lat, p.lng]);
      const wantRight = (v.dir > 0 ? p.dx : -p.dx) >= 0;
      if (wantRight !== v.facingRight && v.el) {
        v.facingRight = wantRight;
        v.el.style.transform = wantRight ? "scaleX(1)" : "scaleX(-1)";
      }
    }
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

  // Apply the current enabled-state: show + animate, or hide the whole network.
  function applyEnabled() {
    if (enabled) {
      if (!map.hasLayer(layer)) layer.addTo(map);
      start();
    } else {
      stop();
      if (map.hasLayer(layer)) map.removeLayer(layer);
    }
  }

  // Called after every map-style swap. Colours are fixed (see networkColors), so
  // this only re-asserts them and keeps the network on top — the route look is the
  // same on every theme by design.
  function refreshTheme() {
    const colors = networkColors();
    courseLines.forEach((pl) => pl.setStyle({ color: colors.route }));
    wharfDots.forEach((d) => d.setStyle({ color: colors.ink, fillColor: colors.ink }));
    vessels.forEach((v) => {
      if (v.el) v.el.style.setProperty("--boat-ink", colors.ink);
    });
    // LayerGroup has no bringToFront in Leaflet's types (or at runtime); call it
    // defensively so z-ordering still works if a future Leaflet adds it.
    const group = layer as unknown as { bringToFront?: () => void };
    if (map.hasLayer(layer) && group.bringToFront) group.bringToFront();
  }

  // Build the network once; the caller decides enabled via setEnabled.
  build();
  if (reduced) stop();

  return {
    isEnabled: () => enabled,
    setEnabled(val: boolean) {
      enabled = !!val;
      applyEnabled();
    },
    refreshTheme,
    destroy() {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      if (map.hasLayer(layer)) map.removeLayer(layer);
      layer.clearLayers();
      vessels = [];
      courseLines = [];
      wharfDots = [];
    },
  };
}
