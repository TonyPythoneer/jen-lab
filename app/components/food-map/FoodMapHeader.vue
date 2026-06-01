<script setup lang="ts">
withDefaults(
  defineProps<{
    edition?: string;
    districts?: string;
  }>(),
  { edition: "α — 2026", districts: "CBD · Suburbs" },
);

const emit = defineEmits<{ reset: [] }>();
</script>

<template>
  <div class="drawer-brand">
    <span class="drawer-brand__seal">
      <span class="dot" />
      ESTD. 二〇二六
      <span class="dot" />
    </span>
    <h1 class="drawer-brand__title">雪梨食堂誌</h1>
    <div class="drawer-brand__subtitle">Sydney Travelogue Map · A Field Atlas</div>
    <button class="drawer-brand__reset" @click="emit('reset')">↺ Reset Atlas</button>
  </div>
</template>
