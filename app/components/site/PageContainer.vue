<script setup lang="ts">
defineProps<{ breakout?: boolean }>();
</script>

<template>
  <div v-if="breakout" class="page-breakout pb-2.5" style="--page-inset-top: 0px">
    <slot />
  </div>
  <div
    v-else
    class="container mx-auto max-w-[1200px] px-4 pt-10 pb-10 space-y-10"
    style="--page-inset-top: 2.5rem"
  >
    <slot />
  </div>
</template>

<style scoped>
/*
  CSS Grid Breakout: three named columns so child sections can either
  stay within the 1200px content column or span edge-to-edge via
  the "full" column lines. No JS, no negative margins.

  Usage in child sections:
    default  → stays within content column automatically
    .full-bleed → add this class to break out to full viewport width
*/
.page-breakout {
  display: grid;
  grid-template-columns:
    [full-start] minmax(0, 1fr)
    [content-start] min(calc(100% - 2rem), 1200px)
    [content-end] minmax(0, 1fr)
    [full-end];
  row-gap: 4rem; /* gap-16 */
}

.page-breakout > :deep(*) {
  grid-column: content;
}

.page-breakout > :deep(.full-bleed) {
  grid-column: full;
}
</style>
