<template>
  <!-- Profile card. Sky-blue banner sits behind the avatar, which overlaps it via pt-14 offset. -->
  <div class="flex flex-col gap-3 rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden pb-4 bg-[#f7f7f7]">
    <div class="relative w-full">
      <div class="absolute top-0 left-0 w-full h-28 bg-[rgb(107,187,224)]" />
      <div class="relative flex items-end justify-between px-6 pt-14">
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
    <div class="px-6 flex flex-col gap-3">
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
