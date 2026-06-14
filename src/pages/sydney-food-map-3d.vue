<route lang="json">
{ "meta": { "layout": false } }
</route>

<script setup lang="ts">
import { useRestaurants } from "~/composables/food-map/useRestaurants";

useSeoMeta({
  title: "Sydney Food Map 3D — Jen Lab",
  description: "A stylized 3D atlas of personally visited restaurants across inner Sydney.",
});

const { categories, filteredRestaurantList, isReady } = useRestaurants();
</script>

<template>
  <div class="food-map-3d-page">
    <FoodMap3DApp v-if="isReady" :restaurants="filteredRestaurantList" :categories="categories" />
  </div>
</template>

<style>
@import "~/assets/css/food-map-3d.css";
</style>

<style scoped>
.food-map-3d-page {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}
</style>
