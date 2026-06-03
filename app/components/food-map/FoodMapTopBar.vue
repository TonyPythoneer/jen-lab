<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import type { Category } from "~/assets/data/pages/restaurants";
import { CATEGORY_EN, categoryGlyph } from "~/utils/food-map-categories";
import { useFoodMapStore } from "~/composables/useFoodMapStore";

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

// Totals per category, so a chip only shows when it has places.
const countByCategory = computed(() => {
  const m: Record<string, number> = {};
  for (const r of props.allRestaurants) m[r.categoryId] = (m[r.categoryId] ?? 0) + 1;
  return m;
});

const activeCategories = computed(() =>
  props.categories.filter((c) => (countByCategory.value[c.id] ?? 0) > 0),
);
</script>

<template>
  <div class="food-topbar">
    <!-- Search: focusing it summons the list drawer -->
    <UInput
      v-model="store.state.search"
      icon="i-lucide-search"
      placeholder="搜尋餐廳 — Search the atlas"
      class="food-topbar__search"
      :ui="{
        root: 'w-full',
        base: 'rounded-full ring-0 px-[14px] py-[11px] text-[14px] bg-transparent',
        leadingIcon: 'size-[16px]',
      }"
      @focus="store.openDrawer()"
    />

    <!-- Filter chips: Area toggles first, then one chip per cuisine. Scrolls sideways. -->
    <div class="food-topbar__chips">
      <button
        v-for="a in AREAS"
        :key="a.id"
        :class="['food-chip', { 'is-active': store.state.selectedArea === a.id }]"
        @click="store.selectArea(a.id)"
      >
        <span class="food-chip__label">{{ a.name }}</span>
      </button>

      <span class="food-topbar__divider" aria-hidden="true" />

      <button
        v-for="c in activeCategories"
        :key="c.id"
        :class="['food-chip', { 'is-active': store.state.selectedCategoryId === c.id }]"
        :style="{ '--cat': c.color }"
        @click="store.selectCategory(c.id)"
        @mouseenter="store.setHovered(c.id)"
        @mouseleave="store.setHovered(null)"
      >
        <span class="food-chip__glyph">{{ categoryGlyph(c) }}</span>
        <span class="food-chip__label">{{ CATEGORY_EN[c.id] ?? c.name }}</span>
      </button>
    </div>

    <!-- Home: avatar + wordmark, lifted from the site header; back to the site -->
    <NuxtLink to="/" class="food-topbar__home" aria-label="Back to home">
      <img src="/favicon.128x128.webp" alt="" class="food-topbar__home-avatar" />
      <span class="food-topbar__home-word font-display">JEN</span>
    </NuxtLink>
  </div>
</template>
