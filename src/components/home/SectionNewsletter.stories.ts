// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionNewsletter from "./SectionNewsletter.vue";

const meta = {
  title: "home/SectionNewsletter",
  component: SectionNewsletter,
} satisfies Meta<typeof SectionNewsletter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InPage: Story = {
  render: (args) => ({
    components: { SectionNewsletter },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh"><SectionNewsletter v-bind="args" /></div>`,
  }),
};
