const TILE_SOURCES = {
  voyagerLabels: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    options: { subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap · CARTO" },
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
  vars: MapThemeVars;
}

// Parchment FX removed, so the two old OSM themes (hand-tint / engraving) became
// identical — only the basemap source now distinguishes a theme. Kept the two
// genuinely-different basemaps: CARTO Voyager (colour) and plain OSM (ink).
export const MAP_THEMES: MapTheme[] = [
  {
    id: "voyager",
    name: "晴港藍",
    en: "Harbour Blue",
    note: "CARTO Voyager — keeps real blue water, most legible",
    tiles: TILE_SOURCES.voyagerLabels,
    vars: {
      "--map-boundary": "#8a6d44",
      "--map-water-accent": "#7fa8c9",
      "--map-label": "#5e4326",
      "--boat-ink": "#3f5870",
      "--boat-route": "rgba(70, 96, 122, 0.36)",
    },
  },
  {
    id: "engraving",
    name: "墨線圖",
    en: "Ink Lines",
    note: "Plain OpenStreetMap with dark ink boundaries",
    tiles: TILE_SOURCES.osm,
    vars: {
      "--map-boundary": "#2c241a",
      "--map-water-accent": "#7b736040",
      "--map-label": "#241d14",
      "--boat-ink": "#241d14",
      "--boat-route": "rgba(40, 32, 22, 0.42)",
    },
  },
];

const DEFAULT_THEME_ID = "voyager";

// Module-level state — safe during SSR/prerender: themeId starts at the default
// and is never mutated server-side (it only changes on user interaction).
const themeId = ref<string>(DEFAULT_THEME_ID);

export function useFoodMapTheme() {
  const theme = computed<MapTheme>(
    () => MAP_THEMES.find((t) => t.id === themeId.value) ?? MAP_THEMES[0]!,
  );

  function setTheme(id: string) {
    themeId.value = id;
  }

  return { themeId, theme, themes: MAP_THEMES, setTheme };
}
