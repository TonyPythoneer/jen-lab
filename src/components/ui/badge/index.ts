import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

// Brand Badge on cva, using the shadcn bridge tokens (foreground=abyssal-ink,
// primary-foreground=pure-white). Brand `default` = ink fill (NOT shadcn's orange
// primary); `outline` = a 1px ring (not a border).
export const badgeVariants = cva("inline-flex items-center font-medium rounded-button", {
  variants: {
    variant: {
      default: "bg-foreground text-primary-foreground",
      outline: "ring-1 ring-foreground/30 text-foreground",
      soft: "bg-foreground/10 text-foreground",
    },
    size: {
      xs: "text-[10px] px-1.5 py-0.5 gap-1",
      sm: "text-xs px-2 py-0.5 gap-1",
      md: "text-sm px-2.5 py-1 gap-1.5",
    },
  },
  defaultVariants: { variant: "default", size: "sm" },
});

export type BadgeVariants = VariantProps<typeof badgeVariants>;
