// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionSupport from "./SectionSupport.vue";

const meta = {
  title: "home/sections/SectionSupport",
  component: SectionSupport,
} satisfies Meta<typeof SectionSupport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: "jen-knows",
  },
  render: (args) => ({
    components: { SectionSupport },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] min-h-dvh p-8">
        <SectionSupport v-bind="args" />
      </div>
    `,
  }),
};

export const JenLiu: Story = {
  args: {
    brand: "jen-liu",
  },
  render: (args) => ({
    components: { SectionSupport },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] min-h-dvh p-8">
        <SectionSupport v-bind="args" />
      </div>
    `,
  }),
};

export const NoBrand: Story = {
  args: {
    brand: undefined,
  },
  render: (args) => ({
    components: { SectionSupport },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] min-h-dvh p-8">
        <SectionSupport v-bind="args" />
      </div>
    `,
  }),
};

export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { SectionSupport },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionSupport v-bind="args" /></div>`,
  }),
  args: {},
};
