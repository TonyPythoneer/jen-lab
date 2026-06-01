<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";
import { CATEGORY_EN, CATEGORY_ICON } from "~/utils/food-map-categories";

const props = defineProps<{
  restaurant: EnrichedRestaurant | null;
}>();

const emit = defineEmits<{ close: [] }>();

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape" && props.restaurant) emit("close");
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div
    :class="['details-drawer', { 'is-open': !!restaurant }]"
    role="dialog"
    aria-label="Place details"
  >
    <div v-if="restaurant" class="detail">
      <div class="detail__topbar">
        <span>Entry · No. {{ restaurant.id.toUpperCase() }}</span>
        <button class="detail__close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <span class="detail__chapter">
        <span class="detail__chapter-icon">{{ CATEGORY_ICON[restaurant.categoryId] }}</span>
        {{ restaurant.categoryName }} · {{ CATEGORY_EN[restaurant.categoryId] }}
      </span>

      <h2 class="detail__title">{{ restaurant.name }}</h2>
      <div class="detail__coords">
        {{ restaurant.area === "CBD" ? "Sydney CBD" : "Inner Suburbs" }} —
        {{ restaurant.coordinates.lat.toFixed(4) }}°, {{ restaurant.coordinates.lng.toFixed(4) }}°
      </div>

      <div class="detail__meta">
        <div class="detail__meta-item price">
          <span class="lbl">Price</span>
          <span class="val">{{ restaurant.priceRange }}</span>
        </div>
        <div class="detail__meta-item">
          <span class="lbl">Area</span>
          <span class="val">{{ restaurant.area }}</span>
        </div>
        <div class="detail__meta-item">
          <span class="lbl">Chapter</span>
          <span class="val">{{ restaurant.categoryName }}</span>
        </div>
      </div>

      <p class="detail__summary">{{ restaurant.summary }}</p>

      <div class="detail__block">
        <div class="detail__section-label">記 · The Note</div>
        <p class="detail__desc">{{ restaurant.description }}</p>
      </div>

      <div v-if="restaurant.recommendations?.length" class="detail__block">
        <div class="detail__section-label">推薦 · Recommended</div>
        <div class="detail__recs">
          <span v-for="(rec, i) in restaurant.recommendations" :key="i" class="rec-chip">{{
            rec
          }}</span>
        </div>
      </div>

      <div class="detail__actions">
        <a
          v-if="restaurant.googleMapsLink"
          class="btn"
          :href="restaurant.googleMapsLink"
          target="_blank"
          rel="noreferrer"
          >Open in Maps ↗</a
        >
        <span v-else class="btn is-disabled">No map link</span>
      </div>
    </div>
  </div>
</template>
