<template>
  <div data-slot="skeleton" :class="cn('animate-pulse rounded-md bg-foreground/10', props.class)" />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";

// shadcn's default is bg-primary/10 (orange). Brand skeletons are a neutral
// ink tint, so foreground/10 (= abyssal-ink/10) keeps the prior look.
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>
