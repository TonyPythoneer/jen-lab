<template>
  <div class="grid sm:grid-cols-2 gap-5">
    <div
      v-for="(item, i) in images"
      :key="i"
      class="relative rounded-card overflow-hidden aspect-square bg-ash-white group cursor-zoom-in"
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
        <Icon name="i-lucide-zoom-in" class="size-10 text-white drop-shadow-lg" />
      </div>
    </div>
  </div>

  <Modal
    v-model:open="isOpen"
    :ui="{ content: 'max-w-4xl p-0 overflow-hidden' }"
    description="Enlarged image"
  >
    <template #content>
      <img :src="selectedImage" class="w-full h-auto max-h-[85vh] object-contain" />
    </template>
  </Modal>
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
