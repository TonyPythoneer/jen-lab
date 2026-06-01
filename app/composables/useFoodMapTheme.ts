const TILE_SOURCES = {
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    options: { subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap · CARTO" },
  },
  voyagerLabels: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    options: { subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap · CARTO" },
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    options: {
      subdomains: "abc",
      maxZoom: 19,
      maxNativeZoom: 17,
      attribution: "© OpenTopoMap (CC-BY-SA) · OpenStreetMap",
    },
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { subdomains: "abc", maxZoom: 19, attribution: "© OpenStreetMap contributors" },
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" },
  },
} as const;

export type TileSource = (typeof TILE_SOURCES)[keyof typeof TILE_SOURCES];

export interface MapThemeVars {
  "--map-boundary": string;
  "--map-water-accent": string;
  "--map-label": string;
  "--boat-ink": string;
  "--boat-route": string;
  "--label-halo"?: string;
}

export interface MapTheme {
  id: string;
  name: string;
  en: string;
  note: string;
  tiles: TileSource;
  filter: string;
  wash: string;
  grain: number;
  vars: MapThemeVars;
}

export const MAP_THEMES: MapTheme[] = [
  {
    id: "parchment",
    name: "羊皮古地圖",
    en: "Parchment Atlas",
    note: "Warm monochrome — water reads as pale paper",
    tiles: TILE_SOURCES.voyagerLabels,
    filter: "sepia(0.36) saturate(0.98) hue-rotate(-10deg) brightness(1.03) contrast(1.12)",
    wash: "rgba(238, 226, 196, 0.14)",
    grain: 0.55,
    vars: {
      "--map-boundary": "#7c5d3a",
      "--map-water-accent": "#b8a878",
      "--map-label": "#6b4f2e",
      "--boat-ink": "#5e4326",
      "--boat-route": "rgba(111, 85, 54, 0.34)",
    },
  },
  {
    id: "engraving",
    name: "銅版雕刻",
    en: "Copperplate Engraving",
    note: "Black engraved linework on warm engraver's paper",
    tiles: TILE_SOURCES.osm,
    filter: "grayscale(1) brightness(0.84) contrast(1.7) sepia(0.5) brightness(1.06)",
    wash: "rgba(226, 214, 184, 0.2)",
    grain: 0.5,
    vars: {
      "--map-boundary": "#2c241a",
      "--map-water-accent": "#7b736040",
      "--map-label": "#241d14",
      "--boat-ink": "#241d14",
      "--boat-route": "rgba(40, 32, 22, 0.42)",
    },
  },
  {
    id: "handtint",
    name: "手繪測量圖",
    en: "Hand-tinted Survey",
    note: "Faded survey linework with hand-applied colour washes",
    tiles: TILE_SOURCES.osm,
    filter: "saturate(0.9) sepia(0.22) hue-rotate(-5deg) brightness(0.85) contrast(1.55)",
    wash: "rgba(224, 206, 170, 0.14)",
    grain: 0.5,
    vars: {
      "--map-boundary": "#8a5a3c",
      "--map-water-accent": "#9fb6c0",
      "--map-label": "#5e4026",
      "--boat-ink": "#5e4026",
      "--boat-route": "rgba(120, 84, 52, 0.4)",
    },
  },
  {
    id: "voyager",
    name: "晴港藍",
    en: "Harbour Blue",
    note: "Keeps real blue water — most legible",
    tiles: TILE_SOURCES.voyagerLabels,
    filter: "saturate(1.22) brightness(1.0) contrast(1.12) sepia(0.10)",
    wash: "rgba(242, 232, 206, 0.07)",
    grain: 0.4,
    vars: {
      "--map-boundary": "#8a6d44",
      "--map-water-accent": "#7fa8c9",
      "--map-label": "#5e4326",
      "--boat-ink": "#3f5870",
      "--boat-route": "rgba(70, 96, 122, 0.36)",
    },
  },
  {
    id: "topographic",
    name: "等高線・地形",
    en: "Topographic",
    note: "Contour lines + hillshade — true elevation terrain",
    tiles: TILE_SOURCES.topo,
    filter: "sepia(0.40) saturate(0.9) hue-rotate(-8deg) brightness(1.04) contrast(1.02)",
    wash: "rgba(236, 224, 192, 0.12)",
    grain: 0.6,
    vars: {
      "--map-boundary": "#6f5536",
      "--map-water-accent": "#9bb1bf",
      "--map-label": "#5a4126",
      "--boat-ink": "#4a4030",
      "--boat-route": "rgba(90, 65, 38, 0.34)",
    },
  },
  {
    id: "cool",
    name: "石板・薄霧",
    en: "Slate & Mist",
    note: "Cool study — slate-blue / muted-teal water",
    tiles: TILE_SOURCES.voyager,
    filter: "saturate(0.78) brightness(1.04) contrast(1.05) hue-rotate(6deg) sepia(0.12)",
    wash: "rgba(214, 222, 224, 0.14)",
    grain: 0.35,
    vars: {
      "--map-boundary": "#6b7a82",
      "--map-water-accent": "#8fb0bc",
      "--map-label": "#3f5159",
      "--boat-ink": "#3f5159",
      "--boat-route": "rgba(63, 81, 89, 0.36)",
    },
  },
  {
    id: "satellite",
    name: "衛星影像",
    en: "Satellite",
    note: "Real aerial imagery",
    tiles: TILE_SOURCES.satellite,
    filter: "saturate(1.05) brightness(1.0) contrast(1.02)",
    wash: "transparent",
    grain: 0.0,
    vars: {
      "--map-boundary": "#f0e3c2",
      "--map-water-accent": "#cfe0e6",
      "--map-label": "#f6efdd",
      "--label-halo": "rgba(8, 16, 22, 0.92)",
      "--boat-ink": "#f7eed6",
      "--boat-route": "rgba(247, 238, 214, 0.5)",
    },
  },
];

const STORAGE_KEY = "atlas.mapTheme";
const DEFAULT_THEME_ID = "parchment";

// Module-level state — safe during SSR/prerender: themeId starts at "parchment"
// and is never mutated server-side. initFromStorage() only runs in onMounted.
// If called outside <ClientOnly> in a new route, revisit.
const themeId = ref<string>(DEFAULT_THEME_ID);

export function useFoodMapTheme() {
  const theme = computed<MapTheme>(
    () => MAP_THEMES.find((t) => t.id === themeId.value) ?? MAP_THEMES[0]!,
  );

  function setTheme(id: string) {
    themeId.value = id;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }

  // Restore from localStorage on first client mount
  function initFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && MAP_THEMES.some((t) => t.id === saved)) themeId.value = saved;
    } catch {}
  }

  return { themeId, theme, themes: MAP_THEMES, setTheme, initFromStorage };
}
