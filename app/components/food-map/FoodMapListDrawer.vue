<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { CATEGORY_EN, CATEGORY_ICON, categoryGlyph } from "~/utils/food-map-categories";
import { useFoodMapStore } from "~/composables/useFoodMapStore";

const props = defineProps<{
  categories: readonly Category[];
  restaurants: EnrichedRestaurant[];
  allRestaurants: EnrichedRestaurant[];
  selectedRestaurant: EnrichedRestaurant | null;
}>();

const emit = defineEmits<{ invalidateMap: []; clearSelection: [] }>();

// Entry panel: the old right drawer, now a collapsible block under the brand.
// Picking a place on the map or list auto-opens it.
const entryOpen = ref(false);
function toggleEntry() {
  entryOpen.value = !entryOpen.value;
}
watch(
  () => props.selectedRestaurant,
  (r) => {
    if (r) entryOpen.value = true;
  },
);

const store = useFoodMapStore();

const open = ref(true);

function toggle() {
  open.value = !open.value;
  nextTick(() => setTimeout(() => emit("invalidateMap"), 360));
}

// First level of the Area tab: two districts, mirroring the Food chapters.
const AREAS = [
  { id: "CBD", name: "市中心", sub: "CBD", glyph: "🏙️" },
  { id: "Suburbs", name: "城郊", sub: "Suburbs", glyph: "🏡" },
] as const;

// Counts use allRestaurants (totals, unaffected by current filters)
const restaurantsByCategory = computed(() => {
  const m: Record<string, EnrichedRestaurant[]> = {};
  for (const r of props.allRestaurants) {
    (m[r.categoryId] ??= []).push(r);
  }
  return m;
});

const restaurantsByArea = computed(() => {
  const m: Record<string, EnrichedRestaurant[]> = {};
  for (const r of props.allRestaurants) {
    (m[r.area] ??= []).push(r);
  }
  return m;
});

const selectedAreaName = computed(
  () => AREAS.find((a) => a.id === store.state.selectedArea)?.name ?? "",
);
</script>

<template>
  <div :class="['list-drawer', { 'is-collapsed': !open }]">
    <!-- Edge handle: the only thing visible when collapsed -->
    <button
      class="list-drawer__handle"
      :aria-label="open ? 'Collapse list' : 'Open list'"
      @click="toggle"
    >
      <svg
        v-if="open"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="m15 6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <template v-else>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
        </svg>
        <span class="list-drawer__handle-count">{{ allRestaurants.length }}</span>
      </template>
    </button>

    <div class="list-drawer__panel">
      <FoodMapHeader />

      <!-- Entry: collapsible details, merged from the old right drawer.
           Only exists once a place is picked. -->
      <div v-if="selectedRestaurant" :class="['entry-panel', { 'is-open': entryOpen }]">
        <div class="entry-panel__bar">
          <button class="entry-panel__toggle" :aria-expanded="entryOpen" @click="toggleEntry">
            <span class="entry-panel__label">詳情 · Entry</span>
          </button>
          <!-- close (×): clears the selection, which removes the whole panel -->
          <button
            class="entry-panel__close"
            aria-label="Clear selection"
            @click="emit('clearSelection')"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 6 18 18M18 6 6 18" stroke-linecap="round" />
            </svg>
          </button>
          <!-- chevron: points right (>) when closed, down (v) when open -->
          <button
            class="entry-panel__chevron-btn"
            :aria-label="entryOpen ? 'Collapse entry' : 'Open entry'"
            @click="toggleEntry"
          >
            <svg
              class="entry-panel__chevron"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div v-show="entryOpen" class="entry-panel__body">
          <FoodMapDetail :restaurant="selectedRestaurant" />
        </div>
      </div>

      <div class="list-drawer__tabs">
        <button :class="{ 'is-active': store.state.tab === 'food' }" @click="store.setTab('food')">
          食物 · Food
        </button>
        <button :class="{ 'is-active': store.state.tab === 'area' }" @click="store.setTab('area')">
          城市 · Area
        </button>
      </div>

      <label class="search-field">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" stroke-linecap="round" />
        </svg>
        <input v-model="store.state.search" type="text" placeholder="尋找餐廳 — Search…" />
      </label>

      <!-- Food: category list -->
      <template v-if="store.state.tab === 'food' && !store.state.selectedCategoryId">
        <div class="drawer-section-label">
          <span>類目 · Chapters</span>
          <span class="count">{{ categories.length }}</span>
        </div>
        <div class="drawer-list">
          <button
            v-for="c in categories"
            :key="c.id"
            :class="['category-row', { 'is-hovered': store.state.hoveredCategoryId === c.id }]"
            @click="store.selectCategory(c.id)"
            @mouseenter="store.setHovered(c.id)"
            @mouseleave="store.setHovered(null)"
          >
            <span class="category-row__glyph" :style="{ '--cat': c.color }">{{
              categoryGlyph(c)
            }}</span>
            <span class="category-row__body">
              <span class="category-row__name">{{ c.name }}</span>
              <span class="category-row__sub">{{ CATEGORY_EN[c.id] }}</span>
            </span>
            <span class="category-row__count">{{
              (restaurantsByCategory[c.id] ?? []).length
            }}</span>
          </button>
        </div>
      </template>

      <!-- Food: drilled into a category -->
      <template v-else-if="store.state.tab === 'food' && store.state.selectedCategoryId">
        <button class="drawer-back" @click="store.selectCategory(null)">
          <span>←</span><span>返回 · Back to chapters</span>
        </button>
        <div class="drawer-section-label">
          <span>{{ categories.find((c) => c.id === store.state.selectedCategoryId)?.name }}</span>
          <span class="count">{{ restaurants.length }} entries</span>
        </div>
        <div class="drawer-list">
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

      <!-- Area: district list -->
      <template v-else-if="store.state.tab === 'area' && !store.state.selectedArea">
        <div class="drawer-section-label">
          <span>區域 · Districts</span>
          <span class="count">{{ AREAS.length }}</span>
        </div>
        <div class="drawer-list">
          <button
            v-for="a in AREAS"
            :key="a.id"
            class="category-row"
            @click="store.selectArea(a.id)"
          >
            <span class="category-row__glyph">{{ a.glyph }}</span>
            <span class="category-row__body">
              <span class="category-row__name">{{ a.name }}</span>
              <span class="category-row__sub">{{ a.sub }}</span>
            </span>
            <span class="category-row__count">{{ (restaurantsByArea[a.id] ?? []).length }}</span>
          </button>
        </div>
      </template>

      <!-- Area: drilled into a district -->
      <template v-else>
        <button class="drawer-back" @click="store.selectArea(null)">
          <span>←</span><span>返回 · Back to District</span>
        </button>
        <div class="drawer-section-label">
          <span>{{ selectedAreaName }}</span>
          <span class="count">{{ restaurants.length }} entries</span>
        </div>
        <div class="drawer-list">
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
