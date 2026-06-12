// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BuyButton from "./BuyButton.vue";

const meta = {
  title: "profile/BuyButton",
  component: BuyButton,
  args: {
    purchaseUrl: "https://example.com/buy",
    open: false,
    sparkCount: 72,
    sparkSpread: 320,
    sparkSize: 12,
    ringWidth: 10,
    durationMs: 3000,
  },
} satisfies Meta<typeof BuyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = { args: { open: true } };
export const CustomSparkCount: Story = {
  args: { sparkCount: 36, sparkSpread: 250, sparkSize: 10, ringWidth: 8, durationMs: 2000 },
};
