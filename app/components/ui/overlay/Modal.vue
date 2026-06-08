<template>
  <Teleport to="body">
    <Transition name="app-overlay">
      <div v-if="open" class="fixed inset-0 z-40 bg-black/50" @click="close()" />
    </Transition>

    <Transition name="app-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close()"
      >
        <div :class="cn('relative bg-pure-white rounded-card overflow-hidden', contentClass)">
          <slot name="content" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { cn } from "~/lib/utils";

const props = defineProps<{
  open?: boolean;
  fullscreen?: boolean;
  ui?: { content?: string };
}>();

const emit = defineEmits<{ "update:open": [value: boolean] }>();

function close() {
  emit("update:open", false);
}

const contentClass = computed(() => {
  if (props.fullscreen) return "w-screen h-screen max-w-none rounded-none";
  return props.ui?.content ?? "w-full max-w-lg";
});
</script>

<style scoped>
.app-overlay-enter-active,
.app-overlay-leave-active {
  transition: opacity 200ms ease;
}
.app-overlay-enter-from,
.app-overlay-leave-to {
  opacity: 0;
}

.app-modal-enter-active,
.app-modal-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
