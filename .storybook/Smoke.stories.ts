import type { Meta, StoryObj } from "@storybook/vue3-vite";
// @ts-expect-error — tsconfig doesn't cover .storybook/ context, but runtime works fine
import Smoke from "../app/storybook/Smoke.vue";

const meta = {
  title: "_smoke/Theme",
  component: Smoke,
} satisfies Meta<typeof Smoke>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
