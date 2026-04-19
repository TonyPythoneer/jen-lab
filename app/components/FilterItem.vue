<template>
  <button
    class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-gray-50 transition text-left w-full"
    :class="active ? 'font-semibold text-teal-600' : 'text-muted'"
    @click="$emit('click')"
  >
    <!-- ui: radio dot for selection display -->
    <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
      :class="active ? 'border-teal-500' : 'border-gray-300'">
      <span
        v-if="active"
        class="w-2 h-2 rounded-full bg-teal-500"
      />
    </span>
    <!-- ui: dotColored circle mark -->
    <span
      v-if="dotColor"
      class="w-2.5 h-2.5 rounded-full flex-shrink-0"
      :style="{ background: dotColor }"
    />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ active: boolean; label: string; dotColor?: string }>()
defineEmits<{ click: [] }>()
</script>
