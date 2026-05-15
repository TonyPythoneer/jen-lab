<template>
  <ClientOnly>
    <UCarousel v-slot="{ item }" dots :items="images" class="w-full mb-8">
      <div
        class="relative rounded-4xl overflow-hidden h-112 bg-gray-100 group cursor-zoom-in"
        @click="openImage(item)"
      >
        <img
          :src="item"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div
          class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20"
        >
          <UIcon name="i-lucide-zoom-in" class="size-10 text-white drop-shadow-lg" />
        </div>
      </div>
    </UCarousel>

    <UModal v-model:open="isOpen" :ui="{ content: 'max-w-4xl p-0 overflow-hidden' }">
      <template #content>
        <img :src="selectedImage" class="w-full h-auto max-h-[85vh] object-contain" />
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{
  images: string[];
}>();

const isOpen = ref(false);
const selectedImage = ref("");

function openImage(src: string) {
  selectedImage.value = src;
  isOpen.value = true;
}
</script>
