// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import HarbourBridgeSvg from "./HarbourBridgeSvg.vue";

const meta = {
  title: "home/HarbourBridgeSvg",
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
