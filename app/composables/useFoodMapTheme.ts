const TILE_SOURCES = {
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
];

const STORAGE_KEY = "atlas.mapTheme";
const DEFAULT_THEME_ID = "engraving";

// Module-level state — safe during SSR/prerender: themeId starts at the default
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
