// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import Sprite from "./Sprite.vue";

const meta = {
  title: "home/Sprite",
  component: Sprite,
} satisfies Meta<typeof Sprite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Left: Story = {
  args: {
    half: "left",
  },
};

export const Right: Story = {
  args: {
    half: "right",
  },
};
