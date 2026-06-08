<template>
  <!-- Uses inline section dispatch (not HomeContentBody):
       sections get Caldera font-display headings, and portal/product sections
       use responsive 2-col grids. -->
  <div class="flex flex-col gap-12">
    <!-- Header: full viewport height, centered column — img → name → bio.
         Negative margins cancel SitePageContainer's pt-10 and px-4 so the
         hero truly fills edge-to-edge from just below the site header. -->
    <div
      class="flex items-center justify-center h-[calc(100dvh-var(--site-header-h))] -mt-10 -mx-4 sm:-mx-6 lg:-mx-8"
    >
      <div class="flex flex-col items-center gap-5 text-center px-4 max-w-lg">
        <img
          :src="page.profile.avatar"
          :alt="page.profile.name"
          width="168"
          height="168"
          loading="lazy"
          class="w-42 h-42 rounded-full object-cover border-2 border-abyssal-ink/10"
        />

        <h1
          class="font-display tracking-[0.03em] leading-[0.9] text-abyssal-ink text-7xl sm:text-9xl uppercase"
        >
          {{ displayName }}
        </h1>

        <!-- Single bio: render directly -->
        <p
          v-if="page.profile.tabs.length === 1"
          class="text-sm text-abyssal-ink/70 leading-relaxed whitespace-pre-line"
        >
          {{ page.profile.tabs[0]!.bio }}
        </p>
        <!-- Multiple tabs: UTabs navigation + reactive bio below -->
        <template v-else>
          <AppTabs v-model="activeTab" :items="tabItems" class="w-full" />
          <p class="text-sm text-abyssal-ink/70 leading-relaxed whitespace-pre-line">
            {{ activeBio }}
          </p>
        </template>
      </div>
    </div>

    <!-- Sections -->
    <section
      v-for="section in page.sections"
      :id="section.id"
      :key="section.id"
      class="flex flex-col gap-5"
    >
      <h2
        class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-4xl sm:text-5xl uppercase"
      >
        {{ section.label }}
      </h2>

      <!-- portal-list: 2-col responsive grid -->
      <template v-if="section.component === 'portal-list'">
        <div class="grid sm:grid-cols-2 gap-3">
          <HomePortal v-for="portal in section.portals" :key="portal.to" v-bind="portal" />
        </div>
      </template>

      <!-- product-list: 2-col responsive grid -->
      <template v-else-if="section.component === 'product-list'">
        <div class="grid sm:grid-cols-2 gap-5">
          <HomeProduct
            v-for="product in section.products"
            :key="product.purchaseUrl"
            v-bind="product"
          />
        </div>
      </template>

      <!-- youtube-gallery: 2-col grid -->
      <template v-else-if="section.component === 'youtube-gallery'">
        <div v-for="gallery in section.galleries" :key="gallery.id" class="flex flex-col gap-2">
          <h3 v-if="gallery.label" class="text-sm font-semibold text-abyssal-ink/60">
            {{ gallery.label }}
          </h3>
          <HomeYoutubeGallery :videos="gallery.videos" />
        </div>
      </template>

      <!-- image-gallery: 2-col grid -->
      <template v-else-if="section.component === 'image-gallery'">
        <div v-for="gallery in section.galleries" :key="gallery.id" class="flex flex-col gap-2">
          <h3 v-if="gallery.label" class="text-sm font-semibold text-abyssal-ink/60">
            {{ gallery.label }}
          </h3>
          <HomeImageGallery :images="gallery.images" />
        </div>
      </template>
    </section>

    <!-- Support: bubble-tea section, brand-specific, sits before the page footer -->
    <HomeSectionSupport :brand="props.brand" />
  </div>
</template>

<script setup lang="ts">
import type { home } from "../../../generated/velite/index.js";

const props = defineProps<{
  page: home;
  displayName: string;
  brand: "jen-liu" | "jen-knows";
}>();

const tabItems = computed(() =>
  props.page.profile.tabs.map((t) => ({ label: t.label, value: t.label })),
);
const activeTab = ref(tabItems.value[0]!.value);
const activeBio = computed(
  () => props.page.profile.tabs.find((t) => t.label === activeTab.value)?.bio ?? "",
);

watch(tabItems, (items) => {
  if (!items.some((i) => i.value === activeTab.value)) {
    activeTab.value = items[0]!.value;
  }
});
</script>
