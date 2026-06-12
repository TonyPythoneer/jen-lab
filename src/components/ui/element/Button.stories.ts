// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import Button from "./Button.vue";

const meta = {
  title: "ui/element/Button",
  component: Button,
  args: { label: "Button", onClick: fn() },
  argTypes: {
    color: { control: "select", options: ["primary", "neutral", "secondary"] },
    variant: { control: "select", options: ["solid", "outline", "ghost", "soft"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Exactly the color×variant pairs the cva compoundVariants define — nothing off-matrix.
const definedCombos = [
  { color: "primary", variant: "solid" },
  { color: "primary", variant: "soft" },
  { color: "neutral", variant: "solid" },
  { color: "neutral", variant: "outline" },
  { color: "neutral", variant: "ghost" },
  { color: "neutral", variant: "soft" },
  { color: "secondary", variant: "soft" },
];

export const Variants: Story = {
  render: (args) => ({
    components: { Button },
    setup: () => ({ args, definedCombos }),
    template: `
      <div class="p-6 flex flex-wrap items-center gap-3">
        <Button
          v-for="c in definedCombos"
          :key="c.color + c.variant"
          :color="c.color"
          :variant="c.variant"
          :label="c.color + ' / ' + c.variant"
          @click="args.onClick"
        />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: `
      <div class="p-6 flex items-center gap-3">
        <Button v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s" :size="s" :label="s" @click="args.onClick" />
      </div>
    `,
  }),
};

export const WithIcons: Story = {
  args: { icon: "i-lucide-search", trailingIcon: "i-lucide-arrow-right", label: "Search" },
};

export const AsLink: Story = {
  args: { to: "/blogs", label: "Internal link", color: "primary", variant: "solid" },
};

export const Disabled: Story = {
  args: { disabled: true, color: "primary", variant: "solid" },
};
