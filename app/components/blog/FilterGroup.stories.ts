// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import FilterGroup from "./FilterGroup.vue";

const meta = {
  title: "blog/FilterGroup",
  component: FilterGroup,
} satisfies Meta<typeof FilterGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Category",
    items: [
      { value: "tech", label: "Technology", dotColor: "#524ae9" },
      { value: "travel", label: "Travel", dotColor: "#fc5000" },
      { value: "food", label: "Food & Dining", dotColor: "#06a699" },
    ],
    modelValue: null,
  },
};

export const WithSelected: Story = {
  args: {
    title: "Filter by Topic",
    items: [
      { value: "career", label: "Career", dotColor: "#524ae9" },
      { value: "lifestyle", label: "Lifestyle", dotColor: "#fc5000" },
    ],
    modelValue: "career",
  },
};
