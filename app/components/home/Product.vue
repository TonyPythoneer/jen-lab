<template>
  <div class="rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden bg-[#f7f7f7]">
    <!-- Banner placeholder. Teal background shows while the lazy image is decoding or if `banner` is unset. -->
    <div class="relative h-40 sm:h-56 bg-teal-400">
      <img
        v-if="banner"
        :src="banner"
        class="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
    <div class="flex flex-col gap-3 p-5">
      <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
      <!--
        Collapsible: brief copy is always shown; full description (markdown via MDC) toggles open.
        `class="group"` enables the chevron rotate via group-data-[state=open] in the UI override below.
      -->
      <UCollapsible class="group">
        <div class="flex items-center gap-1 -ml-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            leading-icon="i-lucide-chevron-right"
            :ui="{ leadingIcon: 'group-data-[state=open]:rotate-90 transition-transform duration-200', base: 'hover:bg-transparent' }"
          />
          <span class="text-sm text-gray-500">{{ brief }}</span>
        </div>
        <template #content>
          <div class="text-sm text-gray-600 leading-relaxed mt-2 pl-5 product-description">
            <MDC v-if="description" :value="description" />
          </div>
        </template>
      </UCollapsible>
      <UButton
        :to="purchaseUrl"
        target="_blank"
        rel="noopener"
        color="primary"
        size="lg"
        block
        class="rounded-full font-semibold mt-1"
      >
        {{ purchaseLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  banner?: string
  title: string
  brief: string
  description: string
  purchaseUrl: string
  purchaseLabel: string
}>()
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
