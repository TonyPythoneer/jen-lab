<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="app-overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-40"
        :class="ui?.overlay ?? 'bg-black/50'"
        @click="dismissible !== false && close()"
      />
    </Transition>

    <!-- Panel -->
    <Transition :name="`app-slide-${side ?? 'right'}`">
      <div v-if="open" class="fixed z-50" :class="panelClass">
        <slot name="content" :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  overlay?: boolean;
  dismissible?: boolean;
  ui?: { overlay?: string };
}>();

const emit = defineEmits<{ "update:open": [value: boolean] }>();

function close() {
  emit("update:open", false);
}

const panelClass = computed(() => {
  switch (props.side) {
    case "top":
      return "inset-x-0 top-0 w-full";
    case "bottom":
      return "inset-x-0 bottom-0 w-full";
    case "left":
      return "inset-y-0 left-0 h-full";
    default: // right
      return "inset-y-0 right-0 h-full";
  }
});
</script>

<style scoped>
/* Overlay fade */
.app-overlay-enter-active,
.app-overlay-leave-active {
  transition: opacity 200ms ease;
}
.app-overlay-enter-from,
.app-overlay-leave-to {
  opacity: 0;
}

/* Top slide */
.app-slide-top-enter-active,
.app-slide-top-leave-active {
  transition: transform 200ms ease;
}
.app-slide-top-enter-from,
.app-slide-top-leave-to {
  transform: translateY(-100%);
}

/* Right slide */
.app-slide-right-enter-active,
.app-slide-right-leave-active {
  transition: transform 200ms ease;
}
.app-slide-right-enter-from,
.app-slide-right-leave-to {
  transform: translateX(100%);
}

/* Bottom slide */
.app-slide-bottom-enter-active,
.app-slide-bottom-leave-active {
  transition: transform 200ms ease;
}
.app-slide-bottom-enter-from,
.app-slide-bottom-leave-to {
  transform: translateY(100%);
}

/* Left slide */
.app-slide-left-enter-active,
.app-slide-left-leave-active {
  transition: transform 200ms ease;
}
.app-slide-left-enter-from,
.app-slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
