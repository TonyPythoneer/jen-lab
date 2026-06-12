// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BackgroundDots from "./BackgroundDots.vue";

const meta = {
  title: "shared/BackgroundDots",
  component: BackgroundDots,
  // Dots need a surface + positioning context — the wrapper is part of the demo.
  render: (args: any) => ({
    components: { BackgroundDots },
    setup: () => ({ args }),
    template: `<div class="relative w-full h-80 bg-ash-white"><BackgroundDots v-bind="args" /></div>`,
  }),
} satisfies Meta<typeof BackgroundDots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: "var(--color-abyssal-ink)",
    size: 1.5,
    spacing: 24,
    opacity: 0.15,
  },
};

export const Sparse: Story = {
  args: {
    color: "var(--color-digital-orange)",
    size: 2,
    spacing: 48,
    opacity: 0.1,
  },
};

export const Dense: Story = {
  args: {
    color: "var(--color-cyber-violet)",
    size: 1,
    spacing: 12,
    opacity: 0.2,
  },
};
