<script setup lang="ts">
import type { Category, EnrichedRestaurant } from "~/composables/food-map/useRestaurants";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  categories: readonly Category[];
}>();

const selectedId = ref<string | null>(null);
const selected = computed(() => props.restaurants.find((r) => r.id === selectedId.value) ?? null);

function onSelect(id: string | null) {
  selectedId.value = id;
}
function close() {
  selectedId.value = null;
}
</script>

<template>
  <div class="fm3d-app">
    <ClientOnly>
      <FoodMap3DStage :restaurants="restaurants" :selected-id="selectedId" @select="onSelect" />
      <template #fallback>
        <div class="fm3d-loading">Loading the 3D map…</div>
      </template>
    </ClientOnly>

    <!-- Title -->
    <div class="fm3d-title">
      <h1>Sydney Food Map</h1>
      <p>3D · {{ restaurants.length }} places</p>
    </div>

    <!-- Info panel -->
    <aside v-if="selected" class="fm3d-info">
      <button class="fm3d-info__close" aria-label="Close" @click="close">✕</button>
      <span class="fm3d-info__cat" :style="{ background: selected.categoryColor }">{{
        selected.categoryName
      }}</span>
      <h2>{{ selected.name }}</h2>
      <p class="fm3d-info__area">{{ selected.area }} · {{ selected.priceRange }}</p>
      <p class="fm3d-info__summary">{{ selected.summary }}</p>
      <a :href="selected.googleMapsLink" target="_blank" rel="noopener">Open in Google Maps →</a>
    </aside>

    <!-- Attribution (required: Sentinel-2 imagery is CC BY 4.0) -->
    <div class="fm3d-credit">
      Imagery © EOX Sentinel-2 cloudless · CC BY 4.0 · Elevation SRTM/USGS
    </div>
  </div>
</template>

<style scoped>
.fm3d-app {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-basalt-canvas);
}
.fm3d-loading {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--color-abyssal-ink);
  opacity: 0.6;
}
.fm3d-title {
  position: absolute;
  top: 18px;
  left: 18px;
  pointer-events: none;
}
.fm3d-title h1 {
  font-family: var(--font-display, "Bebas Neue", sans-serif);
  font-size: 28px;
  letter-spacing: 0.02em;
  line-height: 0.94;
  color: var(--color-abyssal-ink);
}
.fm3d-title p {
  font-size: 12px;
  color: color-mix(in srgb, var(--color-abyssal-ink) 60%, transparent);
}
.fm3d-info {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: min(320px, 86vw);
  background: var(--color-ash-white);
  border: 1px solid color-mix(in srgb, var(--color-abyssal-ink) 10%, transparent);
  border-radius: var(--radius-caldera-card, 24px);
  padding: 18px 20px;
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.16);
}
.fm3d-info__close {
  position: absolute;
  top: 12px;
  right: 14px;
  color: color-mix(in srgb, var(--color-abyssal-ink) 50%, transparent);
}
.fm3d-info__cat {
  display: inline-block;
  color: var(--color-pure-white);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: var(--radius-caldera-pill, 800px);
}
.fm3d-info h2 {
  font-family: var(--font-display, "Bebas Neue", sans-serif);
  font-size: 22px;
  margin: 8px 0 2px;
  color: var(--color-abyssal-ink);
}
.fm3d-info__area {
  font-size: 12px;
  color: color-mix(in srgb, var(--color-abyssal-ink) 60%, transparent);
}
.fm3d-info__summary {
  font-size: 13px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-abyssal-ink) 80%, transparent);
  margin: 8px 0 10px;
}
.fm3d-info a {
  font-size: 13px;
  color: var(--color-digital-orange);
}
.fm3d-credit {
  position: absolute;
  left: 18px;
  bottom: 12px;
  font-size: 10px;
  line-height: 1.3;
  color: color-mix(in srgb, var(--color-abyssal-ink) 60%, transparent);
  background: color-mix(in srgb, var(--color-ash-white) 72%, transparent);
  padding: 2px 8px;
  border-radius: 5px;
  pointer-events: none;
}
</style>
