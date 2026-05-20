<template>
  <!-- Uses inline section dispatch (not HomeContentBody):
       sections get Caldera font-display headings, and portal/product sections
       use responsive 2-col grids. -->
  <div class="flex flex-col gap-12">
    <!-- Header -->
    <div class="flex flex-col gap-6">
      <h1
        class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-7xl sm:text-9xl uppercase"
      >
        {{ displayName }}
      </h1>

      <div class="flex flex-col sm:flex-row gap-6 items-start">
        <img
          :src="page.profile.avatar"
          :alt="page.profile.name"
          width="96"
          height="96"
          loading="lazy"
          class="w-24 h-24 rounded-full object-cover border-2 border-abyssal-ink/10 shrink-0"
        />

        <div class="flex flex-col gap-4 flex-1">
          <!-- Single bio: render directly -->
          <p
            v-if="page.profile.tabs.length === 1"
            class="text-sm text-abyssal-ink/70 leading-relaxed whitespace-pre-line"
          >
            {{ page.profile.tabs[0]!.bio }}
          </p>
          <!-- Multiple tabs: UTabs navigation + reactive bio below -->
          <template v-else>
            <UTabs v-model="activeTab" :items="tabItems" variant="link" size="sm" class="w-full" />
            <p class="text-sm text-abyssal-ink/70 leading-relaxed whitespace-pre-line">
              {{ activeBio }}
            </p>
          </template>

          <div class="flex flex-wrap gap-3">
            <UButton
              as="a"
              :href="subscribeUrl"
              target="_blank"
              rel="noopener"
              color="primary"
              size="md"
              icon="i-lucide-rss"
              class="rounded-button"
            >
              {{ SUBSCRIBE_LABEL }}
            </UButton>
            <UButton
              as="a"
              :href="supportUrl"
              target="_blank"
              rel="noopener"
              color="neutral"
              variant="outline"
              size="md"
              icon="fluent-emoji-high-contrast:bubble-tea"
              class="rounded-button"
            >
              {{ SUPPORT_LABEL }}
            </UButton>
          </div>
        </div>
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

      <!-- youtube-carousel: full width -->
      <template v-else-if="section.component === 'youtube-carousel'">
        <div v-for="carousel in section.carousels" :key="carousel.id" class="flex flex-col gap-2">
          <h3 v-if="carousel.label" class="text-sm font-semibold text-abyssal-ink/60">
            {{ carousel.label }}
          </h3>
          <HomeYoutubeCarousel :videos="carousel.videos" />
        </div>
      </template>

      <!-- image-carousel: full width -->
      <template v-else-if="section.component === 'image-carousel'">
        <div v-for="carousel in section.carousels" :key="carousel.id" class="flex flex-col gap-2">
          <h3 v-if="carousel.label" class="text-sm font-semibold text-abyssal-ink/60">
            {{ carousel.label }}
          </h3>
          <HomeImageCarousel :images="carousel.images" />
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Collections } from "@nuxt/content";

const SUBSCRIBE_LABEL = "訂閱電子報";
const SUPPORT_LABEL = "請我喝奶茶";

const props = defineProps<{
  page: Collections["home"];
  subscribeUrl: string;
  supportUrl: string;
  displayName: string;
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
