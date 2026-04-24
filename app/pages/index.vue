<template>
  <UPage>
    <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5">

      <HomeProfile :profile="pages.home.profile" :contacts="contacts" />

      <!-- Portals -->
      <USeparator label="Protals" class="px-6" />
      <HomeItem
        v-for="item in pages.home.items"
        :key="item.to"
        v-bind="item"
      />

      <!-- Videos -->
      <USeparator label="Videos" class="px-6" />
      <HomeYoutubeCarousel :videos="pages.home.videos" />

      <!-- Product -->
      <USeparator label="Products" class="px-6" />
      <HomeProductCard :product="pages.home.product" />
      <HomeProductCard :product="pages.home.productTaiwanTravelProduct" />

      <!-- Else -->
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
</style>
