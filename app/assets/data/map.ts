import type { MapOptions, TileLayerOptions } from 'leaflet'

const extendBound = 0.0002
export const mapOptions = {
  center: [-33.871, 151.206] as [number, number],
  zoom: 15,           // 10=city, 13=district, 15=street, 18=building
  minZoom: 13,
  maxZoom: 18,
  zoomControl: true,
  maxBounds: [
    [-33.8955-extendBound, 151.1825-extendBound] as [number, number], // SW
    [-33.8220+extendBound, 151.2265+extendBound] as [number, number], // NE
  ] as [[number, number], [number, number]],
  maxBoundsViscosity: 1.0,
} satisfies MapOptions

export const tileLayerOptions = {
  attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
  maxZoom: mapOptions.maxZoom
} satisfies TileLayerOptions

export const tileLayers = {
  low:  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  high: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
}

export const markerIcons = {
  dot: {
    size: 18,                              // diameter in px (default marker)
    border: '2px solid white',             // white outline around the circle
    shadow: '0 2px 6px rgba(0,0,0,0.25)', // subtle drop shadow
  },
  pin: {
    size: 40,                              // diameter in px (selected marker)
    border: '3px solid white',             // thicker outline to stand out
    shadow: '0 4px 12px rgba(0,0,0,0.3)', // stronger shadow for elevation feel
  },
}
