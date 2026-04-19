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

  if (!selected) {
    return L.divIcon({
      className: '',
      html: `<div style="
        width:12px;height:12px;
        background:${color};
        border:2px solid white;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })
  }

  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:28px;height:28px;
        background:${color};
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
      "></div>
      <div style="
        width:0;height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:12px solid ${color};
        margin-top:-2px;
      "></div>
    </div>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
  })
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
