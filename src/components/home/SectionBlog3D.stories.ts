// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionBlog3D from "./SectionBlog3D.vue";

const meta = {
  title: "home/SectionBlog3D",
  component: SectionBlog3D,
  args: {
    postCount: 6,
    spinDuration: 30,
  },
} satisfies Meta<typeof SectionBlog3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InPage: Story = {
  render: (args) => ({
    components: { SectionBlog3D },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh"><SectionBlog3D v-bind="args" /></div>`,
  }),
};
