<template>
  <UPageCard
    :description="restaurant.summary"
    class="cursor-pointer"
    @click="emit('select')"
  >
    <template #title>
      {{ restaurant.name }}
    </template>

    <template #headline>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: restaurant.categoryColor }" />
        <span class="text-xs text-gray-400 uppercase tracking-wide">{{ restaurant.area }} · {{ restaurant.categoryName }}</span>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-2">
        <UCollapsible v-if="restaurant.description" @click.stop>
          <UButton
            class="group"
            label="詳細介紹"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-chevron-right"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-90 transition-transform duration-200' }"
          />
          <template #content>
            <p class="text-sm text-gray-500 pt-1">{{ restaurant.description }}</p>
          </template>
        </UCollapsible>
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
}>()

const emit = defineEmits<{
  select: []
}>()

</script>
