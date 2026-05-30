// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import FilterItem from "./FilterItem.vue";

const meta = {
  title: "blog/FilterItem",
  component: FilterItem,
} satisfies Meta<typeof FilterItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: false,
    label: "Technology",
  },
};

export const Active: Story = {
  args: {
    active: true,
    label: "Technology",
  },
};

export const WithDot: Story = {
  args: {
    active: false,
    label: "Travel",
    dotColor: "#fc5000",
  },
};

export const ActiveWithDot: Story = {
  args: {
    active: true,
    label: "Food & Dining",
    dotColor: "#06a699",
  },
};
