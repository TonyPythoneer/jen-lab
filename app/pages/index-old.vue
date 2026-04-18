<template>
  <div class="app-container">
    <header class="header">
      <div class="header-left">
        <span class="header-icon">🗺️</span>
        <h1 class="header-title">戰略雪梨美食地圖</h1>
      </div>
      <div class="category-filters">
        <button
          class="filter-btn"
          :class="{ active: selectedCategory === null }"
          @click="selectedCategory = null"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="filter-btn"
          :class="{ active: selectedCategory === cat.id }"
          :style="selectedCategory === cat.id ? { background: cat.color, borderColor: cat.color, color: 'white' } : { borderColor: cat.color }"
          @click="selectedCategory = cat.id"
        >
          <span class="dot" :style="{ background: cat.color }" />
          {{ cat.name }}
        </button>
      </div>
    </header>

    <main class="main">
      <aside class="sidebar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋餐廳..."
            class="search-input"
          />
        </div>
        <div class="list">
          <div
            v-for="landmark in filteredLandmarks"
            :key="landmark.id"
            class="list-item"
            :class="{ selected: selectedId === landmark.id }"
            :style="selectedId === landmark.id ? { borderLeft: `4px solid ${getCategoryColor(landmark.category)}` } : {}"
            @click="selectLandmark(landmark)"
          >
            <span
              class="item-category"
              :style="{ color: getCategoryColor(landmark.category) }"
            >
              CBD • {{ getCategoryName(landmark.category) }}
            </span>
            <h3 class="item-name">{{ landmark.name }}</h3>
            <p class="item-desc">{{ landmark.summary }}</p>
            <div
              class="item-tags"
              :style="{
                background: getCategoryColor(landmark.category) + '15',
                color: getCategoryColor(landmark.category),
              }"
            >
              推薦：{{ landmark.recommendations.join('、') }}
            </div>
          </div>
          <div v-if="filteredLandmarks.length === 0" class="empty">
            沒有符合的結果
          </div>
        </div>
      </aside>

      <div class="map-container">
        <ClientOnly>
          <MapView
            :landmarks="filteredLandmarks"
            :categories="categories"
            :selected-id="selectedId"
            @select="selectLandmark"
          />
        </ClientOnly>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import data from '@/assets/data/landmarks.json'

const categories = data.categories
const landmarks = data.landmarks

const selectedCategory = ref<string | null>(null)
const selectedId = ref<string | null>(null)
const searchQuery = ref('')

const filteredLandmarks = computed(() => {
  return landmarks.filter((l) => {
    const matchCat = selectedCategory.value === null || l.category === selectedCategory.value
    const matchSearch =
      !searchQuery.value ||
      l.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      l.description.includes(searchQuery.value) ||
      l.recommendations.some((r) => r.includes(searchQuery.value))
    return matchCat && matchSearch
  })
})

function getCategoryColor(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.color ?? '#666'
}

function getCategoryName(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId
}

function selectLandmark(landmark: typeof landmarks[number]) {
  selectedId.value = landmark.id
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8f9fa;
}

.header {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e8eaed;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 20;
  flex-shrink: 0;
  overflow-x: auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-icon {
  font-size: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.category-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex-shrink: 0;
}

.filter-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid #e8eaed;
  background: white;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.filter-btn.active {
  background: #1a1a2e;
  color: white;
  border-color: #1a1a2e;
}

.filter-btn:hover:not(.active) {
  border-color: #aaa;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 360px;
  background: white;
  border-right: 1px solid #e8eaed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  font-size: 14px;
  background: #f8f9fa;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #aaa;
  background: white;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 16px;
}

.list-item {
  padding: 14px;
  cursor: pointer;
  border-radius: 10px;
  border-bottom: 1px solid #f0f0f0;
  border-left: 4px solid transparent;
  transition: all 0.15s;
  margin-bottom: 2px;
}

.list-item:hover {
  background: #f8f9fa;
}

.list-item.selected {
  background: #fafafa;
}

.item-category {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 4px 0 4px;
  line-height: 1.3;
}

.item-desc {
  font-size: 12px;
  color: #777;
  margin: 0 0 8px;
  font-style: italic;
  line-height: 1.5;
}

.item-tags {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.empty {
  padding: 40px 0;
  text-align: center;
  color: #aaa;
  font-size: 14px;
}

.map-container {
  flex: 1;
  position: relative;
  z-index: 0;
}
</style>
