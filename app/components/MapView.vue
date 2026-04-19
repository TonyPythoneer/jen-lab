<template>
  <div ref="mapEl" class="map" />
</template>

<script setup lang="ts">
import type { Map as LeafletMap, Marker, DivIcon } from 'leaflet'

type LeafletInstance = typeof import('leaflet')
import type { EnrichedRestaurant } from '@/composables/useRestaurants'

const props = defineProps<{
  restaurants: EnrichedRestaurant[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [restaurant: EnrichedRestaurant]
}>()

const mapEl = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
const markerMap = new Map<string, Marker>()

function makeIcon(color: string, selected: boolean): DivIcon {
  const L = window.L as typeof import('leaflet')
  const size = selected ? 32 : 24
  const border = selected ? 4 : 3
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      width:${size}px;
      height:${size}px;
      border:${border}px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 4px 12px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

function makePopup(restaurant: EnrichedRestaurant): string {
  return `
    <div style="padding:12px;min-width:200px;font-family:-apple-system,sans-serif">
      <div style="font-size:10px;font-weight:700;color:${restaurant.categoryColor};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
        ${restaurant.area.toUpperCase()} • ${restaurant.categoryName}
      </div>
      <div style="font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:6px">${restaurant.name}</div>
      <div style="font-size:12px;color:#777;font-style:italic;margin-bottom:8px">${restaurant.description}</div>
      <a href="${restaurant.googleMapsLink}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;background-color:rgb(47,79,79);color:white;font-size:12px;font-weight:700;padding:10px;border-radius:8px;text-decoration:none;margin-top:8px;">
        開啟 Google Maps 導覽
      </a>
    </div>
  `
}

async function initMap() {
  if (!mapEl.value) return
  const L = (await import('leaflet')).default
;(window as any).L = L

  await import('leaflet/dist/leaflet.css')

  map = L.map(mapEl.value, {
    center: [-33.871, 151.206],
    zoom: 15,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map)

  renderMarkers(L)
}

function renderMarkers(L: LeafletInstance) {
  if (!map) return

  markerMap.forEach((m) => m.remove())
  markerMap.clear()

  for (const restaurant of props.restaurants) {
    const selected = props.selectedId === restaurant.id
    const marker = L.marker([restaurant.coordinates.lat, restaurant.coordinates.lng], {
      icon: makeIcon(restaurant.categoryColor, selected),
    })
      .addTo(map!)
      .bindPopup(makePopup(restaurant), { maxWidth: 260 })

    marker.on('click', () => emit('select', restaurant))
    markerMap.set(restaurant.id, marker)
  }
}

watch(
  () => props.restaurants,
  async () => {
    if (!map) return
    const L = (await import('leaflet')).default
    renderMarkers(L)
  },
)

watch(
  () => props.selectedId,
  async (newId, oldId) => {
    if (!map) return
    const L = (await import('leaflet')).default

    if (oldId !== null) {
      const old = markerMap.get(oldId)
      const restaurant = props.restaurants.find((r) => r.id === oldId)
      if (old && restaurant) old.setIcon(makeIcon(restaurant.categoryColor, false))
    }

    if (newId !== null) {
      const marker = markerMap.get(newId)
      const restaurant = props.restaurants.find((r) => r.id === newId)
      if (marker && restaurant) {
        marker.setIcon(makeIcon(restaurant.categoryColor, true))
        marker.openPopup()
        map.panTo([restaurant.coordinates.lat, restaurant.coordinates.lng])
      }
    }
  },
)

onMounted(() => initMap())

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
