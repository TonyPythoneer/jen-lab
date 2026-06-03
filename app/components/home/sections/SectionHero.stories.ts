// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionHero from "./SectionHero.vue";

const meta = {
  title: "home/sections/SectionHero",
  component: SectionHero,
} satisfies Meta<typeof SectionHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { SectionHero },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)]">
        <SectionHero v-bind="args" />
      </div>
    `,
  }),
};

export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { SectionHero },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionHero v-bind="args" /></div>`,
  }),
  args: {},
};
