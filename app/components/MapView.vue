<template>
  <div class="relative w-full h-full">
    <div ref="mapEl" class="w-full h-full" />
    <button
      class="absolute bottom-6 right-2.5 z-[1000] w-9 h-9 rounded-full border text-[10px] font-bold tracking-wide cursor-pointer flex items-center justify-center transition-colors duration-150"
      :class="tileQuality === 'high'
        ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
        : 'bg-white border-gray-300 text-gray-400 shadow hover:border-gray-400 hover:text-gray-500'"
      @click="toggleTileQuality"
    >
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

const isReady = defineModel<boolean>('ready', { default: false })

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

onMounted(async function initMap() {
  if (!mapEl.value) return
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  map = L.map(mapEl.value, mapOptions)
  activeTileLayer = L.tileLayer(tileLayers[tileQuality.value], tileLayerOptions).addTo(map)
  renderMarkers()
  isReady.value = true
})

onUnmounted(() => {
  map?.remove()
  map = null
  iconCache.clear()
})
</script>

