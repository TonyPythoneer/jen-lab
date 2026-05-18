<script setup lang="ts">
// Skeleton footer wired in task 03; fleshed out with columns + socials in task 11.
</script>

<template>
  <UFooter
    :ui="{
      root: 'bg-abyssal-ink text-pure-white rounded-t-card mt-10',
      top: 'p-10',
      bottom: 'border-t border-pure-white/10 p-6',
      center: 'flex flex-col md:flex-row items-center justify-between gap-4',
    }"
  >
    <template #left>
      <p class="font-display text-2xl tracking-[0.02em]">JEN-LAB</p>
    </template>
    <template #right>
      <p class="text-pure-white/60 text-sm">© Jen-Lab 2026</p>
    </template>
  </UFooter>
</template>
