<template>
  <ClientOnly>
    <UCarousel v-slot="{ item }" dots :items="images" class="w-full mb-8">
      <div class="relative rounded-4xl overflow-hidden h-112 bg-gray-100">
        <img
          :src="item"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </UCarousel>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{
  images: string[]
}>()
</script>
