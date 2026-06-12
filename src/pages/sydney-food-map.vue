<route lang="json">
{ "meta": { "layout": false } }
</route>

<script setup lang="ts">
import { useRestaurants } from "~/composables/food-map/useRestaurants";

useSeoMeta({
  title: "Sydney Food Map — Jen Lab",
  description: "An atlas of personally visited restaurants across Sydney.",
});

// The atlas serif stack (Crimson Pro + Noto Serif TC) loads site-wide from the
// Google Fonts link built in vite.config.ts, so no per-page font link is needed.
const { categories, filteredRestaurantList, isReady } = useRestaurants();
</script>

<template>
  <div class="food-map-page">
    <FoodMapApp v-if="isReady" :restaurants="filteredRestaurantList" :categories="categories" />
  </div>
</template>

<style>
@import "~/assets/css/food-map.css";
</style>

<style scoped>
.food-map-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}
</style>
