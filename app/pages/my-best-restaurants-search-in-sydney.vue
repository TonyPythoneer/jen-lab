<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/useRestaurants";

useSeoMeta({
  title: "Best Restaurants in Sydney — Jen Lab",
  description:
    "120+ restaurants logged across Sydney. Personal visits only — no scraped reviews, no SEO bait.",
  ogTitle: "Best Restaurants in Sydney — Jen Lab",
  ogDescription: "120+ restaurants logged across Sydney. Personal visits only.",
});

const {
  selectedArea,
  selectedCategoryId,
  searchedName,
  selectedRestaurantId,
  isReady,
  categories,
  restaurantAreaSet,
  filteredRestaurantList,
  selectedRestaurant,
  clearFilters,
} = useRestaurants();

const showMobileMap = ref(false);
const mapReady = ref(false);

const hasActiveFilter = computed(
  () => !!(selectedArea.value || selectedCategoryId.value || searchedName.value),
);

const areaList = computed(() => [...restaurantAreaSet.value].sort((a, b) => a.localeCompare(b)));

const categoryOptions = computed(() =>
  categories.value.map((c) => ({ label: c.name, value: c.id })),
);

function selectRestaurant(r: EnrichedRestaurant) {
  selectedRestaurantId.value = selectedRestaurantId.value === r.id ? null : r.id;
}

function unselectRestaurant() {
  selectedRestaurantId.value = null;
}

// Selected restaurant pinned to top of list
const sortedList = computed<EnrichedRestaurant[]>(() => {
  const list = filteredRestaurantList.value;
  const sel = selectedRestaurant.value;
  if (!sel) return list;
  return [sel, ...list.filter((r) => r.id !== sel.id)];
});

const resultLabel = computed(() => {
  const n = filteredRestaurantList.value.length;
  return n === 1 ? "1 間餐廳" : `${n} 間餐廳`;
});
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="min-h-screen flex flex-col justify-center pt-[var(--site-header-h)]">
      <div class="container mx-auto max-w-[1200px] px-4 pt-6 pb-0">
        <div
          class="bg-ash-white rounded-card overflow-hidden relative min-h-[220px] flex items-stretch"
        >
          <!-- Left: copy -->
          <div class="flex-1 p-8 md:p-12 flex flex-col justify-between gap-6 relative z-10">
            <div class="space-y-3">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.18em] text-abyssal-ink/40 select-none"
              >
                Sydney · Personal Log
              </p>
              <h1
                class="font-display text-5xl md:text-7xl text-abyssal-ink leading-[0.94] tracking-[0.02em] text-wrap-balance"
              >
                Sydney's Best Plates.
              </h1>
              <p class="text-abyssal-ink/60 text-base max-w-sm">
                120+ restaurants. 11 suburbs. Every entry is a personal visit — no scraped reviews,
                no SEO bait.
              </p>
            </div>

            <!-- Stats chips -->
            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-1.5 bg-abyssal-ink/6 rounded-full px-3 py-1.5 text-xs font-medium text-abyssal-ink/70"
              >
                <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                120+ logged
              </span>
              <span
                class="inline-flex items-center gap-1.5 bg-abyssal-ink/6 rounded-full px-3 py-1.5 text-xs font-medium text-abyssal-ink/70"
              >
                <UIcon name="i-lucide-map" class="w-3 h-3" />
                11 suburbs
              </span>
              <span
                class="inline-flex items-center gap-1.5 bg-digital-orange/10 rounded-full px-3 py-1.5 text-xs font-medium text-digital-orange"
              >
                <UIcon name="i-lucide-star" class="w-3 h-3" />
                Personal picks only
              </span>
            </div>
          </div>

          <!-- Right: decorative bridge SVG -->
          <div
            class="hidden md:flex items-end justify-end w-72 shrink-0 pr-2 opacity-30 pointer-events-none select-none"
            aria-hidden="true"
          >
            <HomeHarbourBridgeSvg class="w-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- Split layout: list (left) + map (right) -->
    <div class="lg:flex lg:items-start">
      <!-- Left: filter + list -->
      <div class="lg:w-1/2 xl:w-[55%]">
        <!-- Sticky filter bar -->
        <div
          class="sticky top-16 z-30 bg-basalt-canvas/90 backdrop-blur-sm border-b border-abyssal-ink/8 py-3 px-4"
        >
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Search -->
            <div class="relative flex-1 min-w-[160px] max-w-[240px]">
              <UIcon
                name="i-lucide-search"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-abyssal-ink/30 pointer-events-none"
              />
              <input
                v-model="searchedName"
                type="search"
                placeholder="搜尋餐廳…"
                class="w-full h-9 pl-8 pr-3 text-sm bg-ash-white rounded-full border border-abyssal-ink/12 text-abyssal-ink placeholder:text-abyssal-ink/30 focus:outline-none focus:border-cyber-violet/50 focus:ring-2 focus:ring-cyber-violet/20 transition-[border-color,box-shadow] duration-150"
              />
            </div>

            <!-- Area pills (scrollable row) -->
            <div class="relative flex-1 min-w-0">
              <div
                class="area-pill-fade pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
              />
              <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pr-6">
                <button
                  class="shrink-0 h-9 px-3 rounded-full text-xs font-medium transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96] cursor-pointer"
                  :class="
                    selectedArea === null
                      ? 'bg-cyber-violet text-pure-white shadow-sm'
                      : 'bg-ash-white text-abyssal-ink/60 hover:bg-abyssal-ink/6'
                  "
                  @click="selectedArea = null"
                >
                  全區
                </button>
                <button
                  v-for="area in areaList"
                  :key="area"
                  class="shrink-0 h-9 px-3 rounded-full text-xs font-medium transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96] cursor-pointer"
                  :class="
                    selectedArea === area
                      ? 'bg-cyber-violet text-pure-white shadow-sm'
                      : 'bg-ash-white text-abyssal-ink/60 hover:bg-abyssal-ink/6'
                  "
                  @click="selectedArea = area"
                >
                  {{ area }}
                </button>
              </div>
            </div>

            <!-- Category select -->
            <select
              v-model="selectedCategoryId"
              class="category-select h-9 pl-3 pr-7 rounded-full text-xs font-medium bg-ash-white border border-abyssal-ink/12 text-abyssal-ink/70 focus:outline-none focus:border-cyber-violet/50 focus:ring-2 focus:ring-cyber-violet/20 transition-[border-color,box-shadow] duration-150 cursor-pointer appearance-none"
            >
              <option :value="null">所有料理</option>
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <!-- Clear -->
            <Transition name="fade-clear">
              <button
                v-if="hasActiveFilter"
                class="h-9 px-3 rounded-full text-xs font-medium text-digital-orange bg-digital-orange/8 hover:bg-digital-orange/15 transition-[background-color] duration-150 active:scale-[0.96] cursor-pointer shrink-0"
                @click="clearFilters"
              >
                清除
              </button>
            </Transition>
          </div>
        </div>

        <!-- Result count + list -->
        <div class="px-4 pt-5 pb-10 space-y-3">
          <div class="flex items-center justify-between">
            <p
              class="text-xs font-semibold uppercase tracking-[0.12em] text-abyssal-ink/40 tabular-nums"
            >
              <template v-if="isReady">{{ resultLabel }}</template>
              <template v-else>載入中…</template>
            </p>
            <p v-if="selectedRestaurant" class="text-xs text-abyssal-ink/40">已選取 · 地圖已定位</p>
          </div>

          <!-- Loading skeleton -->
          <template v-if="!isReady">
            <div
              v-for="i in 6"
              :key="i"
              class="bg-ash-white rounded-[20px] h-28 animate-pulse"
              :style="{ animationDelay: `${i * 80}ms` }"
            />
          </template>

          <!-- Restaurant cards -->
          <TransitionGroup v-else tag="div" name="list" class="space-y-3">
            <RestaurantCard
              v-for="r in sortedList"
              :key="r.id"
              :restaurant="r"
              :selected="r.id === selectedRestaurantId"
              @select="selectRestaurant(r)"
            />
          </TransitionGroup>

          <!-- Empty state -->
          <div
            v-if="isReady && sortedList.length === 0"
            class="bg-ash-white rounded-[20px] p-10 text-center space-y-2"
          >
            <p class="font-display text-3xl text-abyssal-ink/20">沒有結果</p>
            <p class="text-sm text-abyssal-ink/40">試試其他關鍵字或清除篩選條件</p>
            <button
              class="mt-2 text-xs font-medium text-cyber-violet hover:underline cursor-pointer"
              @click="clearFilters"
            >
              清除篩選
            </button>
          </div>
        </div>
      </div>

      <!-- Right: sticky map -->
      <div
        class="hidden lg:block lg:w-1/2 xl:w-[45%] sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden"
      >
        <ClientOnly>
          <MapView
            v-model:ready="mapReady"
            :restaurants="filteredRestaurantList"
            :selected-restaurant="selectedRestaurant"
            @select="selectRestaurant"
            @unpin="unselectRestaurant"
          />
          <template #fallback>
            <div class="w-full h-full bg-ash-white flex items-center justify-center">
              <p class="text-abyssal-ink/30 text-sm">地圖載入中…</p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Mobile: floating map/list toggle -->
    <Transition name="fab">
      <button
        v-if="isReady"
        class="fixed bottom-6 right-6 z-50 lg:hidden flex items-center gap-2 h-12 px-5 bg-abyssal-ink text-pure-white rounded-full shadow-lg text-sm font-medium active:scale-[0.96] transition-[transform,box-shadow] duration-150 cursor-pointer"
        @click="showMobileMap = !showMobileMap"
      >
        <UIcon :name="showMobileMap ? 'i-lucide-list' : 'i-lucide-map'" class="w-4 h-4 shrink-0" />
        {{ showMobileMap ? "列表" : "地圖" }}
      </button>
    </Transition>

    <!-- Mobile map overlay -->
    <Transition name="slide-up">
      <div
        v-if="showMobileMap"
        class="fixed inset-0 z-40 lg:hidden bg-basalt-canvas"
        style="top: 4rem"
      >
        <ClientOnly>
          <MapView
            v-model:ready="mapReady"
            :restaurants="filteredRestaurantList"
            :selected-restaurant="selectedRestaurant"
            @select="selectRestaurant"
            @unpin="unselectRestaurant"
          />
        </ClientOnly>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Area pill row: right-side fade hint */
.area-pill-fade {
  background: linear-gradient(to right, transparent, var(--color-basalt-canvas));
}

/* Category select custom chevron */
.category-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23070607' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

/* Scrollable pill row: hide scrollbar */
.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Clear button fade */
.fade-clear-enter-active,
.fade-clear-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fade-clear-enter-from,
.fade-clear-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* List card stagger */
.list-move,
.list-enter-active,
.list-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}

/* FAB enter/exit */
.fab-enter-active,
.fab-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

/* Mobile map slide up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.2, 0, 0, 1),
    opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
