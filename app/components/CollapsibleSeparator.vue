<template>
  <UCollapsible class="flex flex-col gap-5" :default-open="defaultOpen">
    <template #default="{ open }">
      <button class="flex items-center justify-center gap-2 w-full">
        <div class="flex-1 h-px bg-gray-200" />
        <span class="text-sm text-gray-500 shrink-0">{{ label }}</span>
        <UIcon :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" class="w-4 h-4 text-gray-400 shrink-0" />
        <div class="flex-1 h-px bg-gray-200" />
      </button>
    </template>
    <template #content>
      <div class="flex flex-col gap-5 overflow-visible pt-1 pb-2 px-2">
        <slot />
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  defaultOpen?: boolean
}>()
</script>
