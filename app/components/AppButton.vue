<template>
  <component :is="tag" v-bind="elementAttrs" :class="cn(cvaClass, uiBase, parentClass)">
    <AppIcon v-if="icon" :name="icon" :class="iconSizeClass" class="shrink-0" />
    <span v-if="label !== undefined">{{ label }}</span>
    <slot v-else />
    <AppIcon v-if="trailingIcon" :name="trailingIcon" :class="iconSizeClass" class="shrink-0" />
  </component>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

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

const attrs = useAttrs();
const parentClass = computed(() => (attrs.class as string) ?? "");

// Non-class passthrough attrs (class is merged via cn, not forwarded twice).
const restAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class")),
);

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

// #region CVA — maps color×variant props to design tokens
const button = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-button font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-digital-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      color: { primary: "", neutral: "", secondary: "" },
      variant: { solid: "", outline: "", ghost: "", soft: "" },
      size: {
        xs: "h-6 px-1.5 text-xs",
        sm: "h-8 px-2 text-sm",
        md: "h-9 px-3 text-sm",
        lg: "h-10 px-3.5 text-base",
        xl: "h-11 px-4 text-base",
      },
      square: { true: "px-0 aspect-square" },
    },
    compoundVariants: [
      // Primary solid (orange CTA)
      {
        color: "primary",
        variant: "solid",
        class: "bg-digital-orange text-pure-white hover:bg-[#e34800]",
      },
      // Neutral solid
      {
        color: "neutral",
        variant: "solid",
        class: "bg-abyssal-ink text-pure-white hover:bg-abyssal-ink/90",
      },
      // Neutral outline — 1.5 px inset shadow (matches uiConfig in site.ts)
      {
        color: "neutral",
        variant: "outline",
        class:
          "shadow-[inset_0_0_0_1.5px_var(--color-abyssal-ink)] text-abyssal-ink hover:bg-abyssal-ink hover:text-pure-white hover:shadow-none",
      },
      // Neutral ghost
      {
        color: "neutral",
        variant: "ghost",
        class: "text-abyssal-ink hover:bg-abyssal-ink/8",
      },
      // Primary soft
      {
        color: "primary",
        variant: "soft",
        class: "bg-digital-orange/10 text-digital-orange hover:bg-digital-orange/20",
      },
      // Neutral soft
      {
        color: "neutral",
        variant: "soft",
        class: "bg-abyssal-ink/10 text-abyssal-ink hover:bg-abyssal-ink/20",
      },
      // Secondary soft
      {
        color: "secondary",
        variant: "soft",
        class: "bg-cyber-violet/10 text-cyber-violet hover:bg-cyber-violet/20",
      },
    ],
  },
);

const cvaClass = computed(() =>
  button({ color: props.color, variant: props.variant, size: props.size, square: props.square }),
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
