// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FilterButton from "./FilterButton.vue";

const meta = {
  title: "blog/FilterButton",
  component: FilterButton,
} satisfies Meta<typeof FilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems = [
  {
    id: 1,
    label: "Technology",
    value: 1,
    children: [
      { id: 11, label: "JavaScript", value: 11 },
      { id: 12, label: "Vue.js", value: 12 },
      { id: 13, label: "TypeScript", value: 13 },
    ],
  },
  {
    id: 2,
    label: "Design",
    value: 2,
    children: [
      { id: 21, label: "UI/UX", value: 21 },
      { id: 22, label: "Web Design", value: 22 },
    ],
  },
  {
    id: 3,
    label: "Business",
    value: 3,
  },
];

export const Default: Story = {
  args: {
    modelValue: [],
    label: "Categories",
    items: defaultItems,
  },
  render: (args) => ({
    components: { FilterButton },
    setup: () => {
      const modelValue = ref(args.modelValue);
      return { args: { ...args, modelValue }, modelValue };
    },
    template: `
      <div class="p-6">
        <FilterButton
          v-model="modelValue"
          :label="args.label"
          :items="args.items"
          @change="() => console.log('Filter changed', modelValue)"
        />
      </div>
    `,
  }),
};

export const WithSelection: Story = {
  args: {
    modelValue: [12, 21],
    label: "Categories",
    items: defaultItems,
  },
  render: (args) => ({
    components: { FilterButton },
    setup: () => {
      const modelValue = ref(args.modelValue);
      return { args: { ...args, modelValue }, modelValue };
    },
    template: `
      <div class="p-6">
        <FilterButton
          v-model="modelValue"
          :label="args.label"
          :items="args.items"
        />
        <p class="mt-4 text-sm text-gray-600">Selected IDs: {{ modelValue.join(", ") }}</p>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  args: {
    modelValue: [],
    label: "Tags",
    items: defaultItems,
    icon: "i-lucide-filter",
  },
  render: (args) => ({
    components: { FilterButton },
    setup: () => {
      const modelValue = ref(args.modelValue);
      return { args: { ...args, modelValue }, modelValue };
    },
    template: `
      <div class="p-6">
        <FilterButton
          v-model="modelValue"
          :label="args.label"
          :items="args.items"
          :icon="args.icon"
        />
      </div>
    `,
  }),
};
