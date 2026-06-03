// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import OperaHouseSvg from "./OperaHouseSvg.vue";

const meta = {
  title: "home/OperaHouseSvg",
  component: OperaHouseSvg,
} satisfies Meta<typeof OperaHouseSvg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { OperaHouseSvg },
    template: `<div class="w-80 h-96"><OperaHouseSvg /></div>`,
  }),
  args: {},
};
