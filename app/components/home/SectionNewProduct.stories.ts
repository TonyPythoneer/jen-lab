// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionNewProduct from "./SectionNewProduct.vue";

const meta = {
  title: "home/SectionNewProduct",
  component: SectionNewProduct,
} satisfies Meta<typeof SectionNewProduct>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { SectionNewProduct },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] min-h-dvh p-8">
        <SectionNewProduct v-bind="args" />
      </div>
    `,
  }),
};

export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { SectionNewProduct },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionNewProduct v-bind="args" /></div>`,
  }),
  args: {},
};
