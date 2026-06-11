<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-4 bg-ash-white rounded-card border border-abyssal-ink/8 shadow-sm px-4 py-3 hover:-translate-y-0.5 hover:shadow-md transition-all"
  >
    <div
      class="w-10 h-10 rounded-full bg-digital-orange/10 flex items-center justify-center shrink-0"
    >
      <Icon :name="icon" class="w-5 h-5 text-digital-orange" />
    </div>
    <div class="flex-1">
      <p class="font-semibold text-abyssal-ink text-sm">{{ title }}</p>
      <p class="text-xs text-abyssal-ink/60 mt-0.5">{{ brief }}</p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  icon: string;
  title: string;
  brief: string;
}>();
</script>
