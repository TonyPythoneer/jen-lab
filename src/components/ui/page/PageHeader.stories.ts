// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PageHeader from "./PageHeader.vue";

const meta = {
  title: "ui/page/PageHeader",
  component: PageHeader,
  args: {
    title: "Blogs",
    description: "深入淺出的澳洲生活筆記",
    ui: { title: "text-5xl" },
  },
  render: (args) => ({
    components: { PageHeader },
    setup: () => ({ args }),
    template: `<div class="p-8"><PageHeader v-bind="args" /></div>`,
  }),
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { description: undefined } };
export const LongContent: Story = {
  args: {
    title: "A Very Long Page Title That Wraps Across Multiple Lines on Mobile",
    description:
      "A longer description paragraph to check measure, leading, and how the muted ink tone reads at length on the canvas background.",
  },
};
