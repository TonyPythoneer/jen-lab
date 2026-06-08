// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Portal from "./Portal.vue";

const meta = { title: "home/motion/Portal", component: Portal } satisfies Meta<typeof Portal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: "/blogs",
    icon: "i-lucide-notebook",
    title: "部落格",
    brief: "深入淺出的澳洲知識",
  },
};
