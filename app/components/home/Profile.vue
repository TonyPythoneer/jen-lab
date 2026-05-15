<template>
  <!-- Outer wrapper anchors desktop sprites that overflow the card edges -->
  <div class="relative">
    <HomeSprite
      half="right"
      class="sprite-outer-left absolute top-1/2 left-0 -z-10 pointer-events-none max-sm:hidden"
    />
    <HomeSprite
      half="left"
      class="sprite-outer-right absolute top-1/2 right-0 -z-10 pointer-events-none max-sm:hidden"
    />
    <div
      class="flex flex-col gap-3 rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden pb-4 bg-[#f7f7f7]"
    >
      <!-- Banner -->
      <div class="relative h-28 bg-[rgb(107,187,224)] overflow-hidden">
        <HomeSprite
          half="right"
          class="sprite-banner-right absolute -bottom-18 left-3/8 sm:hidden"
        />
        <HomeSprite half="left" class="sprite-banner-left absolute -bottom-18 left-5/8 sm:hidden" />
      </div>
      <!-- Avatar row -->
      <div class="relative -mt-[calc(var(--spacing)*28/16*5)] flex items-end justify-between px-6">
        <div class="flex items-end gap-5">
          <img
            :src="profile.avatar"
            :alt="profile.name"
            width="112"
            height="112"
            loading="lazy"
            class="w-28 h-28 rounded-full object-cover border-3 border-white shadow"
          />
          <h1 class="text-xl font-bold text-gray-800">{{ profile.name }}</h1>
        </div>
        <div class="flex flex-col gap-2 items-end">
          <UButton
            icon="i-lucide-rss"
            color="neutral"
            variant="outline"
            size="sm"
            class="border-gray-300 text-gray-700 hover:bg-gray-50"
            as="a"
            href="https://jen-nextsteps.kit.com/60463af80d"
            target="_blank"
            rel="noopener"
          >
            訂閱電子報
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="fluent-emoji-high-contrast:bubble-tea"
            size="sm"
            class="border-gray-300 text-gray-700 hover:bg-gray-50"
            as="a"
            href="https://portaly.cc/jenknowsau/support"
            target="_blank"
            rel="noopener"
          >
            請我喝奶茶
          </UButton>
        </div>
      </div>
      <!-- Bio tabs -->
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        variant="link"
        size="sm"
        class="w-full tabs-profile px-6"
      />
      <p class="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-line px-6">
        {{ activeBio }}
      </p>
      <!-- Contacts -->
      <USeparator label="Contacts" class="px-6" />
      <div class="flex justify-center gap-4 py-2 px-6">
        <ContactLinks />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  profile: {
    avatar: string;
    name: string;
    tabs: { label: string; bio: string }[];
  };
}>();

const tabItems = computed(() =>
  props.profile.tabs.map((t) => ({ label: t.label, value: t.label })),
);
const activeTab = ref(tabItems.value[0]!.value);
const activeBio = computed(
  () => props.profile.tabs.find((t) => t.label === activeTab.value)?.bio ?? "",
);

// Switching profile (e.g. Jen Knows ↔ Jen Liu) replaces the tab list.
// Reset to the first tab when the previously active label no longer exists.
watch(tabItems, (items) => {
  if (!items.some((i) => i.value === activeTab.value)) {
    activeTab.value = items[0]!.value;
  }
});
</script>

<style scoped>
.tabs-profile :deep([data-slot="indicator"]) {
  height: 4px;
}
.tabs-profile :deep([data-state="active"] [data-slot="label"]) {
  font-size: 14px;
  font-weight: bold;
}

/* Scroll-driven sprite animations. Pure CSS, no JS — best perf.
   Support: Chrome/Edge 115+, Safari 26+. Firefox behind flag
   (layout.css.scroll-driven-animations.enabled). Unsupported browsers
   stay at the `from` keyframe (resting position). */
@keyframes sprite-outer-left-slide {
  from {
    transform: translateX(-108px) translateY(-50%);
  }
  to {
    transform: translateX(50px) translateY(-50%);
  }
}
@keyframes sprite-outer-right-slide {
  from {
    transform: translateX(112px) translateY(-50%) rotate(-5deg);
  }
  to {
    transform: translateX(-50px) translateY(-50%) rotate(-5deg);
  }
}
@keyframes sprite-banner-right-slide {
  from {
    transform: translateX(-50%) translateY(0) rotate(30deg);
  }
  to {
    transform: translateX(-50%) translateY(120px) rotate(30deg);
  }
}
@keyframes sprite-banner-left-slide {
  from {
    transform: translateX(-50%) translateY(0) rotate(325deg);
  }
  to {
    transform: translateX(-50%) translateY(120px) rotate(325deg);
  }
}

.sprite-outer-left {
  transform: translateX(-108px) translateY(-50%);
  animation: sprite-outer-left-slide linear both;
  animation-timeline: scroll(root);
  animation-range: 0 300px;
}
.sprite-outer-right {
  transform: translateX(112px) translateY(-50%) rotate(-5deg);
  animation: sprite-outer-right-slide linear both;
  animation-timeline: scroll(root);
  animation-range: 0 300px;
}
.sprite-banner-right {
  transform: translateX(-50%) rotate(30deg);
  animation: sprite-banner-right-slide linear both;
  animation-timeline: scroll(root);
  animation-range: 0 50px;
}
.sprite-banner-left {
  transform: translateX(-50%) rotate(325deg);
  animation: sprite-banner-left-slide linear both;
  animation-timeline: scroll(root);
  animation-range: 0 50px;
}
</style>
