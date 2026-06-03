// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionNewsletter from "./SectionNewsletter.vue";

const meta = {
  title: "home/SectionNewsletter",
  component: SectionNewsletter,
} satisfies Meta<typeof SectionNewsletter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { SectionNewsletter },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] min-h-dvh p-8">
        <SectionNewsletter v-bind="args" />
      </div>
    `,
  }),
};

export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { SectionNewsletter },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionNewsletter v-bind="args" /></div>`,
  }),
  args: {},
};
