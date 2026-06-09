<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { CATEGORY_EN, CATEGORY_ICON } from "~/utils/food-map/foodMapCategories";
import { useFoodMapStore } from "~/composables/food-map/useFoodMapStore";

defineProps<{
  restaurant: EnrichedRestaurant;
}>();

const store = useFoodMapStore();

// Close dismisses the detail back to the initial collapsed peek (drop the place
// and close the sheet). There is no separate back button — close covers it.
// Close the panel first, then drop the place only after the close transition
// (opacity 220ms / transform 320ms) finishes — otherwise the list view swaps in
// while the panel is still fading and flashes on screen.
function close() {
  store.closeDrawer();
  setTimeout(() => store.selectRestaurant(null), 340);
}
</script>

<template>
  <div class="detail">
    <!-- Name shares a row with the link + close buttons; centred so the buttons
         stay middle-aligned even when the name wraps to several lines. -->
    <div class="detail__head">
      <h2 class="detail__title">{{ restaurant.name }}</h2>
      <div class="detail__actions">
        <a
          v-if="restaurant.googleMapsLink"
          class="map-iconbtn"
          :href="restaurant.googleMapsLink"
          target="_blank"
          rel="noreferrer"
          aria-label="在 Google 地圖開啟 · Open in Google Maps"
        >
          <svg
            width="17"
            height="17"
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
        <button class="map-iconbtn" aria-label="關閉 · Close" @click="close">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 6 18 18M18 6 6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

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
        <Badge
          v-for="(rec, i) in restaurant.recommendations"
          :key="i"
          variant="outline"
          class="rounded-full px-[10px] py-[6px] text-[12px] bg-[var(--paper)] font-normal ring-[var(--foreground)]"
        >
          <span class="me-[6px] text-[10px] text-[var(--accent)]">✦</span>{{ rec }}
        </Badge>
      </div>
    </div>
  </div>
</template>
