<template>
  <button
    class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm cursor-pointer hover:bg-ash-white transition text-left w-full"
    :class="active ? 'font-semibold text-digital-orange' : 'text-muted'"
    @click="$emit('click')"
  >
    <!-- ui: radio dot for selection display -->
    <span
      class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
      :class="active ? 'border-digital-orange' : 'border-abyssal-ink/10'"
    >
      <span v-if="active" class="w-2 h-2 rounded-full bg-digital-orange" />
    </span>
    <!-- ui: dotColored circle mark -->
    <span
      v-if="dotColor"
      class="w-2.5 h-2.5 rounded-full shrink-0"
      :style="{ background: dotColor }"
    />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ active: boolean; label: string; dotColor?: string }>();
defineEmits<{ click: [] }>();
</script>
