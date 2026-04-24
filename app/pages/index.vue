<template>
  <UPage>
    <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5">

      <HomeProfile :profile="home.profile" :contacts="contacts" />

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

      <Transition name="fade">
        <button
          v-if="showScrollTop"
          class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center hover:bg-teal-600 transition-colors"
          @click="scrollToTop"
        >
          <UIcon name="i-lucide-chevron-up" class="w-5 h-5" />
        </button>
      </Transition>

    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
const { contacts, pages } = useAppConfig()
const home = pages.home

const showScrollTop = ref(false)
const onScroll = () => { showScrollTop.value = window.scrollY > 200 }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

useHead({ title: '榛知' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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
