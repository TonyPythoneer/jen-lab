// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import HarbourBridgeSvg from "./HarbourBridgeSvg.vue";

const meta = {
  title: "home/art/HarbourBridgeSvg",
  component: HarbourBridgeSvg,
} satisfies Meta<typeof HarbourBridgeSvg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { HarbourBridgeSvg },
    template: `<div class="w-80 h-64"><HarbourBridgeSvg /></div>`,
  }),
  args: {},
};
