<template>
  <Transition name="fade">
    <button
      v-if="show"
      class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-abyssal-ink text-pure-white shadow-md flex items-center justify-center hover:bg-abyssal-ink/90 transition-colors"
      @click="scrollToTop"
    >
      <Icon name="i-lucide-chevron-up" class="w-7 h-7" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
const { threshold = 200 } = defineProps<{ threshold?: number }>();

// useWindowScroll handles SSR + passive listener + cleanup; we only react to the y value.
const { y } = useWindowScroll();
const show = computed(() => y.value > threshold);
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
