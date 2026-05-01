<template>
  <!--
    TOC layout is dual-mode:
      - sm+ : fixed rail vertically centered on the left.
      - max-sm : sticky strip pinned to the top of the page so it stays
                 visible while the body scrolls.
    z-30 + opaque background so scrolled content doesn't bleed through.
  -->
  <ClientOnly>
    <aside
      class="
        sm:fixed sm:top-1/2 sm:-translate-y-1/2
        max-sm:sticky max-sm:top-0 max-sm:z-30 max-sm:bg-white
        max-sm:border-b max-sm:border-gray-200
      "
    >
      <UContentToc
        highlight
        :links="links"
        :title="title"
        :ui="{
          root: 'max-sm:w-full -mx-4! px-4! sm:px-6! pl-4',
          container: 'border-0! sm:border-b border-dashed',
          content: 'px-2',
          title: 'max-sm:flex-1 max-sm:text-center',
          trailingIcon: 'sm:hidden!',
        }"
      />
    </aside>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ContentTocLink } from '@nuxt/ui'

defineProps<{
  links: ContentTocLink[]
  title: string
}>()
</script>

<style scoped>
/*
 * UContentToc renders mobile-first with a collapsible disclosure (button[trigger] +
 * [content][data-state]). On sm+ we want the always-visible rail layout, so we
 * swap which trigger/content pair is shown. !important is required to override
 * the component's inline display rules.
 */
@media (min-width: 640px) {
  :deep(button[data-slot="trigger"]),
  :deep([data-slot="content"][data-state]) {
    display: none !important;
  }
  :deep(p[data-slot="trigger"]) {
    display: flex !important;
  }
  :deep(div[data-slot="content"]:not([data-state])) {
    display: flex !important;
  }
}
</style>
