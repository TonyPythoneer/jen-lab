<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <!-- force-mount + Vue <Transition> so the existing fade/scale CSS drives the
           animation; reka still supplies focus-trap, Esc, scroll-lock, aria. -->
      <Transition name="app-overlay">
        <DialogOverlay v-if="open" force-mount class="fixed inset-0 z-40 bg-black/50" />
      </Transition>

      <Transition name="app-modal">
        <DialogContent
          v-if="open"
          force-mount
          :aria-describedby="undefined"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="emit('update:open', false)"
        >
          <!-- reka requires a title for a11y; visually hidden, zero pixels. -->
          <VisuallyHidden>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden>
          <div :class="cn('relative bg-pure-white rounded-card overflow-hidden', contentClass)">
            <slot name="content" />
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from "reka-ui";
import { cn } from "~/lib/utils";

const props = defineProps<{
  open?: boolean;
  fullscreen?: boolean;
  ui?: { content?: string };
}>();

const emit = defineEmits<{ "update:open": [value: boolean] }>();

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
