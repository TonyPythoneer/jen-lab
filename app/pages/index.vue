<template>
  <!--
    flex-col = mobile vertical stack
    sm:flex-row = desktop horizontal row
  -->
  <div class="flex flex-col sm:flex-row min-h-screen">
    <HomeToc :links="navLinks" :title="currentProfileLabel" />

    <!-- Main content: offset top on mobile, offset left on desktop -->
    <div class="flex-1 flex justify-center sm:pt-0 sm:pl-36">
      <div class="w-full max-w-lg px-4 sm:px-8 flex flex-col gap-5">

        <UTabs
          v-model="currentProfile"
          :items="profileTabs"
          size="sm"
          class="pt-2"
        />

        <HomeProfile v-if="page" id="profile" :profile="page.profile" :contacts="contacts" />

        <HomeContentBody
          v-if="page"
          :page="page"
          :show="isReady"
        />
      </div>
    </div>
  </div>

  <ScrollToTopButton />
</template>

<script setup lang="ts">
import type { ContentTocLink } from '@nuxt/ui'

const titleByProfile = {
  'jen-knows': '榛知 | NextSteps Academy',
  'jen-liu': '榛知 | 澳洲旅遊作家',
} as const
type ProfileKey = keyof typeof titleByProfile
const currentProfile = ref<ProfileKey>('jen-knows')
useHead({ title: () => titleByProfile[currentProfile.value] })

const profileTabs: { label: string; value: ProfileKey }[] = [
  { label: 'Jen Knows', value: 'jen-knows' },
  { label: 'Jen Liu', value: 'jen-liu' },
]

const { contacts } = useAppConfig()

const { data: page } = await useAsyncData(
  'home',
  () => queryCollection('home').path(`/home/${currentProfile.value}`).first(),
  { watch: [currentProfile] }
)

const currentProfileLabel = computed(
  () => profileTabs.find(t => t.value === currentProfile.value)?.label ?? ''
)

const navLinks = computed<ContentTocLink[]>(() => [
  { id: 'profile', text: 'Profile', depth: 2 },
  ...(page.value?.sections ?? []).map(s => ({ id: s.id, text: s.label, depth: 1 })),
])

const isReady = ref(false)

onMounted(() => { isReady.value = true })

const nuxtApp = useNuxtApp()
watch(navLinks, async () => {
  await nextTick()
  await nuxtApp.callHook('page:transition:finish')
})

</script>

