// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EnvelopeAnimation from "./EnvelopeAnimation.vue";

const meta = {
  title: "home/EnvelopeAnimation",
  component: EnvelopeAnimation,
} satisfies Meta<typeof EnvelopeAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { EnvelopeAnimation },
    template: `<div class="flex justify-center items-center h-80 bg-pure-white"><EnvelopeAnimation /></div>`,
  }),
  args: {},
};
