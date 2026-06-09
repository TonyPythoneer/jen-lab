<template>
  <div :class="$attrs.class">
    <h1 :class="cn('font-display tracking-tight', ui?.title)">{{ title }}</h1>
    <p v-if="description" :class="cn('mt-2 text-abyssal-ink/60', ui?.description)">
      {{ description }}
    </p>
    <slot name="description" />
  </div>
</template>

<script setup lang="ts">
import { cn } from "~/lib/utils";

defineOptions({ inheritAttrs: false });

defineProps<{
  title?: string;
  description?: string;
  ui?: { title?: string; description?: string };
}>();
</script>
