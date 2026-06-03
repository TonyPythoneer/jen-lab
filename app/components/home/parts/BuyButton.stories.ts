// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BuyButton from "./BuyButton.vue";

const meta = {
  title: "home/parts/BuyButton",
  component: BuyButton,
} satisfies Meta<typeof BuyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    purchaseUrl: "https://example.com/buy",
    open: false,
    sparkCount: 72,
    sparkSpread: 320,
    sparkSize: 12,
    ringWidth: 10,
    durationMs: 3000,
  },
};

export const Open: Story = {
  args: {
    purchaseUrl: "https://example.com/buy",
    open: true,
    sparkCount: 72,
    sparkSpread: 320,
    sparkSize: 12,
    ringWidth: 10,
    durationMs: 3000,
  },
};

export const CustomSparkCount: Story = {
  args: {
    purchaseUrl: "https://example.com/buy",
    open: false,
    sparkCount: 36,
    sparkSpread: 250,
    sparkSize: 10,
    ringWidth: 8,
    durationMs: 2000,
  },
};
