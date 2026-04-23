<template>
  <UPage>
    <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5">

      <!-- Profile -->
      <!-- TODO: move avatarBannerColor (rgb(107, 187, 224)) to app.config.ts -->
      <div class="flex flex-col items-center gap-3 text-center">
        <!-- Card-style banner: rectangular top color block, avatar overlapping the boundary -->
        <div class="relative w-full flex flex-col items-center">
          <div class="w-full h-20 rounded-t-xl" style="background-color: rgb(107, 187, 224);" />
          <img src="/home/avatar.webp" alt="榛知" class="absolute top-6 w-28 h-28 rounded-full object-cover border-3 border-white shadow" />
          <div class="mt-16" />
        </div>
        <h1 class="text-xl font-bold text-gray-800">榛知</h1>
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          variant="link"
          size="sm"
          class="w-full"
        />
        <p class="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-line">{{ bios[tabItems[activeTab]?.label ?? tabItems[0]!.label] }}</p>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full border-teal-400 text-teal-600 hover:bg-teal-50"
        >
          訂閱電子報
        </UButton>
      </div>

      <!-- Social Links -->
      <div class="flex justify-center gap-4">
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

      <USeparator />

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
const { contacts } = useAppConfig()

const tabItems = [{ label: 'NextSteps Academy' }, { label: 'Jen Knows' }]
const activeTab = ref(0)

const bios: Record<string, string> = {
  'NextSteps Academy': `陪你找到職涯的下一步
🇦🇺 澳洲求職培訓 | 資源 | 職場人脈
✍️ 澳洲企業商模分析系列，每週四於 Facebook, IG, Instragram 更新
📅 預約職涯諮詢 📒購買澳洲職場指南`,
  'Jen Knows': `Hi 我是Jen，一個15歲隻身來到澳洲求學，之後走過技術移民、求職、轉職道路，跌跌撞撞也沒放棄的女子

因為知道路途的艱辛，在職涯穩定後，開始分享澳洲知識、職場經驗，致力於幫助更多人在澳洲順利求職、快速融入澳洲生活。`,
}

useHead({ title: '榛知 — 澳洲生活・職場・移民' })
</script>
