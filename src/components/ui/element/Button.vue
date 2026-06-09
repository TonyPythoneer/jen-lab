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
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { RouterLink, type RouteLocationRaw } from "vue-router";
import { cn } from "~/lib/utils";
import { useSplitClassAttrs } from "~/composables/shared/useSplitClassAttrs";

defineOptions({ inheritAttrs: false });

// Brand Button on cva. Classes use the shadcn-bridge tokens (primary=digital-orange,
// foreground=abyssal-ink, primary-foreground=pure-white, secondary=cyber-violet,
// accent=ink/8, ring=digital-orange) so the look is identical and 100% on the
// shadcn token system. The color×variant matrix lives in compoundVariants.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-button font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
    // Only the color×variant pairs the brand actually defines carry classes.
    compoundVariants: [
      {
        color: "primary",
        variant: "solid",
        // hover darkens to a one-off shade no token covers
        class: "bg-primary text-primary-foreground hover:bg-[#e34800]",
      },
      {
        color: "neutral",
        variant: "solid",
        class: "bg-foreground text-primary-foreground hover:bg-foreground/90",
      },
      {
        color: "neutral",
        variant: "outline",
        class:
          "shadow-[inset_0_0_0_1.5px_var(--foreground)] text-foreground hover:bg-foreground hover:text-primary-foreground hover:shadow-none",
      },
      { color: "neutral", variant: "ghost", class: "text-foreground hover:bg-accent" },
      {
        color: "primary",
        variant: "soft",
        class: "bg-primary/10 text-primary hover:bg-primary/20",
      },
      {
        color: "neutral",
        variant: "soft",
        class: "bg-foreground/10 text-foreground hover:bg-foreground/20",
      },
      {
        color: "secondary",
        variant: "soft",
        class: "bg-secondary/10 text-secondary hover:bg-secondary/20",
      },
    ],
    defaultVariants: { color: "neutral", variant: "solid", size: "sm" },
  },
);
type ButtonVariants = VariantProps<typeof buttonVariants>;

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
