<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: string;
    size?: number;
    spacing?: number;
    opacity?: number;
  }>(),
  {
    color: "var(--color-abyssal-ink)",
    size: 1.5,
    spacing: 24,
    opacity: 0.15,
  },
);
</script>

<template>
  <div
    aria-hidden="true"
    class="absolute inset-0 pointer-events-none"
    :style="{
      backgroundImage: `radial-gradient(circle, ${props.color} ${props.size}px, transparent ${props.size + 0.5}px)`,
      backgroundSize: `${props.spacing}px ${props.spacing}px`,
      opacity: props.opacity,
    }"
  />
</template>
