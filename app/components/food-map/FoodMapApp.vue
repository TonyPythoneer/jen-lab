<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { useFoodMapStore } from "~/composables/useFoodMapStore";
import { useFoodMapTheme } from "~/composables/useFoodMapTheme";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  categories: readonly Category[];
}>();

const store = useFoodMapStore();
const { theme, themeId, themes, setTheme, initFromStorage } = useFoodMapTheme();

const BOATS_STORAGE_KEY = "atlas.boatsEnabled";
const boatsEnabled = ref(true);

function toggleBoats() {
  boatsEnabled.value = !boatsEnabled.value;
  try {
    localStorage.setItem(BOATS_STORAGE_KEY, boatsEnabled.value ? "1" : "0");
  } catch {}
}

function initBoatsFromStorage() {
  try {
    const saved = localStorage.getItem(BOATS_STORAGE_KEY);
    if (saved !== null) boatsEnabled.value = saved === "1";
  } catch {}
}

const visibleRestaurants = computed(() => store.getVisibleList(props.restaurants));
const selectedRestaurant = computed(() => store.getSelectedRestaurant(props.restaurants));

const mapControls = reactive<{
  zoomBy: ((d: number) => void) | null;
  recenter: (() => void) | null;
  invalidate: (() => void) | null;
}>({ zoomBy: null, recenter: null, invalidate: null });

function onStageReady(controls: typeof mapControls) {
  Object.assign(mapControls, controls);
}

onMounted(() => {
  initFromStorage();
  initBoatsFromStorage();
});
</script>

<template>
  <div class="food-map-app">
    <ClientOnly>
      <FoodMapStage
        :restaurants="visibleRestaurants"
        :selected-restaurant-id="store.state.selectedRestaurantId"
        :hovered-category-id="store.state.hoveredCategoryId"
        :theme="theme"
        :boats-enabled="boatsEnabled"
        @select="store.selectRestaurant"
        @hover="store.setHovered"
        @ready="onStageReady"
      />
      <template #fallback>
        <div class="map-surface" />
      </template>
    </ClientOnly>

    <div class="map-vignette" aria-hidden="true" />

    <FoodMapThemeMenu
      :themes="themes"
      :active-theme-id="themeId"
      :boats-enabled="boatsEnabled"
      @select="setTheme"
      @toggle-boats="toggleBoats"
    />

    <div class="map-controls">
      <div class="map-controls__group">
        <button aria-label="Zoom in" @click="mapControls.zoomBy?.(1)">+</button>
        <button aria-label="Zoom out" @click="mapControls.zoomBy?.(-1)">−</button>
      </div>
      <button
        class="map-controls__solo"
        aria-label="Recenter on Sydney"
        @click="mapControls.recenter?.()"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <FoodMapListDrawer
      :categories="categories"
      :restaurants="visibleRestaurants"
      :all-restaurants="props.restaurants"
      :selected-restaurant="selectedRestaurant"
      @invalidate-map="mapControls.invalidate?.()"
      @clear-selection="store.selectRestaurant(null)"
    />
  </div>
</template>
