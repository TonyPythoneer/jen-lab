// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Header from "./Header.vue";

const meta = { title: "site/Header", component: Header } satisfies Meta<typeof Header>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
