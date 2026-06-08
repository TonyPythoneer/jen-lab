<template>
  <component :is="tag" v-bind="elementAttrs" :class="cn(variantClass, uiBase, parentClass)">
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

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    color?: "primary" | "neutral" | "secondary";
    variant?: "solid" | "outline" | "ghost" | "soft";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
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

// #region Variant classes — maps color×variant props to design tokens
const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-button font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-digital-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const SIZE = {
  xs: "h-6 px-1.5 text-xs",
  sm: "h-8 px-2 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-3.5 text-base",
  xl: "h-11 px-4 text-base",
} as const;

// Only the defined color×variant pairs carry classes; the rest fall back to "".
const COMBO: Record<string, string> = {
  "primary-solid": "bg-digital-orange text-pure-white hover:bg-[#e34800]",
  "neutral-solid": "bg-abyssal-ink text-pure-white hover:bg-abyssal-ink/90",
  "neutral-outline":
    "shadow-[inset_0_0_0_1.5px_var(--color-abyssal-ink)] text-abyssal-ink hover:bg-abyssal-ink hover:text-pure-white hover:shadow-none",
  "neutral-ghost": "text-abyssal-ink hover:bg-abyssal-ink/8",
  "primary-soft": "bg-digital-orange/10 text-digital-orange hover:bg-digital-orange/20",
  "neutral-soft": "bg-abyssal-ink/10 text-abyssal-ink hover:bg-abyssal-ink/20",
  "secondary-soft": "bg-cyber-violet/10 text-cyber-violet hover:bg-cyber-violet/20",
};

const variantClass = computed(() =>
  cn(
    BASE,
    SIZE[props.size ?? "sm"],
    COMBO[`${props.color}-${props.variant}`] ?? "",
    props.square && "px-0 aspect-square",
  ),
);

// ui.base adds extra classes to the root — used by callers to tweak padding/radius.
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
// #endregion
</script>
