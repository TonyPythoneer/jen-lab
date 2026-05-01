<template>
  <!--
    flex-col = mobile vertical stack
    sm:flex-row = desktop horizontal row
  -->
  <div class="flex flex-col sm:flex-row min-h-screen">
    <HomeToc
      :links="navLinks"
      :title="selectedProfile.label"
    />

    <!-- Main content: offset top on mobile, offset left on desktop -->
    <div class="flex-1 flex justify-center sm:pt-0 sm:pl-36">
      <div class="w-full max-w-lg px-4 sm:px-8 flex flex-col gap-5">

        <ClientOnly>
          <Transition name="tab-drop" appear>
            <UTabs
              v-model="selectedProfileKey"
              :items="profileTabs"
              size="sm"
              class="pt-2"
            />
          </Transition>
          <template #fallback>
            <div class="pt-2 h-13" aria-hidden="true" />
          </template>
        </ClientOnly>

        <HomeProfile
          v-if="page" id="profile"
          :profile="page.profile"
          :contacts="contacts"
        />

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

const { contacts } = useAppConfig()

const profiles = {
  'jen-knows': { label: 'Jen Knows', headTitle: '榛知 | NextSteps Academy' },
  'jen-liu': { label: 'Jen Liu', headTitle: '榛知 | 澳洲旅遊作家' },
} as const satisfies Record<string, { label: string; headTitle: string }>
const selectedProfileKey = ref<keyof typeof profiles>('jen-knows')
const selectedProfile = computed(() => profiles[selectedProfileKey.value])
const profileTabs = Object.entries(profiles).map(([value, { label }]) => ({ value, label }))
useHead({ title: () => selectedProfile.value.headTitle })

const { data: page, status } = useLazyAsyncData(
  computed(() => `profile:${selectedProfileKey.value}`),
  () => queryCollection('home').path(`/home/${selectedProfileKey.value}`).first(),
)
const isMounted = useMounted()
const isReady = computed(() => status.value === 'success' && isMounted.value)

const navLinks = computed<ContentTocLink[]>(() => [
  { id: 'profile', text: 'Profile', depth: 2 },
  ...(page.value?.sections ?? []).map(s => ({ id: s.id, text: s.label, depth: 1 })),
])

const nuxtApp = useNuxtApp()
watch(navLinks, async () => {
  await nextTick()
  await nuxtApp.callHook('page:transition:finish')
})
</script>

<style scoped>
.tab-drop-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.tab-drop-enter-from { opacity: 0; transform: translateY(-8px); }
</style>
