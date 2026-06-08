<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import type { Category } from "~/assets/data/restaurants";
import { useFoodMapStore } from "~/composables/food-map/useFoodMapStore";
import { useFoodMapTheme } from "~/composables/food-map/useFoodMapTheme";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  categories: readonly Category[];
}>();

const store = useFoodMapStore();
const { theme, themeId, themes, setTheme } = useFoodMapTheme();

const boatsEnabled = ref(true);

function toggleBoats() {
  boatsEnabled.value = !boatsEnabled.value;
}

// Dev-only switches to turn each static vector layer off and feel its drag cost
// on a real phone. Only rendered in the theme menu when `import.meta.env.DEV`.
const devLayers = reactive({
  courseLines: true,
  wharfDots: true,
  boundary: true,
  boundarySimplified: false, // default to the original full-resolution jsdelivr geometry
  // Off by default: the maxBounds wall + viscosity tug the centre during a touch
  // pinch, which shifted the canvas markers toward the focal point. Toggle on (dev)
  // only to compare. The dev panel still exposes it.
  maxBounds: false,
  idleTiles: true, // only fetch tiles when the drag stops
});
function toggleLayer(key: keyof typeof devLayers) {
  devLayers[key] = !devLayers[key];
}

// Dev basemap renderer comparison, switched from the style menu dropdown.
const tileMode = ref<"raster2x" | "raster1x">("raster2x");
function selectTileMode(mode: typeof tileMode.value) {
  tileMode.value = mode;
}

// The profiler panel shows in dev, or in any build via `?debug` — so the levers
// can be felt on the real prod build (where the jank actually reproduces).
const route = useRoute();
const debug = computed(() => import.meta.env.DEV || route.query.debug !== undefined);

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
</script>

<template>
  <!-- `--detail` (mobile only) hides chips/style/zoom/recenter once a place is picked. -->
  <div :class="['food-map-app', { 'food-map-app--detail': selectedRestaurant }]">
    <ClientOnly>
      <FoodMapCanvas
        :restaurants="visibleRestaurants"
        :selected-restaurant-id="store.state.selectedRestaurantId"
        :hovered-category-id="store.state.hoveredCategoryId"
        :theme="theme"
        :boats-enabled="boatsEnabled"
        :course-lines-visible="devLayers.courseLines"
        :wharf-dots-visible="devLayers.wharfDots"
        :boundary-visible="devLayers.boundary"
        :boundary-simplified="devLayers.boundarySimplified"
        :max-bounds-enabled="devLayers.maxBounds"
        :idle-tiles="devLayers.idleTiles"
        :tile-mode="tileMode"
        @select="store.selectRestaurant"
        @hover="store.setHovered"
        @ready="onStageReady"
      />
      <template #fallback>
        <div class="map-surface" />
      </template>
    </ClientOnly>

    <!-- Top bar: search + filter chips + home, Google-Maps style -->
    <FoodMapTopBar :categories="categories" :all-restaurants="props.restaurants" />

    <!-- List drawer: slides down from the top bar; list ⇄ detail -->
    <FoodMapListDrawer
      :restaurants="visibleRestaurants"
      :selected-restaurant="selectedRestaurant"
    />

    <!-- Bottom-left: map style picker -->
    <div class="map-style-corner">
      <FoodMapThemeMenu
        :themes="themes"
        :active-theme-id="themeId"
        :boats-enabled="boatsEnabled"
        :dev-layers="devLayers"
        :tile-mode="tileMode"
        :debug="debug"
        @select="setTheme"
        @toggle-boats="toggleBoats"
        @toggle-layer="toggleLayer"
        @select-tile-mode="selectTileMode"
        @open="store.closeDrawer"
      />
    </div>

    <!-- Bottom-right: recenter on top, zoom below -->
    <div class="map-controls">
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
      <div class="map-controls__group">
        <button aria-label="Zoom in" @click="mapControls.zoomBy?.(1)">+</button>
        <button aria-label="Zoom out" @click="mapControls.zoomBy?.(-1)">−</button>
      </div>
    </div>
  </div>
</template>
