<template>
  <UPage>
    <!-- Top: search/input + filters -->
    <div class="px-6 py-5 space-y-3">
      <input
        v-model="searchedName"
        type="text"
        placeholder="搜尋餐廳..."
        class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <div class="flex gap-2 flex-wrap">
        <FilterButton
          label="地區"
          :options="areaOptions"
          :model-value="selectedArea"
          @update:model-value="setAreaFilter"
        />
        <FilterButton
          label="類別"
          :options="categoryOptions"
          :model-value="selectedCategoryId"
          @update:model-value="setCategoryIdFilter"
        />

        <UButton
          v-if="selectedArea || selectedCategoryId"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="clearFilters"
        >
          清除
        </UButton>
      </div>
    </div>


    <!-- Middle: map -->
    <!-- <div class="h-96">
      <ClientOnly>
        <MapView
          :landmarks="filteredRestaurants"
          :selected-id="selectedId"
          @select="(l) => (selectedId = l.id)"
        />
      </ClientOnly>
    </div> -->

    <!-- Bottom: landmark list -->
    <div class="divide-y divide-gray-200">
      <div class="px-6 py-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-widest">景點列表</h2>
      </div>
      <div
        v-for="restaurant in filteredRestaurantList"
        :key="restaurant.id"
        class="px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
        :class="{ 'bg-teal-50': selectedRestaurantId === restaurant.id }"
        @click="selectedRestaurantId = restaurant.id"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            :style="{ background: restaurant.categoryColor }"
          />
          <span class="text-xs text-gray-400 uppercase tracking-wide">
            {{ restaurant.area }} · {{ restaurant.categoryName }}
          </span>
        </div>
        <div class="font-semibold text-gray-800 mt-1">{{ restaurant.name }}</div>
        <div class="text-sm text-gray-500 mt-0.5">{{ restaurant.description }}</div>
      </div>
    </div>
  </UPage>
</template>

<script setup lang="ts">
import type { FilterOption } from '@/components/FilterButton.vue'

const selectedRestaurantId = ref<string | null>(null)

const {
  categories,
  restaurantAreaSet,
  filteredRestaurantList,
  selectedArea,
  selectedCategoryId,
  searchedName,
  setAreaFilter,
  setCategoryIdFilter,
  clearFilters,
} = useRestaurants()

const areaOptions = computed<FilterOption>(() =>
  Object.fromEntries([...restaurantAreaSet].map((a) => [a, { displayName: a }]))
)

const categoryOptions = computed<FilterOption>(() =>
  Object.fromEntries(categories.map((c) => [c.id, { displayName: c.name, color: c.color }]))
)

</script>
