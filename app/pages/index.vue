<template>
  <div class="flex flex-col sm:flex-row min-h-screen">
    <!-- flex-col = mobile vertical stack | sm:flex-row = desktop horizontal row -->

    <!-- Nav: top on mobile, left sidebar on sm+ -->
    <ClientOnly>
      <aside
        class="sticky top-0 sm:fixed z-40 transition-all duration-200"
        :class="[
          // mobile: top bar full width
          'top-0 left-0 w-full sm:w-auto',
          // desktop: left sidebar full height
          'sm:h-full sm:flex-col sm:pt-4',
          // desktop width
          'sm:w-36',
          // layout direction
          'flex sm:flex-col',
          'border-b border-gray-200 sm:border-none',
          'bg-[rgb(248,248,248)] sm:bg-transparent'
        ]"
      >
        <!-- Hamburger: mobile top-left, desktop top of sidebar -->
        <UButton
          :icon="navOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          variant="ghost"
          color="neutral"
          class="sm:hidden px-4.5 self-center shrink-0 mt-2 ml-1"
          @click="navOpen = !navOpen"
        />

        <!-- Tree: dropdown on mobile, sidebar on desktop -->
        <Transition name="fade">
          <div
            v-show="navOpen"
            class="
              absolute top-full left-0 w-full shadow-lg rounded-md p-2 bg-white
              sm:flex! sm:static sm:shadow-none sm:rounded-none sm:bg-transparent sm:w-auto sm:p-0
              sm:flex-1 sm:flex-col sm:justify-center
            "
          >
            <UTree
              :model-value="activeSection"
              :items="navItems"
              class="px-2"
              @update:model-value="onNavSelect"
            />
          </div>
        </Transition>
      </aside>
    </ClientOnly>

    <!-- Main content: offset top on mobile, offset left on desktop -->
    <div
      class="flex-1 flex justify-center sm:pt-0 sm:pl-36"
    >
      <div class="max-w-lg px-4 sm:px-8 flex flex-col gap-5">

        <div :id="profileSection.id" />
        <HomeProfile :profile="pages.home.profile" :contacts="contacts" />

        <CollapsibleSeparator :id="portalsSection.id" :label="portalsSection.display" :default-open="true">
          <HomeItem
            v-for="item in pages.home.items"
            :key="item.to"
            v-bind="item"
          />
        </CollapsibleSeparator>

        <CollapsibleSeparator :id="videosSection.id" :label="videosSection.display" :default-open="true">
          <HomeYoutubeCarousel :videos="pages.home.videos" />
        </CollapsibleSeparator>

        <CollapsibleSeparator :id="productsSection.id" :label="productsSection.display" :default-open="true">
          <HomeProductCard :product="pages.home.product" />
          <HomeProductCard :product="pages.home.productTaiwanTravelProduct" />
        </CollapsibleSeparator>
      </div>
    </div>
  </div>

  <!-- Scroll to top -->
  <Transition name="fade">
    <button
      v-if="showScrollTop"
      class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white text-black border-2 border-black shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
      @click="scrollToTop"
    >
      <UIcon name="i-lucide-chevron-up" class="w-7 h-7" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
const { contacts, pages } = useAppConfig()

const NAV_SECTIONS = [
  { id: 'profile',  display: 'Profile' },
  { id: 'portals',  display: 'Portals' },
  { id: 'videos',   display: 'Videos' },
  { id: 'products', display: 'Products' },
] as const
const [profileSection, portalsSection, videosSection, productsSection] = NAV_SECTIONS
const navItems = NAV_SECTIONS.map(({ id, display }) => ({ value: id, label: display }))

const navOpen = ref(false)
const activeSection = ref<typeof navItems[number] | undefined>(undefined)

function onNavSelect(item: { label: string; value: string } | undefined) {
  if (!item) return
  document.getElementById(item.value)?.scrollIntoView({ behavior: 'smooth' })
}

// IntersectionObserver to highlight active section
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      console.log(entries)
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const found = navItems.find(i => i.value === entry.target.id)
          if (found) activeSection.value = found
        }
      }
    },
    { threshold: 0.3 }
  )

  for (const item of NAV_SECTIONS) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }

  onUnmounted(() => observer.disconnect())
})

const showScrollTop = computed(() => activeSection.value?.value !== profileSection.id)
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

useHead({ title: '榛知' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>