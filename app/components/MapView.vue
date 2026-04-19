<template>
  <div class="map-wrapper">
    <div ref="mapEl" class="map" />
    <button class="tile-toggle" :class="{ active: tileQuality === 'high' }" @click="toggleTileQuality">
      HD
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap, Marker, DivIcon } from 'leaflet'
import type { EnrichedRestaurant } from '@/composables/useRestaurants'
import { mapOptions, tileLayers, tileLayerOptions } from '@/assets/data/map'
import { makeDotIcon, makePinIcon } from '@/utils/map'

type LeafletInstance = typeof import('leaflet')

const props = defineProps<{
  restaurants: EnrichedRestaurant[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [restaurant: EnrichedRestaurant]
}>()

const mapEl = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
let L: LeafletInstance | null = null
let activeTileLayer: ReturnType<LeafletInstance['tileLayer']> | null = null
const tileQuality = ref<'low' | 'high'>('low')
const markerMap = new Map<string, Marker>()
const iconCache = new Map<string, { dot: DivIcon; pin: DivIcon }>()

function makeIcon(color: string, selected: boolean): DivIcon {
  if (!L) throw new Error('Leaflet not initialized')
  if (!iconCache.has(color)) {
    iconCache.set(color, {
      dot: makeDotIcon(L, { color }),
      pin: makePinIcon(L, { color }),
    })
  }
  const iconOptions = iconCache.get(color);
  return selected ? iconOptions!.pin : iconOptions!.dot
}



async function initMap() {
  if (!mapEl.value) return
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  map = L.map(mapEl.value, mapOptions)

  activeTileLayer = L.tileLayer(tileLayers[tileQuality.value], tileLayerOptions).addTo(map)
  renderMarkers()
}

function toggleTileQuality() {
  if (!map || !L) return
  tileQuality.value = tileQuality.value === 'low' ? 'high' : 'low'
  activeTileLayer?.remove()
  activeTileLayer = L.tileLayer(tileLayers[tileQuality.value], tileLayerOptions).addTo(map)
}

function renderMarkers() {
  if (!map || !L) return

  markerMap.forEach((m) => m.remove())
  markerMap.clear()

  for (const restaurant of props.restaurants) {
    const selected = props.selectedId === restaurant.id
    const marker = L.marker([restaurant.coordinates.lat, restaurant.coordinates.lng], {
      icon: makeIcon(restaurant.categoryColor, selected),
    }).addTo(map!)

    marker.on('click', () => emit('select', restaurant))
    markerMap.set(restaurant.id, marker)
  }
}

watch(
  () => props.restaurants,
  () => {
    renderMarkers()
  },
)

watch(
  () => props.selectedId,
  (newId, oldId) => {
    if (!map || !L) return

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
  iconCache.clear()
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.map {
  width: 100%;
  height: 100%;
}
.tile-toggle {
  position: absolute;
  bottom: 24px;
  right: 10px;
  z-index: 1000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid #ccc;
  background: white;
  color: #999;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.tile-toggle:hover {
  border-color: #aaa;
  color: #666;
}
.tile-toggle.active {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
}
</style>
