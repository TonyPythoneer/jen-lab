<script setup lang="ts">
import { useRestaurants } from "~/composables/useRestaurants";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Sydney Food Map — Jen Lab",
  description: "An atlas of personally visited restaurants across Sydney.",
});

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
