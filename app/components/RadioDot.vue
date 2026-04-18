<template>
  <span
    class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
    :class="active ? 'border-teal-500' : 'border-gray-300'"
  >
    <span v-if="active" class="w-2 h-2 rounded-full bg-teal-500" />
  </span>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>
