// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BubbleTeaCss from "./BubbleTeaCss.vue";

const meta = {
  title: "home/BubbleTeaCss",
  component: BubbleTeaCss,
} satisfies Meta<typeof BubbleTeaCss>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { BubbleTeaCss },
    template: `<div class="flex justify-center items-center h-80 bg-pure-white"><BubbleTeaCss /></div>`,
  }),
  args: {},
};
