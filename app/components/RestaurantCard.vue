<template>
  <UPageCard
    :description="restaurant.summary"
    class="cursor-pointer"
    :class="selected ? 'relative ring-2 ring-teal-500' : ''"
    @click="emit('select')"
  >
    <template #title>
      <div class="flex items-center gap-1.5">
        <span>{{ restaurant.name }}</span>
        <a
          v-if="restaurant.googleMapsLink"
          :href="restaurant.googleMapsLink"
          target="_blank"
          rel="noopener"
          class="text-gray-400 hover:text-teal-500 transition-colors"
          @click.stop
        >
          <UIcon name="i-lucide-door-open" class="w-4 h-4" />
        </a>
      </div>
    </template>

    <template #headline>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: restaurant.categoryColor }" />
        <span class="text-xs text-gray-400 uppercase tracking-wide">{{ restaurant.area }} · {{ restaurant.categoryName }}</span>
      </div>
    </template>

    <button
      v-if="selected"
      class="absolute top-2 right-2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
      @click.stop="emit('unpin')"
    >
      <UIcon name="i-lucide-pin-off" class="w-4 h-4" />
    </button>

    <template #footer>
      <div class="flex flex-col gap-2">
        <button
          v-if="restaurant.description"
          class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors w-fit"
          @click.stop="expanded = !expanded"
        >
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3 transition-transform"
            :class="expanded ? 'rotate-90' : ''"
          />
          <span>詳細介紹</span>
        </button>
        <p v-if="expanded" class="text-sm text-gray-500">{{ restaurant.description }}</p>
        <div v-if="restaurant.recommendations?.length" class="flex flex-wrap items-center gap-1">
          <span class="text-xs text-gray-500">★ 推薦：</span>
          <UBadge v-for="rec in restaurant.recommendations" :key="rec" color="neutral" variant="subtle" size="sm">{{ rec }}</UBadge>
        </div>
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import type { EnrichedRestaurant } from '@/composables/useRestaurants'

const props = defineProps<{
  restaurant: EnrichedRestaurant
  selected?: boolean
}>()

const emit = defineEmits<{
  select: []
  unpin: []
}>()

const expanded = ref(false)
</script>
