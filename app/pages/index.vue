<template>
  <UPage>
  <div class="h-dvh flex flex-col overflow-hidden relative">
    <!--
      ████████╗ ██████╗ ██████╗
      ╚══██╔══╝██╔═══██╗██╔══██╗
         ██║   ██║   ██║██████╔╝
         ██║   ██║   ██║██╔═══╝
         ██║   ╚██████╔╝██║
         ╚═╝    ╚═════╝ ╚═╝
    -->
    <!-- search engine -->
    <div class="px-6 py-5 space-y-3 flex-shrink-0">
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
                <FilterItem :active="!selectedArea" label="全部" @click="selectedArea = null" />
                <div /><div /><div />
                <FilterItem
                  v-for="(option, id) in areaOptions"
                  :key="id"
                  :active="selectedArea === id"
                  :label="option.displayName"
                  @click="selectedArea = id"
                />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">類別</p>
              <div class="grid grid-cols-4 gap-1">
                <FilterItem :active="!selectedCategoryId" label="全部" @click="selectedCategoryId = null" />
                <div /><div /><div />
                <FilterItem
                  v-for="(option, id) in categoryOptions"
                  :key="id"
                  :active="selectedCategoryId === id"
                  :label="option.displayName"
                  :dot-color="option.dotColor"
                  @click="selectedCategoryId = id"
                />
              </div>
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <!--
      ███╗   ███╗██╗██████╗ ██████╗ ██╗     ███████╗
      ████╗ ████║██║██╔══██╗██╔══██╗██║     ██╔════╝
      ██╔████╔██║██║██║  ██║██║  ██║██║     █████╗
      ██║╚██╔╝██║██║██║  ██║██║  ██║██║     ██╔══╝
      ██║ ╚═╝ ██║██║██████╔╝██████╔╝███████╗███████╗
      ╚═╝     ╚═╝╚═╝╚═════╝ ╚═════╝ ╚══════╝╚══════╝
    -->
    <div class="relative h-72 flex-shrink-0">
      <ClientOnly>
        <MapView
          :restaurants="filteredRestaurantList"
          :selected-restaurant="selectedRestaurant"
          v-model:ready="isMapReady"
          @select="(r) => (selectedRestaurantId = r.id)"
          @unpin="selectedRestaurantId = null"
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

    <!--
      ██████╗  ██████╗ ████████╗████████╗ ██████╗ ███╗   ███╗
      ██╔══██╗██╔═══██╗╚══██╔══╝╚══██╔══╝██╔═══██╗████╗ ████║
      ██████╔╝██║   ██║   ██║      ██║   ██║   ██║██╔████╔██║
      ██╔══██╗██║   ██║   ██║      ██║   ██║   ██║██║╚██╔╝██║
      ██████╔╝╚██████╔╝   ██║      ██║   ╚██████╔╝██║ ╚═╝ ██║
      ╚═════╝  ╚═════╝    ╚═╝      ╚═╝    ╚═════╝ ╚═╝     ╚═╝
    -->
    <!-- filtered restaurant list -->
    <div ref="listEl" class="flex-1 overflow-y-auto">
      <div class="px-6 pt-4 pb-6 flex flex-col gap-3">

        <!-- Selected restaurant pinned at top -->
        <RestaurantCard
          v-if="selectedRestaurant"
          :restaurant="selectedRestaurant"
          class="relative ring-2 ring-teal-500"
        />

        <!-- Rest of the list -->
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
    <div class="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex flex-col items-center gap-1.5">
      <div class="flex items-center gap-3">
        <a href="https://www.facebook.com/jenliuau/" aria-label="Facebook" class="text-gray-400 hover:text-blue-600 transition-colors">
          <UIcon name="i-simple-icons-facebook" class="w-4 h-4" />
        </a>
        <a href="https://www.instagram.com/jenknowsau/" aria-label="Instagram" class="text-gray-400 hover:text-pink-500 transition-colors">
          <UIcon name="i-simple-icons-instagram" class="w-4 h-4" />
        </a>
        <a href="https://www.threads.com/@jenknowsau" aria-label="Threads" class="text-gray-400 hover:text-gray-800 transition-colors">
          <UIcon name="i-simple-icons-threads" class="w-4 h-4" />
        </a>
      </div>
      <p class="text-[10px] text-gray-400">
        © {{ new Date().getFullYear() }} Jen Knows · Made by <a class="hover:text-blue-800" href="https://github.com/TonyPythoneer">tonypythoneer</a>
      </p>
    </div>

    <!-- Dark mode toggle -->
    <UButton
      :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
      color="neutral"
      variant="soft"
      size="sm"
      class="fixed bottom-4 right-4 z-[9999]"
      @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
    />
  </div>
  </UPage>
</template>

<script setup lang="ts">
import type { CategoryId, RestaurantArea } from '@/composables/useRestaurants'

type FilterOption<T extends keyof any> = Record<T, { displayName: string; dotColor?: string }>

const colorMode = useColorMode()
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
  clearFilters,
} = useRestaurants()

watch(selectedRestaurantId, (id) => {
  if (id) nextTick(() => listEl.value?.scrollTo({ top: 0, behavior: 'smooth' }))
})

const areaOptions = computed<FilterOption<RestaurantArea>>(() =>
  Object.fromEntries([...restaurantAreaSet].map((a) => [a, { displayName: a }])) as FilterOption<RestaurantArea>
)

const categoryOptions = computed<FilterOption<CategoryId>>(() =>
  Object.fromEntries(categories.map((c) => [c.id, { displayName: c.name, dotColor: c.color }])) as FilterOption<CategoryId>
)
</script>
