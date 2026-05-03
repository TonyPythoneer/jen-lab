<template>
  <!-- Two-column layout on sm+ (TOC rail | content). Stacked vertically on mobile (TOC sticky strip on top). -->
  <div class="flex flex-col sm:flex-row min-h-screen">
    <HomeToc
      :links="navLinks"
      :title="selectedProfile.label"
    />

    <!-- Main content column. sm:pl-36 reserves space for the fixed TOC rail; mobile uses 0 left padding. -->
    <div class="flex-1 flex justify-center sm:pt-0 sm:pl-36">
      <div class="w-full max-w-lg px-4 sm:px-8 flex flex-col gap-5">

        <!--
          Profile-switcher tabs animate in on first paint via tab-drop transition.
          ClientOnly + fallback reserves the same height pre-hydration to prevent CLS.
        -->
        <ClientOnly>
          <Transition name="tab-drop" appear>
            <UTabs
              v-model="selectedProfileKey"
              :items="profileTabs"
              size="sm"
              class="pt-5"
            />
          </Transition>
          <template #fallback>
            <div class="pt-2 h-13" aria-hidden="true" />
          </template>
        </ClientOnly>

        <!-- `id="profile"` is the TOC anchor target (see navLinks). -->
        <HomeProfile
          v-if="page"
          id="profile"
          :profile="page.profile"
          :contacts="contacts"
        />

        <!-- `show` gates entry animation until both data is ready and component is mounted. -->
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
import type { Collections } from '@nuxt/content'

const { contacts } = useAppConfig()

const profiles = {
  'jen-knows': { label: 'Jen Knows', headTitle: '榛知 | NextSteps Academy' },
  'jen-liu': { label: 'Jen Liu', headTitle: '榛知 | 澳洲旅遊作家' },
} as const satisfies Record<string, { label: string; headTitle: string }>
type ProfileKey = keyof typeof profiles

const selectedProfileKey = ref<ProfileKey>('jen-knows')
const selectedProfile = computed(() => profiles[selectedProfileKey.value])
const profileTabs = Object.entries(profiles).map(([value, { label }]) => ({ value, label }))
useHead({ title: () => selectedProfile.value.headTitle })

// Pre-fetch every profile once so tab switching is instant. Each query owns its own cache key.
// `satisfies` enforces that all ProfileKeys are present without widening the inferred value types.
const profileQueries = {
  'jen-knows': useLazyAsyncData(
    'profile:jen-knows',
    () => queryCollection('home').path('/home/jen-knows').first(),
  ),
  'jen-liu': useLazyAsyncData(
    'profile:jen-liu',
    () => queryCollection('home').path('/home/jen-liu').first(),
  ),
} satisfies Record<ProfileKey, unknown>

const activeQuery = computed(() => profileQueries[selectedProfileKey.value])
const page = computed(() => activeQuery.value.data.value as Collections['home'] | null)

const isMounted = useMounted()
const isReady = computed(() => activeQuery.value.status.value === 'success' && isMounted.value)

const navLinks = computed<ContentTocLink[]>(() => [
  { id: 'profile', text: 'Profile', depth: 2 },
  ...(page.value?.sections ?? []).map(s => ({ id: s.id, text: s.label, depth: 1 })),
])

// Notify Nuxt UI's TOC that anchor targets have re-rendered, so its scroll-spy
// re-measures section offsets after `navLinks` changes (e.g. profile switch).
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
