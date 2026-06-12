// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Badge from "./Badge.vue";

const meta = {
  title: "ui/element/Badge",
  component: Badge,
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "soft"] },
    size: { control: "select", options: ["xs", "sm", "md"] },
  },
  render: (args) => ({
    components: { Badge },
    setup: () => ({ args }),
    template: `<div class="p-6"><Badge v-bind="args">NEW</Badge></div>`,
  }),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="p-6 flex items-center gap-3">
        <Badge v-for="v in ['default', 'outline', 'soft']" :key="v" :variant="v">{{ v }}</Badge>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="p-6 flex items-center gap-3">
        <Badge v-for="s in ['xs', 'sm', 'md']" :key="s" :size="s">{{ s }}</Badge>
      </div>
    `,
  }),
};
