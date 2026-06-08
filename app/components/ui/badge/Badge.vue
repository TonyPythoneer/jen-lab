<template>
  <span v-bind="restAttrs" :class="cn(badgeVariants({ variant, size }), parentClass)">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from "~/lib/utils";
import { useSplitClassAttrs } from "~/composables/shared/useSplitClassAttrs";
import { badgeVariants, type BadgeVariants } from ".";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    variant?: BadgeVariants["variant"];
    size?: BadgeVariants["size"];
    color?: string; // ignored internally, but PostCard passes it — keep the swallow
  }>(),
  { variant: "default", size: "sm" },
);

const { parentClass, restAttrs } = useSplitClassAttrs();
</script>
