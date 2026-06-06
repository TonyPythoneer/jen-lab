<template>
  <div>
    <!-- Embla viewport: clips overflow so only one "page" is visible -->
    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="min-w-0 shrink-0 grow-0 basis-full"
          :class="ui?.item"
        >
          <slot :item="item" />
        </div>
      </div>
    </div>

    <!-- Dot nav: one dot per scroll-snap (respects responsive basis) -->
    <div v-if="dots && snapCount > 1" class="mt-4 flex justify-center gap-2">
      <button
        v-for="i in snapCount"
        :key="i"
        type="button"
        class="size-2 rounded-full transition-colors"
        :class="activeSnap === i - 1 ? 'bg-abyssal-ink' : 'bg-abyssal-ink/25'"
        @click="scrollTo(i - 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import emblaCarouselVue from "embla-carousel-vue";

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  dots?: boolean;
  ui?: { item?: string };
}>();

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: false, align: "start" });
const snapCount = ref(0);
const activeSnap = ref(0);

onMounted(() => {
  const api = emblaApi.value;
  if (!api) return;

  function sync() {
    snapCount.value = api!.scrollSnapList().length;
    activeSnap.value = api!.selectedScrollSnap();
  }

  api.on("select", () => {
    activeSnap.value = api!.selectedScrollSnap();
  });
  api.on("reInit", sync);
  sync();
});

function scrollTo(index: number) {
  emblaApi.value?.scrollTo(index);
}
</script>
