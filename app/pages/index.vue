<template>
  <UPage>
    <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5">

      <HomeProfile :profile="pages.home.profile" :contacts="contacts" />

      <!-- Portals -->
      <CollapsibleSeparator label="Portals" :default-open="true">
        <HomeItem
          v-for="item in pages.home.items"
          :key="item.to"
          v-bind="item"
        />
      </CollapsibleSeparator>

      <!-- Videos -->
      <CollapsibleSeparator label="Videos" :default-open="true">
        <HomeYoutubeCarousel :videos="pages.home.videos" />
      </CollapsibleSeparator>


      <!-- Product -->
      <CollapsibleSeparator label="Products" :default-open="true">
        <HomeProductCard :product="pages.home.product" />
        <HomeProductCard :product="pages.home.productTaiwanTravelProduct" />
      </CollapsibleSeparator>

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

/* :deep([data-state=open][data-slot=content]) { animation: collapsible-down 0.2s ease-out; }
:deep([data-state=closed][data-slot=content]) { animation: collapsible-up 0.2s ease-out; }

@keyframes collapsible-down {
  from { height: 0; opacity: 0; }
  to { height: var(--reka-collapsible-content-height); opacity: 1; }
}
@keyframes collapsible-up {
  from { height: var(--reka-collapsible-content-height); opacity: 1; }
  to { height: 0; opacity: 0; }
} */
</style>
