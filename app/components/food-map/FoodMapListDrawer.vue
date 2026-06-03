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

// Districts share their labels with the top-bar chips.
const AREA_NAME: Record<string, string> = { CBD: "市中心 · CBD", Suburbs: "城郊 · Suburbs" };

// Heading mirrors whichever chip is active; no chip means the full atlas.
const heading = computed(() => {
  if (store.state.selectedCategoryId) {
    const c = props.categories.find((x) => x.id === store.state.selectedCategoryId);
    if (c) return `${c.name} · ${CATEGORY_EN[c.id] ?? ""}`.trim();
  }
  if (store.state.selectedArea)
    return AREA_NAME[store.state.selectedArea] ?? store.state.selectedArea;
  return "雪梨食堂誌 · The Atlas";
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

      <!-- Detail view: a picked place replaces the list -->
      <template v-if="selectedRestaurant">
        <div class="list-drawer__bar">
          <button class="list-drawer__back" @click="store.selectRestaurant(null)">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m15 6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>返回清單 · Back</span>
          </button>
          <button class="list-drawer__close" aria-label="Close" @click="store.closeDrawer()">
            <svg
              width="14"
              height="14"
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
          <button class="list-drawer__close" aria-label="Close" @click="store.closeDrawer()">
            <svg
              width="14"
              height="14"
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
