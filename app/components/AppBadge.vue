<template>
  <span v-bind="restAttrs" :class="cn(badgeClass, parentClass)">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from "~/lib/utils";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    variant?: "outline" | "default" | "soft";
    size?: "xs" | "sm" | "md";
    color?: string; // accepted for API compatibility, ignored
    ui?: Record<string, unknown>; // accepted for API compatibility, ignored
  }>(),
  { variant: "default", size: "sm" },
);

const attrs = useAttrs();
const restAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class")),
);
const parentClass = computed(() => (attrs.class as string) ?? "");

const BADGE_BASE = "inline-flex items-center font-medium rounded-button";

const BADGE_VARIANT = {
  default: "bg-abyssal-ink text-pure-white",
  outline: "ring-1 ring-abyssal-ink/30 text-abyssal-ink",
  soft: "bg-abyssal-ink/10 text-abyssal-ink",
} as const;

const BADGE_SIZE = {
  xs: "text-[10px] px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
} as const;

const badgeClass = computed(() =>
  cn(BADGE_BASE, BADGE_VARIANT[props.variant ?? "default"], BADGE_SIZE[props.size ?? "sm"]),
);
</script>
