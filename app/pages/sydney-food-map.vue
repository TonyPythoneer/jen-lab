<script setup lang="ts">
import { useRestaurants } from "~/composables/food-map/useRestaurants";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Sydney Food Map — Jen Lab",
  description: "An atlas of personally visited restaurants across Sydney.",
});

// Load the atlas serif fonts directly from Google Fonts, matching the source.
// @nuxt/fonts only fetches the Latin subset of Noto Serif TC, so Chinese fell
// back to a system font; the css2 endpoint serves the Traditional-Chinese
// unicode-range subsets, so 雪梨食堂誌 / category names render in Noto Serif TC.
useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+TC:wght@400;500;600;700&display=swap",
    },
  ],
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
