<template>
  <UPage>
  <div class="h-dvh flex flex-col overflow-hidden">
    <!-- Top: search/input + filters -->
    <div class="px-6 py-5 space-y-3 flex-shrink-0">
      <div class="flex items-center gap-2">
        <UInput
          v-model="searchedName"
          class="flex-1"
          placeholder="榛知雪梨美食地圖，歡迎搜尋找餐廳"
          icon="i-lucide-search"
          :ui="{ trailing: 'pe-1' }"
        >
          <template v-if="searchedName" #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="searchedName = ''"
            />
          </template>
        </UInput>

        <UChip
          :text="activeFilterCount"
          :show="activeFilterCount > 0"
          color="error"
          size="lg"
        >
          <UButton
            icon="i-lucide-sliders-horizontal"
            label="Filters"
            color="neutral"
            variant="outline"
            :class="activeFilterCount ? 'text-teal-600 font-bold' : ''"
            @click="filterModalOpen = true"
          />
        </UChip>
      </div>

      <UModal v-model:open="filterModalOpen" class="max-w-2xl">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <p class="font-semibold text-gray-300">篩選</p>
            <div class="flex items-center gap-2">
              <button
                :disabled="!activeFilterCount"
                class="text-sm transition-colors"
                :class="activeFilterCount ? 'text-gray-300 hover:text-red-500 cursor-pointer' : 'text-gray-500 cursor-not-allowed'"
                @click="clearFilters"
              >↺ 重置</button>
              <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="sm" @click="filterModalOpen = false" />
            </div>
          </div>
        </template>
        <template #body>
          <div class="space-y-4 pb-2">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">地區</p>
              <div class="grid grid-cols-4 gap-1">
                <FilterItem :active="!selectedArea" label="全部" @click="setAreaFilter(null)" />
                <div /><div /><div />
                <FilterItem
                  v-for="(option, id) in areaOptions"
                  :key="id"
                  :active="selectedArea === id"
                  :label="option.displayName"
                  @click="setAreaFilter(id)"
                />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">類別</p>
              <div class="grid grid-cols-4 gap-1">
                <FilterItem :active="!selectedCategoryId" label="全部" @click="setCategoryIdFilter(null)" />
                <div /><div /><div />
                <FilterItem
                  v-for="(option, id) in categoryOptions"
                  :key="id"
                  :active="selectedCategoryId === id"
                  :label="option.displayName"
                  :dot-color="option.dotColor"
                  @click="setCategoryIdFilter(id)"
                />
              </div>
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <!-- Middle: map -->
    <div class="relative h-96 flex-shrink-0">
      <ClientOnly>
        <MapView
          :restaurants="filteredRestaurantList"
          :selected-id="selectedRestaurantId"
          v-model:ready="isMapReady"
          @select="(r) => (selectedRestaurantId = r.id)"
        />
      </ClientOnly>

      <!-- 放在 MapView 後面，absolute inset-0 自然蓋住地圖 -->
      <Transition
        leave-active-class="transition-opacity duration-300 delay-[1000ms] ease-in-out"
        leave-to-class="opacity-0"
      >
        <div
          v-if="!isMapReady"
          class="absolute inset-0 flex items-center justify-center bg-gray-50"
        >
          <div class="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
        </div>
      </Transition>
    </div>

    <!-- Bottom: filtered restaurantList list -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-6 py-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-widest">景點列表</h2>
      </div>
      <div class="px-6 pb-6 flex flex-col gap-3">
        <UPageCard
          v-for="restaurant in filteredRestaurantList"
          :key="restaurant.id"
          :title="restaurant.name"
          :description="restaurant.summary"
          :class="{ 'ring-2 ring-teal-500': selectedRestaurantId === restaurant.id }"
          class="cursor-pointer"
          @click="selectedRestaurantId = restaurant.id"
        >
          <template #headline>
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ background: restaurant.categoryColor }"
              />
              <span class="text-xs text-gray-400 uppercase tracking-wide">
                {{ restaurant.area }} · {{ restaurant.categoryName }}
              </span>
            </div>
          </template>
          <template v-if="restaurant.recommendations?.length" #footer>
            <div class="flex flex-wrap items-center gap-1">
              <span class="text-xs text-gray-500">★ 推薦：</span>
              <UBadge
                v-for="rec in restaurant.recommendations"
                :key="rec"
                color="neutral"
                variant="subtle"
                size="sm"
              >{{ rec }}</UBadge>
            </div>
          </template>
        </UPageCard>
      </div>
    </div>
  </div>
  </UPage>
</template>

<script setup lang="ts">
type FilterOption = Record<string, { displayName: string; dotColor?: string }>

const selectedRestaurantId = ref<string | null>(null)
const isMapReady = ref(false)
const filterModalOpen = ref(false)
const activeFilterCount = computed(() => [selectedArea.value, selectedCategoryId.value].filter(Boolean).length)

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
  Object.fromEntries(categories.map((c) => [c.id, { displayName: c.name, dotColor: c.color }]))
)
</script>
