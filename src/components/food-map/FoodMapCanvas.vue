<script setup lang="ts">
import type { Map as LeafletMap, TileLayer, GeoJSON, Marker, LatLng } from "leaflet";
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import type { MapTheme } from "~/composables/food-map/useFoodMapTheme";
import { createRiverBoats, type RiverBoatsController } from "~/composables/food-map/useRiverBoats";
import { createPinCanvas, type PinCanvasController } from "~/composables/food-map/usePinCanvas";
import { simplifyFeatureCollection } from "~/utils/food-map/geoSimplify";

// Dev tile-resolution toggle: @2x retina vs @1x. (Phones force @1x regardless.)
export type TileMode = "raster2x" | "raster1x";

const props = withDefaults(
  defineProps<{
    restaurants: EnrichedRestaurant[];
    selectedRestaurantId: string | null;
    hoveredCategoryId: string | null;
    theme: MapTheme;
    boatsEnabled: boolean;
    // Dev-only perf levers (A/B on a real phone). Defaults show the full network
    // in prod, where the toggles are not exposed.
    courseLinesVisible?: boolean;
    wharfDotsVisible?: boolean;
    boundaryVisible?: boolean;
    boundarySimplified?: boolean; // off = full-resolution boundary geometry
    tileMode?: TileMode;
    maxBoundsEnabled?: boolean; // pen the map into the data box
    idleTiles?: boolean; // only fetch tiles when the drag stops
  }>(),
  {
    courseLinesVisible: true,
    wharfDotsVisible: true,
    boundaryVisible: true,
    boundarySimplified: false,
    tileMode: "raster2x",
    maxBoundsEnabled: true,
    idleTiles: true,
  },
);

const emit = defineEmits<{
  select: [id: string];
  hover: [categoryId: string | null];
  ready: [controls: { zoomBy: (d: number) => void; recenter: () => void; invalidate: () => void }];
}>();

const SYDNEY_CENTER: [number, number] = [-33.8675, 151.208];
const BOUNDARY_URL = "https://cdn.jsdelivr.net/gh/tim-massey/sydney-geojson@master/sydney.geojson";
// The raw boundary has ~174k vertices — the dominant pan/zoom cost. They are
// faint hairlines, so thin hard: 0.0005 deg ≈ 45 m, a few pixels at street zoom.
const BOUNDARY_SIMPLIFY_EPSILON = 0.0005;

const mapEl = ref<HTMLDivElement | null>(null);

// Non-reactive Leaflet handles — never put Leaflet objects into Vue reactive state
let L: typeof import("leaflet") | null = null;
let map: LeafletMap | null = null;
let tileLayer: TileLayer | null = null;
let boundaryLayer: GeoJSON | null = null;
// Suburb labels are DOM markers — only the in-view ones are mounted (see updateLabels).
let labelMarkers: { m: Marker; ll: LatLng }[] = [];
// Kept pristine so buildBoundary can rebuild either simplified or full-resolution.
let rawBoundary: unknown = null;
let boundaryZoomHandler: (() => void) | null = null;
// Padded box around all restaurant points; the dev maxBounds toggle reapplies it.
let dataBounds: import("leaflet").LatLngBounds | null = null;
let boats: RiverBoatsController | null = null;
let pinCanvas: PinCanvasController | null = null;
let hoverTip: HTMLDivElement | null = null;
let invalidate: (() => void) | null = null;

function applyTheme(theme: MapTheme) {
  if (!map || !L) return;
  applyBasemap();

  const el = mapEl.value;
  if (el) {
    for (const [k, v] of Object.entries(theme.vars)) {
      el.style.setProperty(k, v);
    }
    if (!theme.vars["--label-halo"]) el.style.setProperty("--label-halo", "");
  }
  if (boundaryLayer) {
    boundaryLayer.setStyle({ color: theme.vars["--map-boundary"] });
  }
}

// Phones get @1x tiles (a quarter of the @2x pixels — far cheaper for a weak GPU
// to composite while panning); desktop keeps @2x for crispness.
function applyBasemap() {
  if (!map || !L) return;
  if (tileLayer) {
    map.removeLayer(tileLayer);
    tileLayer = null;
  }

  const src = props.theme.tiles;
  const force1x = window.innerWidth <= 640 || props.tileMode === "raster1x";
  const url = force1x ? src.url.replace("{r}", "") : src.url;
  tileLayer = L.tileLayer(url, {
    ...(src.options as any),
    // Fetch/swap tiles only once the drag stops — no per-frame tile DOM churn.
    updateWhenIdle: props.idleTiles,
    updateWhenZooming: false,
    keepBuffer: props.idleTiles ? 1 : 2,
  }).addTo(map);
}

// Pen the map into the box around all restaurant points plus a margin, so
// dragging can never wander into empty tiles.
function fitMaxBoundsToData(list: EnrichedRestaurant[]) {
  if (!map || !L || !list.length) return;
  const data = L.latLngBounds(list.map((r) => [r.coordinates.lat, r.coordinates.lng]));

  // Pad the wall so even an edge pin can be flown to the centre of the mobile
  // "room" (the open band between the search bar and the detail sheet): convert
  // that pixel offset to lat/lng at the selection zoom (15) and pad every side.
  const size = map.getSize();
  const selZoom = 15;
  const roomCentre = (64 + size.y * 0.38) / 2; // searchBar 64px ↔ sheet top 0.38h
  const offsetPx = Math.max(size.y / 2 - roomCentre, size.y * 0.2, size.x * 0.25);
  const cp = map.project(data.getCenter(), selZoom);
  const padLat =
    Math.abs(
      map.unproject(cp.subtract([0, offsetPx]), selZoom).lat -
        map.unproject(cp.add([0, offsetPx]), selZoom).lat,
    ) / 2;
  const padLng =
    Math.abs(
      map.unproject(cp.add([offsetPx, 0]), selZoom).lng -
        map.unproject(cp.subtract([offsetPx, 0]), selZoom).lng,
    ) / 2;
  dataBounds = L.latLngBounds(
    [data.getSouth() - padLat, data.getWest() - padLng],
    [data.getNorth() + padLat, data.getEast() + padLng],
  );
  applyMaxBounds();
}

function applyMaxBounds() {
  if (!map || !L) return;
  map.setMaxBounds(props.maxBoundsEnabled && dataBounds ? dataBounds : (undefined as never));
}

function loadBoundaries() {
  fetch(BOUNDARY_URL)
    .then((r) => r.json())
    .then((data) => {
      if (!map || !L) return;
      rawBoundary = data;
      buildBoundary();
    })
    .catch((e) => console.warn("Suburb boundary overlay unavailable:", e?.message ?? e));
}

// Build (or rebuild) the boundary + labels from the cached raw data. Tears the
// old layers down first so the dev switch can flip repeatedly without leaking
// zoom listeners.
function buildBoundary() {
  if (!map || !L || !rawBoundary) return;

  if (boundaryZoomHandler) map.off("zoomend moveend", boundaryZoomHandler);
  if (boundaryLayer && map.hasLayer(boundaryLayer)) map.removeLayer(boundaryLayer);
  labelMarkers.forEach(({ m }) => map!.removeLayer(m));
  labelMarkers = [];

  // Work on a clone — simplify mutates in place, and we keep raw pristine.
  const data = structuredClone(rawBoundary);
  if (props.boundarySimplified) {
    const t0 = performance.now();
    simplifyFeatureCollection(
      data as Parameters<typeof simplifyFeatureCollection>[0],
      BOUNDARY_SIMPLIFY_EPSILON,
    );
    if (import.meta.env.DEV) {
      console.info(`[food-map] boundary simplified in ${(performance.now() - t0).toFixed(1)}ms`);
    }
  } else if (import.meta.env.DEV) {
    console.info("[food-map] boundary RAW (full jsdelivr geometry, ~174k pts)");
  }

  const color = props.theme.vars["--map-boundary"] ?? "#7c5d3a";
  boundaryLayer = L.geoJSON(data as Parameters<(typeof import("leaflet"))["geoJSON"]>[0], {
    style: {
      color,
      weight: 0.8,
      opacity: 0.5,
      fill: false,
      lineCap: "round",
      lineJoin: "round",
    },
    interactive: false,
    pane: "overlayPane",
  }).addTo(map);

  boundaryLayer.eachLayer((layer: any) => {
    const name = layer.feature?.properties?.SSC_NAME;
    if (!name) return;
    const label = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
    const center = layer.getBounds().getCenter() as LatLng;
    const m = L!.marker(center, {
      icon: L!.divIcon({
        className: "suburb-label-wrap",
        html: `<span class="suburb-label">${label}</span>`,
        iconSize: undefined,
        iconAnchor: [0, 0],
      }),
      interactive: false,
      keyboard: false,
    });
    labelMarkers.push({ m, ll: center });
  });

  boundaryZoomHandler = updateLabels;
  map.on("zoomend moveend", updateLabels);
  applyBoundaryVisible(props.boundaryVisible);
  updateLabels();
}

// Mount only the labels in view at zoom ≥ 14 — the viewport cull is what keeps
// ~470 DOM markers cheap.
function updateLabels() {
  if (!map) return;
  const show = props.boundaryVisible && map.getZoom() >= 14;
  const bounds = show ? map.getBounds().pad(0.1) : null;
  for (const { m, ll } of labelMarkers) {
    const want = show && bounds!.contains(ll);
    const on = map.hasLayer(m);
    if (want && !on) m.addTo(map);
    else if (!want && on) map.removeLayer(m);
  }
}

function applyBoundaryVisible(on: boolean) {
  if (!map) return;
  if (boundaryLayer) {
    if (on && !map.hasLayer(boundaryLayer)) boundaryLayer.addTo(map);
    else if (!on && map.hasLayer(boundaryLayer)) map.removeLayer(boundaryLayer);
  }
  updateLabels();
}

// Pins render on one shared canvas (see usePinCanvas); these feed it data + state.
function buildMarkers(list: EnrichedRestaurant[]) {
  pinCanvas?.setData(list);
}
function applySelection() {
  pinCanvas?.setSelected(props.selectedRestaurantId);
}
function applyHover() {
  pinCanvas?.setHovered(props.hoveredCategoryId);
}

// Desktop hover: highlight the category group under the cursor + show a name
// tooltip. Mobile (no hover) never runs this.
let hoveredPinId: string | null = null;
function onMapMouseMove(e: {
  containerPoint: { x: number; y: number };
  originalEvent: MouseEvent;
}) {
  if (!pinCanvas || !mapEl.value) return;
  const id = pinCanvas.hitTest(e.containerPoint.x, e.containerPoint.y);
  if (id === hoveredPinId) {
    if (id && hoverTip) {
      hoverTip.style.left = e.containerPoint.x + "px";
      hoverTip.style.top = e.containerPoint.y + "px";
    }
    return;
  }
  hoveredPinId = id;
  const r = id ? props.restaurants.find((x) => x.id === id) : null;
  emit("hover", r ? r.categoryId : null);
  mapEl.value.style.cursor = r ? "pointer" : "";
  if (r && hoverTip) {
    hoverTip.textContent = r.name;
    hoverTip.style.left = e.containerPoint.x + "px";
    hoverTip.style.top = e.containerPoint.y + "px";
    hoverTip.style.display = "block";
  } else if (hoverTip) {
    hoverTip.style.display = "none";
  }
}
function onMapMouseOut() {
  hoveredPinId = null;
  emit("hover", null);
  if (hoverTip) hoverTip.style.display = "none";
  if (mapEl.value) mapEl.value.style.cursor = "";
}

// Registered synchronously: inside the async onMounted it would run after the
// first `await` with no active instance and silently never fire, leaking the
// boats rAF + resize listener. The refs it touches are module-level lets above.
onUnmounted(() => {
  if (invalidate) window.removeEventListener("resize", invalidate);
  boats?.destroy();
  pinCanvas?.destroy();
  hoverTip?.remove();
  map?.remove();
  map = null;
});

onMounted(async () => {
  if (!mapEl.value) return;
  L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");

  map = L.map(mapEl.value, {
    center: SYDNEY_CENTER,
    zoom: 14,
    zoomControl: false,
    attributionControl: true,
    minZoom: 11,
    maxZoom: 18,
    // Every vector layer renders onto ONE canvas instead of a big SVG DOM tree —
    // a canvas pans as a single bitmap, which a weak phone GPU can composite.
    preferCanvas: true,
    // Hard wall at the data edge (see fitMaxBoundsToData) so the user can't pan
    // into empty ocean and keep loading tiles.
    maxBoundsViscosity: 1.0,
  });

  applyTheme(props.theme);
  fitMaxBoundsToData(props.restaurants);
  loadBoundaries();

  pinCanvas = createPinCanvas(map, L);
  buildMarkers(props.restaurants);
  applySelection();
  applyHover();

  hoverTip = document.createElement("div");
  hoverTip.className = "food-tip";
  hoverTip.style.display = "none";
  mapEl.value.appendChild(hoverTip);

  // Pins are canvas pixels, so click + hover hit-test on the map itself.
  map.on("click", (e) => {
    const pt = (e as unknown as { containerPoint: { x: number; y: number } }).containerPoint;
    const id = pinCanvas?.hitTest(pt.x, pt.y);
    if (id) emit("select", id);
  });
  if (window.matchMedia("(hover: hover)").matches) {
    map.on("mousemove", onMapMouseMove as never);
    map.getContainer().addEventListener("mouseleave", onMapMouseOut);
  }

  // Built once; a theme change only recolours it, never rebuilds.
  boats = createRiverBoats(map, L);
  boats.setEnabled(props.boatsEnabled);
  boats.setCourseLinesVisible(props.courseLinesVisible);
  boats.setWharfDotsVisible(props.wharfDotsVisible);

  // Dev-only handle for a Playwright bench to toggle each layer in isolation.
  if (import.meta.env.DEV) {
    (window as unknown as { __foodMapDebug?: unknown }).__foodMapDebug = {
      map,
      setBoats: (on: boolean) => boats?.setEnabled(on),
      setCourseLines: (on: boolean) => boats?.setCourseLinesVisible(on),
      setWharfDots: (on: boolean) => boats?.setWharfDotsVisible(on),
      setBoundary: (on: boolean) => applyBoundaryVisible(on),
    };
  }

  // Freeze the ferry animation during pan/zoom so its per-frame canvas redraw
  // doesn't compete with the gesture; resume when the map settles.
  map.on("movestart zoomstart", () => boats?.pause());
  map.on("moveend zoomend", () => boats?.resume());

  invalidate = () => map?.invalidateSize({ animate: false });
  window.addEventListener("resize", invalidate);

  emit("ready", {
    zoomBy: (d: number) => map?.setZoom((map.getZoom() ?? 14) + d),
    recenter: () => map?.flyTo(SYDNEY_CENTER, 14, { duration: 0.6 }),
    invalidate,
  });

  watch(
    () => props.restaurants,
    (list) => {
      buildMarkers(list);
      if (list.length === 0 || list.length >= 100 || !map || !L) return;
      const bounds = L.latLngBounds(list.map((r) => [r.coordinates.lat, r.coordinates.lng]));
      try {
        if (window.innerWidth <= 640) {
          // Reserve the list sheet (lower 62dvh) and the floating search/chips
          // so the group is framed in the open band, not crammed under either.
          const h = map.getSize().y;
          map.fitBounds(bounds, {
            animate: true,
            maxZoom: 16,
            paddingTopLeft: [24, 125],
            paddingBottomRight: [24, Math.round(h * 0.62)],
          });
        } else {
          map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 16 });
        }
      } catch {}
    },
  );

  watch(
    () => props.selectedRestaurantId,
    (id) => {
      applySelection();
      const r = id ? props.restaurants.find((x) => x.id === id) : null;
      if (!r || !map || !L) return;
      const latlng = L.latLng(r.coordinates.lat, r.coordinates.lng);
      const zoom = Math.max(map.getZoom(), 15);
      // Mobile: centre the pin in the open band between the search bar and the
      // detail sheet, so neither covers it.
      if (window.innerWidth <= 640) {
        const h = map.getSize().y;
        const searchBarBottom = 64; // search row: 14 top + ~45 tall + margin
        const sheetTop = h * 0.38; // detail sheet is 62dvh (see food-map.css)
        const pinHalf = 23; // pin is ~46px tall, anchored at its base
        const roomCentre = (searchBarBottom + sheetTop) / 2;
        const offsetY = h / 2 - (roomCentre + pinHalf);
        const pt = map.project(latlng, zoom).add([0, offsetY]);
        map.flyTo(map.unproject(pt, zoom), zoom, { duration: 0.6 });
      } else {
        map.flyTo(latlng, zoom, { duration: 0.6 });
      }
    },
  );

  watch(() => props.hoveredCategoryId, applyHover);
  watch(
    () => props.theme,
    (t) => {
      applyTheme(t);
      boats?.refreshTheme();
    },
  );
  watch(
    () => props.boatsEnabled,
    (on) => boats?.setEnabled(on),
  );
  watch(
    () => props.courseLinesVisible,
    (on) => boats?.setCourseLinesVisible(on),
  );
  watch(
    () => props.wharfDotsVisible,
    (on) => boats?.setWharfDotsVisible(on),
  );
  watch(
    () => props.boundaryVisible,
    (on) => applyBoundaryVisible(on),
  );
  watch(
    () => props.boundarySimplified,
    () => buildBoundary(),
  );
  watch(
    () => props.tileMode,
    () => applyBasemap(),
  );
  watch(
    () => props.idleTiles,
    () => applyBasemap(),
  );
  watch(
    () => props.maxBoundsEnabled,
    () => applyMaxBounds(),
  );
});
</script>

<template>
  <div ref="mapEl" class="map-surface" />
</template>
