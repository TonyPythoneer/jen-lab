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
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="emit('update:open', false)"
        >
          <!-- sr-only label + description: reka announces these on open (zero pixels). -->
          <VisuallyHidden as-child>
            <DialogTitle>{{ title ?? "Dialog" }}</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden as-child>
            <DialogDescription>{{ description ?? "Dialog content." }}</DialogDescription>
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
  DialogDescription,
  VisuallyHidden,
} from "reka-ui";
import { cn } from "~/lib/utils";

const props = defineProps<{
  open?: boolean;
  fullscreen?: boolean;
  title?: string; // sr-only dialog label (screen readers)
  description?: string; // sr-only dialog description, announced on open
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
