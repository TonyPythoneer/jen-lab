<template>
  <UPage>
    <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5">

      <!-- Profile -->
      <!-- TODO: move avatarBannerColor (rgb(107, 187, 224)) to app.config.ts -->
      <div class="flex flex-col gap-3 rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden pb-4 bg-white">
        <!-- Banner + avatar + button -->
        <!-- TODO: move avatarBannerColor (rgb(107, 187, 224)) to app.config.ts -->
        <div class="relative w-full">
          <div class="absolute top-0 left-0 w-full h-28" style="background-color: rgb(107, 187, 224);" />
          <div class="relative flex items-end justify-between px-6 pt-14 pb-0">
            <div class="flex items-end gap-3">
              <img :src="home.avatarLink" :alt="home.name"
                class="w-28 h-28 rounded-full object-cover border-3 border-white shadow" />
              <h1 class="text-xl font-bold text-gray-800 pl-2">{{ home.name }}</h1>
            </div>
            <UButton color="neutral" variant="outline" size="sm" class="border-gray-300 text-gray-700 hover:bg-gray-50 mb-0">
              ☆ 訂閱電子報
            </UButton>
          </div>
        </div>
        <div class="px-6 flex flex-col gap-3">
          <UTabs
            v-model="activeTab"
            :items="tabItems"
            variant="link"
            size="sm"
            class="w-full"
          />
          <p class="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-line">{{ bios[activeTab] }}</p>
          <!-- Social Links -->
          <div class="flex justify-center gap-4 py-2">
            <a
              v-for="contact in contacts"
              :key="contact.label"
              :href="contact.url"
              :aria-label="contact.label"
              v-bind="contact.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener' }"
              :class="`text-gray-500 ${contact.hoverClass} transition-colors`"
            >
              <UIcon :name="contact.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>


      <!-- Featured Product -->
      <UCard class="bg-teal-400 text-white overflow-hidden">
        <div class="flex flex-col gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider opacity-80">精選商品</p>
            <h2 class="text-lg font-bold mt-1">澳洲職場指南 2.0</h2>
            <p class="text-sm opacity-90 mt-1">48 章節 · 7 大主題，全面解析澳洲職場文化</p>
          </div>
          <p class="text-2xl font-bold">NT$ 1,590</p>
          <div class="flex gap-2">
            <button class="flex-1 rounded-full bg-white text-teal-700 font-semibold text-sm py-1.5 px-4 hover:bg-teal-50 transition-colors">
              立即購買
            </button>
            <button class="flex-1 rounded-full border border-white text-white text-sm py-1.5 px-4 hover:bg-white/20 transition-colors">
              已購買？登入
            </button>
          </div>
        </div>
      </UCard>

      <!-- CTA Cards -->
      <UCard class="hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-calendar" class="w-5 h-5 text-teal-600" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-800 text-sm">職涯諮詢預約</p>
            <p class="text-xs text-gray-500 mt-0.5">一對一職涯規劃，找到在澳洲的方向</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
        </div>
      </UCard>

      <UCard class="hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-teal-600" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-800 text-sm">AI 職涯探索工具 <UBadge color="info" variant="subtle" size="xs" class="ml-1">免費 Beta</UBadge></p>
            <p class="text-xs text-gray-500 mt-0.5">限時免費，探索最適合你的澳洲職涯路線</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
        </div>
      </UCard>

      <UCard class="hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-newspaper" class="w-5 h-5 text-teal-600" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-800 text-sm">部落格文章</p>
            <p class="text-xs text-gray-500 mt-0.5">澳洲生活、移民、職場第一手資訊</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
        </div>
      </UCard>

      <!-- Food Map Link -->
      <UCard class="hover:shadow-md transition-shadow cursor-pointer" @click="$router.push('/my-best-restaurants-search-in-sydney')">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-teal-600" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-800 text-sm">榛知雪梨美食地圖</p>
            <p class="text-xs text-gray-500 mt-0.5">精選雪梨餐廳，找到你的下一頓好飯</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
        </div>
      </UCard>

    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
const { contacts, pages } = useAppConfig()
const home = pages.home

const tabItems = home.tabs.map(t => ({ label: t.label, value: t.label }))
const activeTab = ref(tabItems[0]!.value)

const bios = Object.fromEntries(home.tabs.map(t => [t.label, t.bio]))

useHead({ title: '榛知 — 澳洲生活・職場・移民' })
</script>
