<template>
  <UPageCard
    class="cursor-pointer"
    @click="emit('select')"
  >
    <template #title>
      {{ restaurant.name }}
    </template>

    <template #header>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: restaurant.categoryColor }" />
        <span class="text-xs text-gray-400 uppercase tracking-wide">{{ restaurant.area }} · {{ restaurant.categoryName }}</span>
      </div>
    </template>

    <template #description>
      <div class="flex items-start gap-1" @click.stop>
        <UCollapsible v-if="restaurant.description" class="group flex-1">
          <div class="flex items-center gap-1">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              leading-icon="i-lucide-chevron-right"
              :ui="{ leadingIcon: 'group-data-[state=open]:rotate-90 transition-transform duration-200', base: 'hover:bg-transparent' }"
            />
            <span class="text-sm text-gray-400">{{ restaurant.summary ?? '' }}</span>
          </div>
          <template #content>
            <p class="text-sm text-gray-400 pt-1 pl-6">{{ restaurant.description }}</p>
          </template>
        </UCollapsible>
        <span v-else class="text-sm text-gray-400">{{ restaurant.summary ?? '' }}</span>
      </div>
    </template>

    <template #footer>
      <div v-if="restaurant.recommendations?.length" class="flex flex-wrap items-center gap-1">
        <span class="text-xs text-gray-400">★ 推薦：</span>
        <UBadge v-for="rec in restaurant.recommendations" :key="rec" color="neutral" variant="subtle" size="sm">{{ rec }}</UBadge>
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import type { EnrichedRestaurant } from '@/composables/useRestaurants'

const props = defineProps<{
  restaurant: EnrichedRestaurant
}>()

const emit = defineEmits<{
  select: []
}>()

</script>
