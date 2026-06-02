// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContactLinks from "./ContactLinks.vue";

const meta = { title: "shared/ContactLinks", component: ContactLinks } satisfies Meta<
  typeof ContactLinks
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
