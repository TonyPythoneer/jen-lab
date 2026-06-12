// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionHero from "./SectionHero.vue";

const meta = {
  title: "home/SectionHero",
  component: SectionHero,
} satisfies Meta<typeof SectionHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InPage: Story = {
  render: (args) => ({
    components: { SectionHero },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh"><SectionHero v-bind="args" /></div>`,
  }),
};
