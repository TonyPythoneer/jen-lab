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

      <HomeItem
        v-for="item in home.items"
        :key="item.to"
        :to="item.to"
        :icon="item.icon"
        :title="item.title"
        :description="item.description"
      />

      <!-- YouTube Carousel -->
      <HomeYoutubeCarousel :videos="home.videos" />

      <USeparator label="Products" class="px-6" />

      <HomeProductCard
        :banner-image="home.product.bannerImage"
        :title="home.product.title"
        :brief="home.product.brief"
        :description="home.product.description"
        :purchase-url="home.product.purchaseUrl"
        :purchase-label="home.product.purchaseLabel"
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
.product-description :deep(a) {
  color: var(--color-primary-500);
  text-decoration: underline;
}
.product-description :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.product-description :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
