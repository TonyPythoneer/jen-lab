<template>
  <header
    class="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur"
  >
    <div class="max-w-5xl mx-auto px-4 py-3 grid grid-cols-3 items-center gap-4">
      <div class="justify-self-start">
        <slot name="left" />
      </div>
      <div class="text-center">
        <slot name="center">
          <h1 class="text-base md:text-lg font-semibold tracking-tight truncate">
            {{ title }}
          </h1>
        </slot>
      </div>
      <div class="justify-self-end">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
