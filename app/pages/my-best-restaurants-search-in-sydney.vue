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

      <UModal v-model:open="filterModalOpen" :ui="{ content: 'sm:max-w-2xl max-h-[70dvh] overflow-y-auto' }">
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
              <!-- "全部" sits alone on row 1; spacer divs push the real items to row 2 of the 4-col grid. -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <FilterItem :active="!selectedArea" label="全部" @click="selectedArea = null" />
                <div /><div /><div />
                <FilterItem
                  v-for="area in restaurantAreaSet"
                  :key="area"
                  :active="selectedArea === area"
                  :label="area"
                  @click="selectedArea = area"
                />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">類別</p>
              <!-- Same row-1 spacer pattern as "地區" above. -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <FilterItem :active="!selectedCategoryId" label="全部" @click="selectedCategoryId = null" />
                <div /><div /><div />
                <FilterItem
                  v-for="category in categories"
                  :key="category.id"
                  :active="selectedCategoryId === category.id"
                  :label="category.name"
                  :dot-color="category.color"
                  @click="selectedCategoryId = category.id"
                />
              </div>
            </div>
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
          <div class="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
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
        <a
          v-for="contact in contacts"
          :key="contact.label"
          :href="contact.url"
          :aria-label="contact.label"
          v-bind="contact.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener' }"
          :class="`text-gray-400 ${contact.hoverClass} transition-colors`"
        >
          <UIcon :name="contact.icon" class="w-4 h-4" />
        </a>
      </div>
      <p class="text-[10px] text-gray-400">
        © {{ new Date().getFullYear() }} <a class="hover:text-blue-800" href="https://github.com/TonyPythoneer">tonypythoneer</a> · Data powered by Jen Knows
      </p>
    </div>

    <!-- Dark mode toggle. z-1100 sits above any in-map z-1000 overlays. -->
    <UColorModeButton
      class="fixed bottom-4 right-4 z-1100"
    />
  </div>
  </UPage>
</template>

<script setup lang="ts">
useHead({
  title: '知雪梨美食地圖'
})

const { contacts } = useAppConfig()

const isMapReady = ref(false)
const listEl = ref<HTMLDivElement | null>(null)
const filterModalOpen = ref(false)
const activeFilterCount = computed(() => [selectedArea.value, selectedCategoryId.value].filter(Boolean).length)

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
} = useRestaurants()

watch(selectedRestaurantId, (id) => {
  if (id) nextTick(() => listEl.value?.scrollTo({ top: 0, behavior: 'smooth' }))
})
</script>
