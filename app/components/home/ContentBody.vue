<template>
  <Transition name="content-body">
    <div v-if="show" class="flex flex-col gap-5">

      <section
        v-for="section in page.sections"
        :id="section.id"
        :key="section.id"
        class="scroll-mt-4 flex flex-col gap-5"
      >
        <CollapsibleSeparator :label="section.label" default-open>

          <template v-if="section.component === 'portal-list'">
            <HomePortal v-for="portal in section.portals" :key="portal.to" v-bind="portal" />
          </template>

          <template v-else-if="section.component === 'youtube-carousel'">
            <div v-for="carousel in section.carousels" :key="carousel.id" class="flex flex-col gap-2">
              <h3 v-if="carousel.label" class="text-sm font-semibold text-gray-700">{{ carousel.label }}</h3>
              <HomeYoutubeCarousel :videos="carousel.videos" />
            </div>
          </template>

          <template v-else-if="section.component === 'image-carousel'">
            <div v-for="carousel in section.carousels" :key="carousel.id" class="flex flex-col gap-2">
              <h3 v-if="carousel.label" class="text-sm font-semibold text-gray-700">{{ carousel.label }}</h3>
              <HomeImageCarousel :images="carousel.images" />
            </div>
          </template>

          <template v-else-if="section.component === 'product-list'">
            <HomeProduct
              v-for="product in section.products"
              :key="product.purchaseUrl"
              v-bind="product"
            />
          </template>

        </CollapsibleSeparator>
      </section>

    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Collections } from '@nuxt/content'

type HomePage = Collections['home']

defineProps<{
  page: HomePage
  show: boolean
}>()
</script>

<style scoped>
.content-body-enter-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.content-body-enter-from { opacity: 0; transform: translateY(24px); }
</style>
