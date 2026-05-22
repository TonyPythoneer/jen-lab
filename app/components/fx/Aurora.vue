<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: "orange" | "violet";
    rounded?: string;
  }>(),
  {
    color: "orange",
    rounded: "rounded-button",
  },
);
</script>

<template>
  <div class="aurora-wrap">
    <div class="aurora-ring" :class="[`aurora-ring--${color}`, rounded]" aria-hidden="true" />
    <slot />
  </div>
</template>

<style scoped>
.aurora-wrap {
  position: relative;
  display: inline-flex;
}

.aurora-ring {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.aurora-ring::before,
.aurora-ring::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  animation: aurora-pulse 2.5s linear infinite;
}

.aurora-ring::after {
  animation: aurora-pulse2 2.5s linear infinite;
}

.aurora-ring--orange::before,
.aurora-ring--orange::after {
  background: var(--color-digital-orange);
}

.aurora-ring--violet::before,
.aurora-ring--violet::after {
  background: var(--color-cyber-violet);
}

@keyframes aurora-pulse {
  0% {
    opacity: 1;
    transform: scaleY(1) scaleX(1);
  }
  20% {
    opacity: 0.5;
  }
  70% {
    opacity: 0.2;
    transform: scaleY(1.8) scaleX(1.4);
  }
  80% {
    opacity: 0;
    transform: scaleY(1.8) scaleX(1.4);
  }
  90% {
    opacity: 0;
    transform: scaleY(1) scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleY(1) scaleX(1);
  }
}

@keyframes aurora-pulse2 {
  0% {
    opacity: 1;
    transform: scaleY(1) scaleX(1);
  }
  20% {
    opacity: 0.5;
  }
  70% {
    opacity: 0.2;
    transform: scaleY(1.3) scaleX(1.15);
  }
  80% {
    opacity: 0;
    transform: scaleY(1.3) scaleX(1.15);
  }
  90% {
    opacity: 0;
    transform: scaleY(1) scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleY(1) scaleX(1);
  }
}
</style>
