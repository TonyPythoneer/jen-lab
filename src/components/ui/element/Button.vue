<template>
  <component
    :is="tag"
    v-bind="elementAttrs"
    :class="cn(buttonVariants({ color, variant, size, square }), uiBase, parentClass)"
  >
    <Icon v-if="icon" :name="icon" :class="iconSizeClass" class="shrink-0" />
    <span v-if="label !== undefined">{{ label }}</span>
    <slot v-else />
    <Icon v-if="trailingIcon" :name="trailingIcon" :class="iconSizeClass" class="shrink-0" />
  </component>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router";
import { cn } from "~/lib/utils";
import { useSplitClassAttrs } from "~/composables/shared/useSplitClassAttrs";
import { buttonVariants, type ButtonVariants } from "./button";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    color?: ButtonVariants["color"];
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    icon?: string;
    trailingIcon?: string;
    label?: string | number;
    square?: boolean;
    loading?: boolean;
    disabled?: boolean;
    as?: string;
    href?: string;
    to?: RouteLocationRaw;
    ui?: Record<string, string>; // API-compat passthrough — only ui.base applied
  }>(),
  { color: "neutral", variant: "solid", size: "sm" },
);

const { parentClass, restAttrs } = useSplitClassAttrs();

// #region Element type + element-specific attrs
const tag = computed(() => {
  if (props.to) return RouterLink;
  if (props.as === "a" || props.href) return "a";
  return "button";
});

const elementAttrs = computed(() => {
  if (props.to) return { to: props.to, ...restAttrs.value };
  if (tag.value === "a") return { href: props.href, ...restAttrs.value };
  return { type: "button", disabled: props.disabled || props.loading, ...restAttrs.value };
});
// #endregion

const uiBase = computed(() => props.ui?.base ?? "");

// Icon sizing matches button text size
const iconSizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: "size-3",
    sm: "size-4",
    md: "size-4",
    lg: "size-5",
    xl: "size-5",
  };
  return map[props.size ?? "sm"];
});
</script>
