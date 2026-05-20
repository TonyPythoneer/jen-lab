<template>
  <div class="rounded-card shadow-sm overflow-hidden bg-ash-white border border-abyssal-ink/8">
    <!-- Banner placeholder. basalt-canvas shows while the lazy image is decoding or if `banner` is unset. -->
    <div class="relative h-40 sm:h-56 bg-basalt-canvas">
      <img
        v-if="banner"
        :src="banner"
        :alt="title"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div class="flex flex-col gap-3 p-5">
      <h2 class="text-lg font-display tracking-[0.02em] text-abyssal-ink">{{ title }}</h2>
      <!--
        Collapsible: brief copy is always shown; full description toggles open.
        `class="group"` enables the chevron rotate via group-data-[state=open] in the UI override below.
      -->
      <UCollapsible class="group">
        <div class="flex items-center gap-1 -ml-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            leading-icon="i-lucide-chevron-right"
            :ui="{
              leadingIcon: 'group-data-[state=open]:rotate-90 transition-transform duration-200',
              base: 'hover:bg-transparent',
            }"
          />
          <span class="text-sm text-abyssal-ink/60">{{ brief }}</span>
        </div>
        <template #content>
          <!-- descriptionHtml is pre-rendered at build time by markdown-it inside
               the content:file:afterParse hook (see nuxt.config.ts). v-html ships
               zero markdown parser to the client; source is trusted local content. -->
          <div
            v-if="descriptionHtml"
            class="text-sm text-abyssal-ink/70 leading-relaxed mt-2 pl-5 product-description"
            v-html="descriptionHtml"
          />
        </template>
      </UCollapsible>
      <UButton
        :to="purchaseUrl"
        target="_blank"
        rel="noopener"
        color="primary"
        size="lg"
        block
        class="rounded-button font-semibold mt-1"
      >
        {{ purchaseLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// `descriptionHtml` is pre-rendered at build (see nuxt.config.ts hook).
// `description` is the markdown source — declared only to absorb the
// spread from `v-bind="product"` so Vue doesn't warn about an unknown attr.
defineProps<{
  banner?: string;
  title: string;
  brief: string;
  description?: string;
  descriptionHtml?: string;
  purchaseUrl: string;
  purchaseLabel: string;
}>();
</script>

<style scoped>
/* Restores defaults for tags markdown-it emits — Tailwind Preflight resets
 * them. `:deep()` because the markup comes from v-html, not the template. */
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
.product-description :deep(hr) {
  margin: 0.75rem 0;
  border-color: rgb(229 231 235);
}
</style>
