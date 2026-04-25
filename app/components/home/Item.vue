<template>
  <NuxtLink :to="to" class="flex items-center gap-4 bg-[#f7f7f7] rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] px-4 py-3 hover:shadow-md transition-shadow">
    <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
      <UIcon :name="icon" class="w-5 h-5 text-teal-600" />
    </div>
    <div class="flex-1">
      <p class="font-semibold text-gray-800 text-sm">{{ title }}</p>
      <p class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  title: string
  description: string
}>()
</script>
