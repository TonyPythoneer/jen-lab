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
              <img :src="home.profile.avatarLink" :alt="home.profile.name" loading="lazy"
                class="w-28 h-28 rounded-full object-cover border-3 border-white shadow" />
              <h1 class="text-xl font-bold text-gray-800 pl-2">{{ home.profile.name }}</h1>
            </div>
            <UButton color="neutral" variant="outline" size="sm" class="border-gray-300 text-gray-700 hover:bg-gray-50 mb-0" as="a" href="https://jen-nextsteps.kit.com/60463af80d" target="_blank" rel="noopener">
              <UIcon name="i-heroicons-sparkles" /> 訂閱電子報
            </UButton>
          </div>
        </div>
        <div class="px-6 flex flex-col gap-3">
          <UTabs
            v-model="activeTab"
            :items="tabItems"
            variant="link"
            size="sm"
            class="w-full tabs-profile"
          />
          <p class="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-line">{{ bios[activeTab] }}</p>
          <!-- Social Links -->
          <USeparator label="Contacts" class="px-6" />
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

      <HomeItem
        v-for="item in home.items"
        :key="item.to"
        :to="item.to"
        :icon="item.icon"
        :title="item.title"
        :description="item.description"
      />

    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
const { contacts, pages } = useAppConfig()
const home = pages.home

const tabItems = home.profile.tabs.map(t => ({ label: t.label, value: t.label }))
const activeTab = ref(tabItems[0]!.value)
const bios = Object.fromEntries(home.profile.tabs.map(t => [t.label, t.bio]))

useHead({ title: '榛知' })
</script>

<style scoped>
.tabs-profile :deep([data-slot="indicator"]) {
  height: 4px;
}
.tabs-profile :deep([data-state="active"] [data-slot="label"]) {
  font-size: 14px;
  font-weight: bold;
}
</style>
