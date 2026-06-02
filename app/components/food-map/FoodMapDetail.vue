<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import { CATEGORY_EN, CATEGORY_ICON } from "~/utils/food-map-categories";

defineProps<{
  restaurant: EnrichedRestaurant;
}>();
</script>

<template>
  <div class="detail">
    <!-- Title doubles as the map link; paperclip hints it is clickable -->
    <h2 class="detail__title">
      <a
        v-if="restaurant.googleMapsLink"
        class="detail__title-link"
        :href="restaurant.googleMapsLink"
        target="_blank"
        rel="noreferrer"
      >
        <span class="detail__title-name">{{ restaurant.name }}</span>
        <svg
          class="detail__title-clip"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
          />
        </svg>
      </a>
      <template v-else>{{ restaurant.name }}</template>
    </h2>

    <!-- Chapter + price, merged into one line under the title -->
    <span class="detail__chapter">
      <span class="detail__chapter-icon">{{ CATEGORY_ICON[restaurant.categoryId] }}</span>
      {{ restaurant.categoryName }} · {{ CATEGORY_EN[restaurant.categoryId] }}
      <span class="detail__chapter-price">{{ restaurant.priceRange }}</span>
    </span>

    <p class="detail__summary">{{ restaurant.summary }}</p>

    <div class="detail__block">
      <div class="detail__section-label">記 · The Note</div>
      <p class="detail__desc">{{ restaurant.description }}</p>
    </div>

    <div v-if="restaurant.recommendations?.length" class="detail__block">
      <div class="detail__section-label">推薦 · Recommended</div>
      <div class="detail__recs">
        <UBadge
          v-for="(rec, i) in restaurant.recommendations"
          :key="i"
          color="neutral"
          variant="outline"
          class="rounded-full px-[10px] py-[6px] text-[12px] bg-[var(--paper)] font-normal"
          :ui="{ base: 'ring-[var(--foreground)]' }"
        >
          <span class="me-[6px] text-[10px] text-[var(--accent)]">✦</span>{{ rec }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
