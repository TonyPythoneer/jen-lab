<script setup lang="ts">
import type { Category, EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { CATEGORY_EN, categoryGlyph } from "~/utils/food-map/foodMapCategories";
import { countByRegion, countByCuisine } from "~/utils/food-map/foodMapFilters";
import { useFoodMapStore } from "~/composables/food-map/useFoodMapStore";

const props = defineProps<{
  categories: readonly Category[];
  allRestaurants: EnrichedRestaurant[];
}>();

const store = useFoodMapStore();

// Area chips lead the row, mirroring the two map districts.
const AREAS = [
  { id: "CBD", name: "市中心", sub: "CBD" },
  { id: "Suburbs", name: "城郊", sub: "Suburbs" },
] as const;

// Region and Cuisine constrain each other — see foodMapFilters.
const selection = computed(() => ({
  region: store.state.selectedArea,
  cuisine: store.state.selectedCategoryId,
}));
const regionCounts = computed(() => countByRegion(props.allRestaurants, selection.value));
const cuisineCounts = computed(() => countByCuisine(props.allRestaurants, selection.value));

// Cuisines with no match under the selected region drop out entirely.
const activeCategories = computed(() =>
  props.categories.filter((c) => (cuisineCounts.value[c.id] ?? 0) > 0),
);

// Once a cuisine is picked, collapse the row to just that chip — the other
// styles hide until it is deselected (click the active chip again).
const visibleCategories = computed(() => {
  const sel = store.state.selectedCategoryId;
  return sel ? activeCategories.value.filter((c) => c.id === sel) : activeCategories.value;
});
</script>

<template>
  <div class="food-topbar">
    <!-- Search: focusing it summons the list drawer -->
    <div class="food-topbar__search relative flex items-center">
      <span
        class="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none flex items-center"
      >
        <Icon name="i-lucide-search" class="size-[16px] text-current opacity-60" />
      </span>
      <input
        v-model="store.state.search"
        type="text"
        placeholder="雪梨食堂誌 — Search The Atlas"
        class="w-full rounded-full bg-transparent px-[14px] pl-[38px] py-[11px] text-[14px] outline-none ring-0"
        @focus="store.openDrawer()"
      />
    </div>

    <!-- Filter chips: area toggles first, then one chip per cuisine. Scrolls sideways. -->
    <div class="food-topbar__chips">
      <button
        v-for="a in AREAS"
        :key="a.id"
        :class="['food-chip', { 'is-active': store.state.selectedArea === a.id }]"
        :disabled="(regionCounts[a.id] ?? 0) === 0"
        @click="store.selectArea(a.id)"
      >
        <span class="food-chip__label">{{ a.name }}</span>
        <span class="food-chip__count">{{ regionCounts[a.id] ?? 0 }}</span>
      </button>

      <span class="food-topbar__divider" aria-hidden="true" />

      <button
        v-for="c in visibleCategories"
        :key="c.id"
        :class="['food-chip', { 'is-active': store.state.selectedCategoryId === c.id }]"
        :style="{ '--cat': c.color }"
        @click="store.selectCategory(c.id)"
        @mouseenter="store.setHovered(c.id)"
        @mouseleave="store.setHovered(null)"
      >
        <span class="food-chip__glyph">{{ categoryGlyph(c) }}</span>
        <span class="food-chip__label">{{ CATEGORY_EN[c.id] ?? c.name }}</span>
        <span class="food-chip__count">{{ cuisineCounts[c.id] ?? 0 }}</span>
      </button>
    </div>

    <!-- Home: the avatar picture itself is the link back to the site. -->
    <RouterLink to="/" class="food-topbar__home" aria-label="Back to home">
      <img src="/favicon.128x128.webp" alt="Back to home" class="food-topbar__home-avatar" />
    </RouterLink>
  </div>
</template>
