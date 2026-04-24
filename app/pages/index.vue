<template>
  <UPage>
    <div class="flex min-h-screen">

      <!-- Nav: top on mobile, left sidebar on sm+ -->
      <aside
        class="fixed z-40 transition-all duration-200"
        :class="[
          // mobile: top bar full width
          'top-0 left-0 w-full sm:w-auto',
          // desktop: left sidebar full height
          'sm:h-full sm:flex-col sm:pt-4',
          // desktop width
          navOpen ? 'sm:w-36' : 'sm:w-10',
          // layout direction
          'flex sm:flex-col',
          'bg-background sm:bg-transparent'
        ]"
      >
        <!-- Hamburger -->
        <UButton
          :icon="navOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          variant="ghost"
          color="neutral"
          class="sm:mb-4 px-4.5 self-start shrink-0 mt-2 sm:mt-0 ml-1 sm:ml-0"
          @click="navOpen = !navOpen"
        />

        <!-- Tree: dropdown on mobile, sidebar on desktop -->
        <Transition name="fade">
          <div
            v-if="navOpen"
            class="
              absolute top-full left-0 w-48 shadow-lg rounded-md p-2 bg-white border border-muted
              sm:static sm:shadow-none sm:rounded-none sm:border-none sm:bg-transparent sm:w-auto sm:p-0
            "
          >
            <UTree
              v-model="activeSection"
              :items="navItems"
              class="px-2"
              @update:model-value="onNavSelect"
            />
          </div>
        </Transition>
      </aside>

      <!-- Main content: offset top on mobile, offset left on desktop -->
      <div
        class="flex-1 flex justify-center pt-12 sm:pt-0"
        :class="navOpen ? 'sm:pl-36' : 'sm:pl-10'"
      >
        <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5 w-full">

          <div id="section-profile" />
          <HomeProfile :profile="pages.home.profile" :contacts="contacts" />

          <CollapsibleSeparator id="section-portals" label="Portals" :default-open="true">
            <HomeItem
              v-for="item in pages.home.items"
              :key="item.to"
              v-bind="item"
            />
          </CollapsibleSeparator>

          <CollapsibleSeparator id="section-videos" label="Videos" :default-open="true">
            <HomeYoutubeCarousel :videos="pages.home.videos" />
          </CollapsibleSeparator>

          <CollapsibleSeparator id="section-products" label="Products" :default-open="true">
            <HomeProductCard :product="pages.home.product" />
            <HomeProductCard :product="pages.home.productTaiwanTravelProduct" />
          </CollapsibleSeparator>

        </UContainer>
      </div>

    </div>

    <!-- Scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center hover:bg-teal-600 transition-colors"
        @click="scrollToTop"
      >
        <UIcon name="i-lucide-chevron-up" class="w-5 h-5" />
      </button>
    </Transition>
  </UPage>
</template>

<script setup lang="ts">
const { contacts, pages } = useAppConfig()

const navOpen = ref(false)
const activeSection = ref<{ label: string; value: string } | undefined>(undefined)

const navItems = [
  { label: 'Profile', value: 'section-profile' },
  { label: 'Portals', value: 'section-portals' },
  { label: 'Videos', value: 'section-videos' },
  { label: 'Products', value: 'section-products' },
]

function onNavSelect(item: { label: string; value: string } | undefined) {
  if (!item) return
  document.getElementById(item.value)?.scrollIntoView({ behavior: 'smooth' })
}

// IntersectionObserver to highlight active section
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const found = navItems.find(i => i.value === entry.target.id)
          if (found) activeSection.value = found
        }
      }
    },
    { threshold: 0.3 }
  )

  for (const item of navItems) {
    const el = document.getElementById(item.value)
    if (el) observer.observe(el)
  }

  window.addEventListener('scroll', onScroll)

  onUnmounted(() => {
    observer.disconnect()
    window.removeEventListener('scroll', onScroll)
  })
})

const showScrollTop = ref(false)
const onScroll = () => { showScrollTop.value = window.scrollY > 200 }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

useHead({ title: '榛知' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
