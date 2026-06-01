<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { CATEGORY_EN, CATEGORY_ICON, categoryGlyph } from "~/utils/food-map-categories";
import { useFoodMapStore } from "~/composables/useFoodMapStore";

const props = defineProps<{
  categories: readonly Category[];
  restaurants: EnrichedRestaurant[];
  allRestaurants: EnrichedRestaurant[];
}>();

const emit = defineEmits<{ invalidateMap: [] }>();

const store = useFoodMapStore();

const DRAWER_KEY = "atlas.listOpen";

function getInitialOpenState() {
  try {
    const v = localStorage.getItem(DRAWER_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

const open = ref(getInitialOpenState());

function toggle() {
  open.value = !open.value;
  try {
    localStorage.setItem(DRAWER_KEY, open.value ? "1" : "0");
  } catch {}
  nextTick(() => setTimeout(() => emit("invalidateMap"), 360));
}

// Counts use allRestaurants (total per category, unaffected by current filters)
const restaurantsByCategory = computed(() => {
  const m: Record<string, EnrichedRestaurant[]> = {};
  for (const r of props.allRestaurants) {
    (m[r.categoryId] ??= []).push(r);
  }
  return m;
});

const areaGroups = computed(() => {
  const out: Record<string, EnrichedRestaurant[]> = { CBD: [], Suburbs: [] };
  for (const r of props.restaurants) {
    (out[r.area] ??= []).push(r);
  }
  return out;
});
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
      <FoodMapHeader @reset="store.reset()" />

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

      <!-- Area tab -->
      <template v-else>
        <div class="drawer-section-label">
          <span>區域 · Districts</span>
          <span class="count">{{ restaurants.length }}</span>
        </div>
        <div class="drawer-list">
          <template v-for="(grp, area) in areaGroups" :key="area">
            <div v-if="grp.length" class="area-group">
              <span>{{ area === "CBD" ? "市中心 · CBD" : "城郊 · Suburbs" }}</span>
              <span>{{ grp.length }}</span>
            </div>
            <button
              v-for="r in grp"
              :key="r.id"
              :class="[
                'restaurant-row',
                { 'is-active': r.id === store.state.selectedRestaurantId },
              ]"
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
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
