<template>
  <div ref="mapEl" class="map" />
</template>

<script setup lang="ts">
import type { Map, Marker, DivIcon } from 'leaflet'

import type data from '@/assets/data/landmarks.json'

const props = defineProps<{
  landmarks: typeof data.landmarks
  categories: typeof data.categories
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [landmark: typeof data.landmarks[number]]
}>()

const mapEl = ref<HTMLDivElement | null>(null)
let map: Map | null = null
const markerMap = new Map<number, Marker>()

function getCategoryColor(categoryId: string): string {
  return props.categories.find((c) => c.id === categoryId)?.color ?? '#666'
}

function getCategoryName(categoryId: string): string {
  return props.categories.find((c) => c.id === categoryId)?.name ?? categoryId
}

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

function makePopup(landmark: typeof data.landmarks[number]): string {
  const color = getCategoryColor(landmark.category)
  const catName = getCategoryName(landmark.category)
  return `
    <div style="padding:12px;min-width:200px;font-family:-apple-system,sans-serif">
      <div stydescriptionle="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
        ${landmark.area.toUpperCase()} • ${catName}
      </div>
      <div style="font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:6px">${landmark.name}</div>
      <div style="font-size:12px;color:#777;font-style:italic;margin-bottom:8px">${landmark.description}</div>
      <a href="${landmark.googleMapsLink}" target="_blank" rel="noopener noreferrer" class="w-full text-white text-[12px] font-bold py-2.5 flex items-center justify-center gap-2 rounded-lg transition-all no-underline shadow-sm mt-2" style="background-color: rgb(47, 79, 79); color: rgb(255, 255, 255);">
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

function renderMarkers(L: typeof import('leaflet').default) {
  if (!map) return

  markerMap.forEach((m) => m.remove())
  markerMap.clear()

  for (const landmark of props.landmarks) {
    const color = getCategoryColor(landmark.category)
    const selected = props.selectedId === landmark.id
    const marker = L.marker([landmark.coordinates.lat, landmark.coordinates.lng], {
      icon: makeIcon(color, selected),
    })
      .addTo(map!)
      .bindPopup(makePopup(landmark), { maxWidth: 260 })

    marker.on('click', () => {
      emit('select', landmark)
    })

    markerMap.set(landmark.id, marker)
  }
}

watch(
  () => props.landmarks,
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
      if (old) {
        const landmark = props.landmarks.find((l) => l.id === oldId)
        if (landmark) {
          old.setIcon(makeIcon(getCategoryColor(landmark.category), false))
        }
      }
    }

    if (newId !== null) {
      const marker = markerMap.get(newId)
      if (marker) {
        const landmark = props.landmarks.find((l) => l.id === newId)
        if (landmark) {
          marker.setIcon(makeIcon(getCategoryColor(landmark.category), true))
          marker.openPopup()
          map.panTo([landmark.coordinates.lat, landmark.coordinates.lng])
        }
      }
    }
  },
)

onMounted(() => {
  initMap()
})

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
