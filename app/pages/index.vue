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

        <ClientOnly>
          <UTabs
            v-model="currentProfile"
            :items="profileTabs"
            size="sm"
            class="pt-2"
          />
          <template #fallback>
            <div class="pt-2 h-13" aria-hidden="true" />
          </template>
        </ClientOnly>

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

const { data: page, status } = useLazyAsyncData(
  'home',
  () => queryCollection('home').path(`/home/${currentProfile.value}`).first(),
  { watch: [currentProfile] }
)

const isDataReady = computed(() => status.value === 'success')

const currentProfileLabel = computed(
  () => profileTabs.find(t => t.value === currentProfile.value)?.label ?? ''
)

const navLinks = computed<ContentTocLink[]>(() => [
  { id: 'profile', text: 'Profile', depth: 2 },
  ...(page.value?.sections ?? []).map(s => ({ id: s.id, text: s.label, depth: 1 })),
])

const isMountedReady = ref(false)
onMounted(() => { isMountedReady.value = true })

const isReady = computed(() => isDataReady.value && isMountedReady.value)

const nuxtApp = useNuxtApp()
watch(navLinks, async () => {
  await nextTick()
  await nuxtApp.callHook('page:transition:finish')
})
</script>
