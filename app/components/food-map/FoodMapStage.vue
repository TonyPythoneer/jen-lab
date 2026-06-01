<script setup lang="ts">
import type { Map as LeafletMap, Marker, TileLayer, GeoJSON, LayerGroup } from "leaflet";
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { MapTheme } from "~/composables/useFoodMapTheme";
import { CATEGORY_ICON } from "~/utils/food-map-categories";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  selectedRestaurantId: string | null;
  hoveredCategoryId: string | null;
  theme: MapTheme;
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
      boundaryLayer = L.geoJSON(data, {
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
      if (list.length > 0 && list.length < 100) {
        const grp = L!.featureGroup(Object.values(markers));
        try {
          map?.fitBounds(grp.getBounds().pad(0.25), { animate: true, maxZoom: 16 });
        } catch {}
      }
    },
  );

  watch(
    () => props.selectedRestaurantId,
    (id) => {
      applySelection();
      if (id && markers[id]) {
        map?.flyTo(markers[id].getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
      }
    },
  );

  watch(() => props.hoveredCategoryId, applyHover);
  watch(
    () => props.theme,
    (t) => applyTheme(t),
  );

  onUnmounted(() => {
    window.removeEventListener("resize", invalidate);
    map?.remove();
    map = null;
  });
});
</script>

<template>
  <div ref="mapEl" class="map-surface" />
</template>
