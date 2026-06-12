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
/* CSS Grid breakout — no JS, no negative margins. Children default to the
   1200px content column; .full-bleed spans edge-to-edge. */
.page-breakout {
  display: grid;
  grid-template-columns:
    [full-start] minmax(0, 1fr)
    [content-start] min(calc(100% - 2rem), 1200px)
    [content-end] minmax(0, 1fr)
    [full-end];
  row-gap: var(--section-gap);
}

.page-breakout > :deep(*) {
  grid-column: content;
}

.page-breakout > :deep(.full-bleed) {
  grid-column: full;
}
</style>
