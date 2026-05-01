<template>
  <Transition name="fade">
    <button
      v-if="show"
      class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white text-black border-2 border-black shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
      @click="scrollToTop"
    >
      <UIcon name="i-lucide-chevron-up" class="w-7 h-7" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
const { threshold = 200 } = defineProps<{ threshold?: number }>()

const scrollY = ref(0)
const onScroll = () => { scrollY.value = window.scrollY }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const show = computed(() => scrollY.value > threshold)
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
