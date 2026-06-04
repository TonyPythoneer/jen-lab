<script setup lang="ts">
import type { Map as LeafletMap, Marker, TileLayer, GeoJSON, LayerGroup } from "leaflet";
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { MapTheme } from "~/composables/useFoodMapTheme";
import { CATEGORY_ICON } from "~/utils/food-map-categories";
import { createRiverBoats, type RiverBoatsController } from "~/composables/useRiverBoats";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  selectedRestaurantId: string | null;
  hoveredCategoryId: string | null;
  theme: MapTheme;
  boatsEnabled: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  hover: [categoryId: string | null];
  ready: [controls: { zoomBy: (d: number) => void; recenter: () => void; invalidate: () => void }];
}>();

const SYDNEY_CENTER: [number, number] = [-33.8675, 151.208];
const BOUNDARY_URL = "https://cdn.jsdelivr.net/gh/tim-massey/sydney-geojson@master/sydney.geojson";

const mapEl = ref<HTMLDivElement | null>(null);

// Non-reactive Leaflet handles — never put Leaflet objects into Vue reactive state
let L: typeof import("leaflet") | null = null;
let map: LeafletMap | null = null;
let tileLayer: TileLayer | null = null;
let boundaryLayer: GeoJSON | null = null;
let labelLayer: LayerGroup | null = null;
let boats: RiverBoatsController | null = null;
const markers: Record<string, Marker> = {};

function applyTheme(theme: MapTheme) {
  if (!map || !L) return;
  if (tileLayer) map.removeLayer(tileLayer);
  tileLayer = L.tileLayer(theme.tiles.url, theme.tiles.options as any).addTo(map);

  const el = mapEl.value;
  if (el) {
    el.style.setProperty("--tile-filter", theme.filter);
    el.style.setProperty("--tile-wash", theme.wash);
    el.style.setProperty("--paper-grain-opacity", String(theme.grain));
    for (const [k, v] of Object.entries(theme.vars)) {
      el.style.setProperty(k, v);
    }
    if (!theme.vars["--label-halo"]) el.style.setProperty("--label-halo", "");
  }
  if (boundaryLayer) {
    boundaryLayer.setStyle({ color: theme.vars["--map-boundary"] });
  }
}

function loadBoundaries() {
  fetch(BOUNDARY_URL)
    .then((r) => r.json())
    .then((data) => {
      if (!map || !L) return;
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

      labelLayer = L.layerGroup();
      boundaryLayer.eachLayer((layer: any) => {
        const name = layer.feature?.properties?.SSC_NAME;
        if (!name) return;
        const label = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
        const center = layer.getBounds().getCenter();
        labelLayer!.addLayer(
          L!.marker(center, {
            icon: L!.divIcon({
              className: "suburb-label-wrap",
              html: `<span class="suburb-label">${label}</span>`,
              iconSize: undefined,
              iconAnchor: [0, 0],
            }),
            interactive: false,
            keyboard: false,
          }),
        );
      });

      const updateLabels = () => {
        if (!map) return;
        if (map.getZoom() >= 14) {
          if (!map.hasLayer(labelLayer!)) labelLayer!.addTo(map);
        } else if (map.hasLayer(labelLayer!)) {
          map.removeLayer(labelLayer!);
        }
      };
      map.on("zoomend", updateLabels);
      updateLabels();
    })
    .catch((e) => console.warn("Suburb boundary overlay unavailable:", e?.message ?? e));
}

function buildMarkers(list: EnrichedRestaurant[]) {
  if (!map || !L) return;
  Object.values(markers).forEach((m) => m.remove());
  Object.keys(markers).forEach((k) => delete markers[k]);

  for (const r of list) {
    const color = r.categoryColor;
    const glyph = CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0);
    const icon = L.divIcon({
      className: "r-pin-wrap",
      html: `<div class="r-pin" data-id="${r.id}" data-cat="${r.categoryId}" style="--cat:${color}"><span class="r-pin__glyph">${glyph}</span></div>`,
      iconSize: [38, 46],
      iconAnchor: [19, 43],
    });
    const m = L.marker([r.coordinates.lat, r.coordinates.lng], { icon, riseOnHover: true });
    m.bindTooltip(r.name, { className: "r-tip", direction: "top", offset: [0, -40] });
    m.on("click", () => emit("select", r.id));
    m.on("mouseover", () => emit("hover", r.categoryId));
    m.on("mouseout", () => emit("hover", null));
    m.addTo(map);
    markers[r.id] = m;
  }
  applySelection();
  applyHover();
}

function applySelection() {
  const sel = props.selectedRestaurantId;
  for (const [id, m] of Object.entries(markers)) {
    const el = m.getElement()?.querySelector(".r-pin");
    el?.classList.toggle("is-active", id === sel);
  }
}

function applyHover() {
  const hov = props.hoveredCategoryId;
  const sel = props.selectedRestaurantId;
  for (const [id, m] of Object.entries(markers)) {
    const el = m.getElement()?.querySelector(".r-pin");
    if (!el) continue;
    const r = props.restaurants.find((x) => x.id === id);
    const inGroup = hov != null && r?.categoryId === hov;
    const faded = hov != null && !inGroup && id !== sel;
    el.classList.toggle("is-group", inGroup);
    el.classList.toggle("is-faded", faded);
  }
}

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
  });

  applyTheme(props.theme);
  loadBoundaries();
  buildMarkers(props.restaurants);

  // Build the ferry network once; it lives across every theme (only re-tinted).
  boats = createRiverBoats(map, L);
  boats.setEnabled(props.boatsEnabled);

  const invalidate = () => map?.invalidateSize({ animate: false });
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
      const bounds = L.featureGroup(Object.values(markers)).getBounds();
      try {
        if (window.innerWidth <= 640) {
          // The list sheet covers the lower 62dvh on mobile, and the search +
          // filter chips float over the top. Reserve both so the whole group is
          // framed in the open band, not crammed under the sheet.
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
      if (!id || !markers[id] || !map || !L) return;
      const latlng = markers[id].getLatLng();
      const zoom = Math.max(map.getZoom(), 15);
      // On mobile the detail sheet covers the lower part of the screen. Centre the
      // pin in the open band between the search bar and the sheet top, so it is
      // neither hidden by the sheet nor tucked under the input bar.
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
      // One network across every style — theme only re-tints, never rebuilds.
      boats?.refreshTheme();
    },
  );
  watch(
    () => props.boatsEnabled,
    (on) => boats?.setEnabled(on),
  );

  onUnmounted(() => {
    window.removeEventListener("resize", invalidate);
    boats?.destroy();
    map?.remove();
    map = null;
  });
});
</script>

<template>
  <div ref="mapEl" class="map-surface" />
</template>
