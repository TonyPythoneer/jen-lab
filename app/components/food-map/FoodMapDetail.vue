<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import { CATEGORY_EN, CATEGORY_ICON } from "~/utils/food-map-categories";

defineProps<{
  restaurant: EnrichedRestaurant;
}>();
</script>

<template>
  <div class="detail">
    <!-- The external-map link now lives as a button in the detail header. -->
    <h2 class="detail__title">{{ restaurant.name }}</h2>

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
