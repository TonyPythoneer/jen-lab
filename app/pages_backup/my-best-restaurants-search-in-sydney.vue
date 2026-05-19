<template>
  <!-- Override @nuxt/ui's default container width to 4xl for this page's wider map layout. -->
  <UPage style="--ui-container: var(--container-4xl)">
    <!-- Page is a fixed-height column (search / map / list / footer); only the list scrolls. -->
    <div class="h-dvh flex flex-col overflow-hidden relative">
      <!-- TOP: search input + filter modal trigger -->
      <div class="px-6 py-5 space-y-3 shrink-0">
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchedName"
            class="flex-1"
            placeholder="榛知雪梨美食地圖搜尋引擎"
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
            size="3xl"
            :ui="{ base: 'text-gray-300 font-bold' }"
          >
            <UButton
              icon="i-lucide-sliders-horizontal"
              label="Filters"
              color="neutral"
              variant="outline"
              :disabled="!isDataReady"
              :class="activeFilterCount ? 'text-teal-600 font-bold' : ''"
              @click="filterModalOpen = true"
            />
          </UChip>
        </div>

        <UModal
          v-model:open="filterModalOpen"
          :ui="{ content: 'sm:max-w-2xl max-h-[70dvh] overflow-y-auto' }"
        >
          <template #header>
            <div class="flex items-center justify-between w-full">
              <p class="font-semibold text-gray-300">篩選</p>
              <div class="flex items-center gap-2">
                <button
                  :disabled="!activeFilterCount"
                  class="text-sm transition-colors"
                  :class="
                    activeFilterCount
                      ? 'text-gray-300 hover:text-red-500 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed'
                  "
                  @click="clearFilters"
                >
                  ↺ 重置
                </button>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="sm"
                  @click="filterModalOpen = false"
                />
              </div>
            </div>
          </template>
          <template #body>
            <div class="space-y-4 pb-2">
              <FilterGroup title="地區" :items="areaItems" v-model="selectedArea" />
              <FilterGroup title="類別" :items="categoryItems" v-model="selectedCategoryId" />
            </div>
          </template>
        </UModal>
      </div>

      <!-- MIDDLE: Leaflet map. ClientOnly avoids SSR (Leaflet needs window). -->
      <div class="relative h-72 shrink-0">
        <ClientOnly>
          <MapView
            :restaurants="filteredRestaurantList"
            :selected-restaurant="selectedRestaurant"
            v-model:ready="isMapReady"
            @select="(r) => (selectedRestaurantId = r.id)"
            @unpin="selectedRestaurantId = null"
          />
        </ClientOnly>

        <!-- Loading overlay. 1s leave-delay lets tiles paint in before the spinner fades. -->
        <Transition
          leave-active-class="transition-opacity duration-300 delay-[1000ms] ease-in-out"
          leave-to-class="opacity-0"
        >
          <div
            v-if="!isMapReady && !isDataReady"
            class="absolute inset-0 flex items-center justify-center bg-gray-50"
          >
            <div
              class="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin"
            />
          </div>
        </Transition>
      </div>

      <!-- BOTTOM: scrollable restaurant list. The selected card is pinned at the top via the ref + scrollTo watcher. -->
      <div ref="listEl" class="flex-1 overflow-y-auto">
        <div class="px-6 pt-4 pb-6 flex flex-col gap-3">
          <!-- Pinned card: render the selected restaurant at the top, ring-highlighted. -->
          <RestaurantCard
            v-if="selectedRestaurant"
            :restaurant="selectedRestaurant"
            class="relative ring-2 ring-teal-500"
          />

          <!-- The remaining list, with the pinned card filtered out to avoid duplication. -->
          <template v-for="restaurant in filteredRestaurantList" :key="restaurant.id">
            <RestaurantCard
              v-if="restaurant.id !== selectedRestaurantId"
              :restaurant="restaurant"
              @select="selectedRestaurantId = restaurant.id"
            />
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 px-6 py-3 border-t border-gray-100 flex flex-col items-center gap-1.5">
        <div class="flex items-center gap-3">
          <ContactLinks link-class="text-gray-400" icon-class="w-4 h-4" />
        </div>
        <p class="text-[10px] text-gray-400">
          © {{ new Date().getFullYear() }}
          <a class="hover:text-blue-800" href="https://github.com/TonyPythoneer">tonypythoneer</a> ·
          Data powered by Jen Knows
        </p>
      </div>

      <!-- Dark mode toggle. z-1100 sits above any in-map z-1000 overlays. -->
      <UColorModeButton class="fixed bottom-4 right-4 z-1100" />
    </div>
  </UPage>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "榛知雪梨美食地圖",
  description: "榛知雪梨精選的雪梨美食地圖，可依地區與類別篩選的互動地圖與清單。",
  ogTitle: "榛知雪梨美食地圖",
  ogDescription: "榛知雪梨精選的雪梨美食地圖，可依地區與類別篩選的互動地圖與清單。",
});

const isMapReady = ref(false);
const listEl = ref<HTMLDivElement | null>(null);
const filterModalOpen = ref(false);
const activeFilterCount = computed(
  () => [selectedArea.value, selectedCategoryId.value].filter(Boolean).length,
);

const {
  categories,
  restaurantAreaSet,
  filteredRestaurantList,
  selectedRestaurant,
  selectedArea,
  selectedCategoryId,
  searchedName,
  selectedRestaurantId,
  isReady: isDataReady,
  clearFilters,
} = useRestaurants();

const areaItems = computed(() =>
  [...restaurantAreaSet.value].map((area) => ({ value: area, label: area })),
);
const categoryItems = computed(() =>
  categories.value.map((c) => ({ value: c.id, label: c.name, dotColor: c.color })),
);

watch(selectedRestaurantId, (id) => {
  if (id) nextTick(() => listEl.value?.scrollTo({ top: 0, behavior: "smooth" }));
});
</script>
