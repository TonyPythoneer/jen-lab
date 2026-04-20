<template>
  <div class="relative w-full h-full">
    <div ref="mapEl" class="w-full h-full" />

    <div
      v-if="selectedRestaurant"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1"
    >
      <div v-if="selectedRestaurant.googleMapsLink" :key="selectedRestaurant.googleMapsLink" class="burst-wrap relative">
        <!-- Ring halo -->
        <span
          class="burst-ring absolute inset-0 rounded-full pointer-events-none"
          :style="{ borderColor: selectedRestaurant.categoryColor }"
        />
        <!-- Sparks: 8 dots at different angles -->
        <span
          v-for="i in 8"
          :key="i"
          class="spark absolute pointer-events-none"
          :style="{
            '--angle': `${(i - 1) * 45}deg`,
            '--color': selectedRestaurant.categoryColor,
            animationDelay: `${(i - 1) * 0.03}s`,
          }"
        />
        <a
          :href="selectedRestaurant.googleMapsLink"
          target="_blank"
          rel="noopener"
          :style="{ backgroundColor: selectedRestaurant.categoryColor }"
          class="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow text-xs font-medium text-white hover:opacity-80 transition-opacity"
        >
          <UIcon name="i-simple-icons-googlemaps" class="w-3.5 h-3.5" />
          Go to <b>Google Maps</b>
        </a>
      </div>
      <button
        :style="{ backgroundColor: selectedRestaurant.categoryColor }"
        class="w-6 h-6 rounded-full shadow flex items-center justify-center text-white hover:opacity-80 transition-opacity cursor-pointer"
        @click="emit('unpin')"
      >
        <UIcon name="i-lucide-x" class="w-3 h-3" />
      </button>
    </div>

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
  selectedRestaurant: EnrichedRestaurant | null
}>()

const emit = defineEmits<{
  select: [restaurant: EnrichedRestaurant]
  unpin: []
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
    const selected = props.selectedRestaurant?.id === restaurant.id
    const {lat, lng} = restaurant.coordinates
    const marker = L.marker([lat, lng], {
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
  () => props.selectedRestaurant,
  (newR, oldR) => {
    if (!map || !L) return

    if (oldR) markerMap.get(oldR.id)?.setIcon(makeIcon(oldR.categoryColor, false))

    if (newR) {
      markerMap.get(newR.id)?.setIcon(makeIcon(newR.categoryColor, true))
      map.panTo([newR.coordinates.lat, newR.coordinates.lng])
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

<style scoped>
/* ── Wrapper ── */
.burst-wrap {
  display: inline-flex;
  align-items: center;
}

/* ── Ring: expands outward and fades ── */
.burst-ring {
  border: 2px solid;
  animation: ring-burst 0.7s ease-out forwards;
}

@keyframes ring-burst {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* ── Sparks: each dot shoots outward at its angle ── */
.spark {
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color);
  animation: spark-shoot 0.7s ease-out forwards;
}

@keyframes spark-shoot {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0px);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(35px);
    opacity: 0;
  }
}
</style>
