// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Aurora from "./Aurora.vue";

const meta = {
  title: "fx/Aurora",
  component: Aurora,
} satisfies Meta<typeof Aurora>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: any) => ({
    components: { Aurora },
    setup: () => ({ args }),
    template: `<div class="w-40 h-40 flex items-center justify-center"><Aurora v-bind="args"><span class="text-sm font-semibold text-gray-700">Content</span></Aurora></div>`,
  }),
  args: {
    color: "orange",
    rounded: "rounded-button",
  },
};

export const Violet: Story = {
  render: (args: any) => ({
    components: { Aurora },
    setup: () => ({ args }),
    template: `<div class="w-40 h-40 flex items-center justify-center"><Aurora v-bind="args"><span class="text-sm font-semibold text-gray-700">Content</span></Aurora></div>`,
  }),
  args: {
    color: "violet",
    rounded: "rounded-button",
  },
};

export const LargeRounded: Story = {
  render: (args: any) => ({
    components: { Aurora },
    setup: () => ({ args }),
    template: `<div class="w-48 h-48 flex items-center justify-center"><Aurora v-bind="args"><span class="text-sm font-semibold text-gray-700">Large</span></Aurora></div>`,
  }),
  args: {
    color: "orange",
    rounded: "rounded-full",
  },
};
