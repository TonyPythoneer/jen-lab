<template>
  <Transition name="content-body" @after-enter="emit('after-enter')">
    <div v-if="show" class="flex flex-col gap-5">

      <template v-for="section in page.sections" :key="section.id">
        <CollapsibleSeparator :id="section.id" :label="section.label" :default-open="true">

          <template v-if="section.component === 'portal-list'">
            <HomeItem v-for="item in page.items" :key="item.to" v-bind="item" />
          </template>

          <template v-else-if="section.component === 'youtube-carousel'">
            <HomeYoutubeCarousel :videos="page.videos" />
          </template>

          <template v-else-if="section.component === 'image-carousel'">
            <HomeImageCarousel :images="page.galleries ?? []" />
          </template>

          <template v-else-if="section.component === 'product-list'">
            <HomeProductCard
              v-for="product in page.products"
              :key="product.descriptionContentPath"
              :product="product"
            />
          </template>

        </CollapsibleSeparator>
      </template>

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

const emit = defineEmits<{
  'after-enter': []
}>()
</script>

<style scoped>
.content-body-enter-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.content-body-enter-from { opacity: 0; transform: translateY(24px); }
</style>
