// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import WaveSvg from "./WaveSvg.vue";

const meta = {
  title: "home/WaveSvg",
  component: WaveSvg,
} satisfies Meta<typeof WaveSvg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { WaveSvg },
    template: `<div class="w-96 h-64"><WaveSvg /></div>`,
  }),
  args: {},
};
