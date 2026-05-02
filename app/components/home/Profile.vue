<template>
  <!-- Profile card. Sky-blue banner sits behind the avatar, which overlaps it via pt-14 offset. -->
  <!-- Outer wrapper allows sprite girls to overflow the card edges -->
  <div class="relative">
    <!-- Camera girl (right half of sprite) → left edge, slides inward on scroll past -->
    <div
      class="absolute top-1/2 left-0 -z-10 pointer-events-none max-sm:hidden"
      :style="{ transform: `translateX(${leftGirlX}px) translateY(-50%)` }"
      style="width:130px;height:168px;background-image:url('/home/jen-on-home-page.h168.png');background-position:-130px 0;background-repeat:no-repeat;background-size:254px 168px"
      aria-hidden="true"
    />
    <!-- Waving girl (left half of sprite) → right edge, slides inward on scroll past -->
    <div
      class="absolute top-1/2 right-0 -z-10 pointer-events-none max-sm:hidden"
      :style="{ transform: `translateX(${rightGirlX}px) translateY(-50%) rotate(-5deg)` }"
      style="width:130px;height:168px;background-image:url('/home/jen-on-home-page.h168.png');background-position:0 0;background-repeat:no-repeat;background-size:254px 168px"
      aria-hidden="true"
    />
    <div class="relative z-10 flex flex-col gap-3 rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden pb-4 bg-[#f7f7f7]">
      <div class="relative w-full">
        <div class="absolute top-0 left-0 w-full h-28 bg-[rgb(107,187,224)] overflow-hidden">
          <!-- Mobile-only sprite placement preview (clipped to banner) -->
          <div
            class="absolute -bottom-18 left-3/8 sm:hidden"
            :style="{ transform: `translateX(-50%) translateY(${bannerGirlY}px) rotate(30deg)` }"
            style="width:130px;height:168px;background-image:url('/home/jen-on-home-page.h168.png');background-position:-130px 0;background-repeat:no-repeat;background-size:254px 168px"
            aria-hidden="true"
          />
          <div
            class="absolute -bottom-18 left-5/8 sm:hidden"
            :style="{ transform: `translateX(-50%) translateY(${bannerGirlY}px) rotate(325deg)` }"
            style="width:130px;height:168px;background-image:url('/home/jen-on-home-page.h168.png');background-position:0 0;background-repeat:no-repeat;background-size:254px 168px"
            aria-hidden="true"
          />
        </div>
        <div class="relative z-10 flex items-end justify-between px-6 pt-14">
          <div class="flex items-end gap-3">
            <img :src="profile.avatar" :alt="profile.name" loading="lazy"
              class="w-28 h-28 rounded-full object-cover border-3 border-white shadow" />
            <h1 class="text-xl font-bold text-gray-800">{{ profile.name }}</h1>
          </div>
          <UButton color="neutral" variant="outline" size="sm" class="border-gray-300 text-gray-700 hover:bg-gray-50" as="a" href="https://jen-nextsteps.kit.com/60463af80d" target="_blank" rel="noopener">
            <UIcon name="i-lucide-rss" /> 訂閱電子報
          </UButton>
        </div>
      </div>
      <div class="relative z-10 px-6 flex flex-col gap-3">
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          variant="link"
          size="sm"
          class="w-full tabs-profile"
        />
        <p class="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-line">{{ activeBio }}</p>
        <USeparator label="Contacts" />
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
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  profile: {
    avatar: string
    name: string
    tabs: { label: string; bio: string }[]
  }
  contacts: {
    label: string
    url: string
    icon: string
    hoverClass: string
  }[]
}>()

const tabItems = computed(() =>
  props.profile.tabs.map(t => ({ label: t.label, value: t.label })),
)
const activeTab = ref(tabItems.value[0]!.value)
const activeBio = computed(
  () => props.profile.tabs.find(t => t.label === activeTab.value)?.bio ?? '',
)

// Switching profile (e.g. Jen Knows ↔ Jen Liu) replaces the tab list.
// Reset to the first tab when the previously active label no longer exists.
watch(tabItems, (items) => {
  if (!items.some(i => i.value === activeTab.value)) {
    activeTab.value = items[0]!.value
  }
})

// Scroll-driven sprite positions. Both desktop outer pair and mobile banner pair
// are driven by window scrollY. Each pair has its own SCROLL_RANGE for speed control.

// Desktop outer pair: peek at card edges, slide toward center as page scrolls.
const RESTING_LEFT_X = -108
const RESTING_RIGHT_X = 112
const END_LEFT_X = 50
const END_RIGHT_X = -50
const OUTER_GIRL_SCROLL_RANGE = 300

// Mobile banner pair: slide down (clipped by banner overflow-hidden) as page scrolls.
const BANNER_GIRL_END_Y = 120
const BANNER_GIRL_SCROLL_RANGE = 50

// SSR-safe defaults: values at scrollY=0, so first client render matches server output.
const leftGirlX = ref(RESTING_LEFT_X)
const rightGirlX = ref(RESTING_RIGHT_X)
const bannerGirlY = ref(0)

function setupSpriteScroll() {
  const { y: windowScrollY } = useWindowScroll()

  watchEffect(() => {
    const scroll = Math.max(windowScrollY.value, 0)
    const outerProgress = Math.min(scroll / OUTER_GIRL_SCROLL_RANGE, 1)
    const bannerProgress = Math.min(scroll / BANNER_GIRL_SCROLL_RANGE, 1)
    leftGirlX.value = RESTING_LEFT_X + (END_LEFT_X - RESTING_LEFT_X) * outerProgress
    rightGirlX.value = RESTING_RIGHT_X + (END_RIGHT_X - RESTING_RIGHT_X) * outerProgress
    bannerGirlY.value = bannerProgress * BANNER_GIRL_END_Y
  })
}

onMounted(setupSpriteScroll)
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
