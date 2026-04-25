<template>
  <!-- Featured Product -->
  <div class="rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden bg-[#f7f7f7]">
    <!-- Banner -->
    <div class="relative h-40 sm:h-56 bg-teal-400">
      <img
        v-if="product.bannerImage"
        :src="product.bannerImage"
        class="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
    <!-- Body -->
    <div class="flex flex-col gap-3 p-5">
      <h2 class="text-lg font-bold text-gray-900">{{ product.title }}</h2>
      <!-- Collapsible description -->
      <UCollapsible class="group">
        <div class="flex items-center gap-1 -ml-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            leading-icon="i-lucide-chevron-right"
            :ui="{ leadingIcon: 'group-data-[state=open]:rotate-90 transition-transform duration-200', base: 'hover:bg-transparent' }"
          />
          <!-- Brief -->
          <span class="text-sm text-gray-500">{{ product.brief }}</span>
        </div>
        <!-- description -->
        <template #content>
          <div
            class="text-sm text-gray-600 leading-relaxed mt-2 pl-5 product-description"
            v-html="parsedDescription"
          />
        </template>
      </UCollapsible>
      <!-- CTA -->
      <UButton
        :to="product.purchaseUrl"
        target="_blank"
        rel="noopener"
        color="primary"
        size="lg"
        block
        class="rounded-full font-semibold mt-1"
      >
        {{ product.purchaseLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  product: {
    bannerImage?: string
    title: string
    brief: string
    description: string
    purchaseUrl: string
    purchaseLabel: string
  }
}>()

const parsedDescription = computed(() => marked(props.product.description))
</script>

<style scoped>
.product-description :deep(a) {
  color: var(--color-primary-500);
  text-decoration: underline;
}
.product-description :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.product-description :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
