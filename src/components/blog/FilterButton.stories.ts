// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import FilterButton from "./FilterButton.vue";

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
  { id: 3, label: "Business", value: 3 },
];

const meta = {
  title: "blog/FilterButton",
  component: FilterButton,
  args: {
    label: "Categories",
    items: defaultItems,
    onChange: fn(),
  },
  // Local ref keeps the popover interactive; `change` still logs to the Actions panel.
  render: (args) => ({
    components: { FilterButton },
    setup: () => {
      const selected = ref([...args.modelValue]);
      return { args, selected };
    },
    template: `
      <div class="p-6">
        <FilterButton
          v-model="selected"
          :label="args.label"
          :items="args.items"
          :icon="args.icon"
          @change="args.onChange"
        />
        <p class="mt-4 text-sm text-abyssal-ink/70">Selected IDs: {{ selected.join(", ") || "none" }}</p>
      </div>
    `,
  }),
} satisfies Meta<typeof FilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { modelValue: [] } };
export const WithSelection: Story = { args: { modelValue: [12, 21] } };
export const WithIcon: Story = { args: { modelValue: [], label: "Tags", icon: "i-lucide-filter" } };
