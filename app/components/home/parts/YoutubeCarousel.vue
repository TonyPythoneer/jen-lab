<template>
  <ClientOnly>
    <div class="flex flex-col gap-3">
      <UCarousel
        v-slot="{ item }"
        dots
        :items="videos"
        :ui="{ item: 'sm:basis-1/2' }"
        class="w-full mb-8"
      >
        <button class="flex flex-col gap-1.5 group w-full text-left" @click="openVideo(item)">
          <div class="relative rounded-card overflow-hidden aspect-[2/1] bg-ash-white">
            <img
              :src="`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-digital-orange transition-colors"
              >
                <UIcon name="i-lucide-play" class="w-5 h-5 text-white ml-0.5" />
              </div>
            </div>
          </div>
        </button>
      </UCarousel>

      <UModal v-model:open="isOpen" :ui="{ content: 'p-0 overflow-hidden' }" fullscreen>
        <template #content>
          <div class="relative w-full h-full bg-black flex items-center justify-center">
            <!-- Close button comes after the iframe in DOM, so paint order keeps it on top — no z-index needed. -->
            <button
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              @click="closeVideo"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
            </button>
            <iframe
              v-if="activeVideoId"
              :src="`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`"
              class="w-full aspect-video max-h-screen"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
              "
              allowfullscreen
            />
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  videos: { id: string; title: string }[];
}>();

const isOpen = ref(false);
const activeVideoId = ref<string | null>(null);

function openVideo(item: { id: string }) {
  activeVideoId.value = item.id;
  isOpen.value = true;
}

function closeVideo() {
  isOpen.value = false;
  activeVideoId.value = null;
}
</script>
