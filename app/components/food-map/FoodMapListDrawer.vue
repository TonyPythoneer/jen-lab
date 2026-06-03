<script setup lang="ts">
import { computed } from "vue";
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { CATEGORY_EN, CATEGORY_ICON } from "~/utils/food-map-categories";
import { useFoodMapStore } from "~/composables/useFoodMapStore";

const props = defineProps<{
  categories: readonly Category[];
  restaurants: EnrichedRestaurant[];
  selectedRestaurant: EnrichedRestaurant | null;
}>();

const store = useFoodMapStore();

// Mobile bottom sheet: the grip toggles between peek (brand only) and expanded.
function toggleSheet() {
  if (store.state.drawerOpen) store.closeDrawer();
  else store.openDrawer();
}

// The close (X) button dismisses everything back to the initial collapsed peek:
// drop any picked place AND collapse the sheet. (Back, by contrast, only drops
// the place and stays expanded on the list.)
function closeToPeek() {
  store.selectRestaurant(null);
  store.closeDrawer();
}

// Districts share their labels with the top-bar chips.
const AREA_NAME: Record<string, string> = { CBD: "市中心 · CBD", Suburbs: "城郊 · Suburbs" };

// Heading mirrors the active chips: one category shows its name, several show a
// count, an area alone shows the district, nothing shows the full atlas.
const heading = computed(() => {
  const ids = store.state.selectedCategoryIds;
  if (ids.length === 1) {
    const c = props.categories.find((x) => x.id === ids[0]);
    if (c) return `${c.name} · ${CATEGORY_EN[c.id] ?? ""}`.trim();
  }
  if (ids.length > 1) return `${ids.length} 類篩選 · ${ids.length} filters`;
  if (store.state.selectedArea)
    return AREA_NAME[store.state.selectedArea] ?? store.state.selectedArea;
  // No filter: the brand already sits in the peek above, so skip a redundant label.
  return "";
});
</script>

<template>
  <div :class="['list-drawer', { 'is-open': store.state.drawerOpen }]">
    <div class="list-drawer__panel">
      <!-- Mobile peek: drag handle + 雪梨食堂誌 brand (the "Local vibe" strip).
           Tapping toggles peek ⇄ expanded. Hidden on desktop and in detail view. -->
      <button
        v-if="!selectedRestaurant"
        class="list-drawer__grip"
        :aria-expanded="store.state.drawerOpen"
        aria-label="展開清單 · Toggle list"
        @click="toggleSheet"
      >
        <span class="list-drawer__handle" aria-hidden="true" />
        <FoodMapHeader />
      </button>

      <!-- Detail view: a picked place replaces the list. The link + close buttons
           live in the detail's name row (see FoodMapDetail). -->
      <template v-if="selectedRestaurant">
        <div class="list-drawer__scroll">
          <FoodMapDetail :restaurant="selectedRestaurant" />
        </div>
      </template>

      <!-- List view: places filtered by the active chips + search -->
      <template v-else>
        <div class="list-drawer__bar">
          <div class="list-drawer__heading">
            <span class="list-drawer__heading-name">{{ heading }}</span>
            <span class="list-drawer__heading-count">{{ restaurants.length }} 間</span>
          </div>
          <button class="map-iconbtn" aria-label="關閉 · Close" @click="closeToPeek">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 6 18 18M18 6 6 18" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <div class="list-drawer__scroll">
          <button
            v-for="r in restaurants"
            :key="r.id"
            :class="['restaurant-row', { 'is-active': r.id === store.state.selectedRestaurantId }]"
            @click="store.selectRestaurant(r.id)"
            @mouseenter="store.setHovered(r.categoryId)"
            @mouseleave="store.setHovered(null)"
          >
            <span class="restaurant-row__glyph" :style="{ '--cat': r.categoryColor }">
              {{ CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0) }}
            </span>
            <span class="restaurant-row__body">
              <span class="restaurant-row__name">{{ r.name }}</span>
              <span class="restaurant-row__cat">{{ r.categoryName }} · {{ r.area }}</span>
            </span>
            <span class="restaurant-row__price">{{ r.priceRange }}</span>
          </button>
          <div v-if="restaurants.length === 0" class="drawer-empty">
            查無符合 · No matching entries.
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
