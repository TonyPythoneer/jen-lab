<template>
  <div class="relative w-full h-full">
    <div ref="mapEl" class="w-full h-full" />

    <!-- Selected-restaurant action bar. z-1000 sits above all Leaflet panes. -->
    <div
      v-if="selectedRestaurant"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-1"
    >
      <!-- Re-keyed by URL so changing the selection replays the burst animation. -->
      <div v-if="selectedRestaurant.googleMapsLink" :key="selectedRestaurant.googleMapsLink" class="burst-wrap relative">
        <span
          class="burst-ring absolute inset-0 rounded-full pointer-events-none"
          :style="{ borderColor: selectedRestaurant.categoryColor }"
        />
        <!-- 8 sparks fanned 0°-315° in 45° steps. Stagger by index for a fanning-out feel. -->
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
        <!-- z-10 lifts the link above the sibling ring/sparks: their CSS animations create
             stacking contexts (transform/opacity), so DOM order alone is not enough. -->
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

    <!-- HD/SD tile toggle. z-1000 keeps it above Leaflet panes, same layer as the action bar. -->
    <button
      class="absolute bottom-6 right-2.5 z-1000 w-9 h-9 rounded-full border text-[10px] font-bold tracking-wide cursor-pointer flex items-center justify-center transition-colors duration-150"
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
const tileQuality = ref<'low' | 'high'>('low')

// Non-reactive Leaflet handles. Kept as plain `let` to avoid Vue reactivity wrapping.
let L: LeafletInstance | null = null
let map: LeafletMap | null = null
let activeTileLayer: ReturnType<LeafletInstance['tileLayer']> | null = null
const markerById = new Map<string, Marker>()
const iconsByColor = new Map<string, { dot: DivIcon; pin: DivIcon }>()

function getIcon(color: string, selected: boolean): DivIcon {
  if (!L) throw new Error('Leaflet not initialized')
  let pair = iconsByColor.get(color)
  if (!pair) {
    pair = { dot: makeDotIcon(L, { color }), pin: makePinIcon(L, { color }) }
    iconsByColor.set(color, pair)
  }
  return selected ? pair.pin : pair.dot
}

function toggleTileQuality() {
  if (!map || !L) return
  tileQuality.value = tileQuality.value === 'low' ? 'high' : 'low'
  activeTileLayer?.remove()
  activeTileLayer = L.tileLayer(tileLayers[tileQuality.value], tileLayerOptions).addTo(map)
}

function renderMarkers() {
  if (!map || !L) return

  markerById.forEach(m => m.remove())
  markerById.clear()

  const selectedId = props.selectedRestaurant?.id
  for (const r of props.restaurants) {
    const marker = L.marker([r.coordinates.lat, r.coordinates.lng], {
      icon: getIcon(r.categoryColor, r.id === selectedId),
    }).addTo(map)
    marker.on('click', () => emit('select', r))
    markerById.set(r.id, marker)
  }
}

// Re-render markers when the filtered list changes (no diffing — list is small).
watch(() => props.restaurants, renderMarkers)

// Selection change: swap icons + recenter without rebuilding all markers.
watch(() => props.selectedRestaurant, (newR, oldR) => {
  if (!map || !L) return
  if (oldR) markerById.get(oldR.id)?.setIcon(getIcon(oldR.categoryColor, false))
  if (newR) {
    markerById.get(newR.id)?.setIcon(getIcon(newR.categoryColor, true))
    map.panTo([newR.coordinates.lat, newR.coordinates.lng])
  }
})

onMounted(async () => {
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
  markerById.clear()
  iconsByColor.clear()
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
