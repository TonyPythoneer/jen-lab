// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionDirections from "./SectionDirections.vue";

const meta = {
  title: "home/SectionDirections",
  component: SectionDirections,
} satisfies Meta<typeof SectionDirections>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InPage: Story = {
  render: (args) => ({
    components: { SectionDirections },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh"><SectionDirections v-bind="args" /></div>`,
  }),
};
