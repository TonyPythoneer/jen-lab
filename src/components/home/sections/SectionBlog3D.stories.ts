// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionBlog3D from "./SectionBlog3D.vue";

const meta = { title: "home/sections/SectionBlog3D", component: SectionBlog3D } satisfies Meta<
  typeof SectionBlog3D
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    postCount: 6,
    spinDuration: 30,
  },
  render: (args) => ({
    components: { SectionBlog3D },
    setup() {
      return { args };
    },
    template:
      '<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionBlog3D v-bind="args" /></div>',
  }),
};

export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { SectionBlog3D },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionBlog3D v-bind="args" /></div>`,
  }),
  args: {},
};
