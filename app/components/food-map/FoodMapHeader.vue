<script setup lang="ts">
withDefaults(
  defineProps<{
    edition?: string;
    districts?: string;
  }>(),
  { edition: "α — 2026", districts: "CBD · Suburbs" },
);
</script>

<template>
  <div class="drawer-brand">
    <h1 class="drawer-brand__title">雪梨食堂誌</h1>
    <div class="drawer-brand__subtitle">Sydney Travelogue Map · A Field Atlas</div>
  </div>
</template>
