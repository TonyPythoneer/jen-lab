// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import Tabs from "./Tabs.vue";

// Tab-bar only by design: panels are the caller's concern (see profile/Page.vue).
const items = [
  { label: "Career", value: "career" },
  { label: "Travel", value: "travel" },
  { label: "Food", value: "food" },
];

const meta = {
  title: "ui/navigation/Tabs",
  component: Tabs,
  args: { items, "onUpdate:modelValue": fn() },
  render: (args) => ({
    components: { Tabs },
    setup: () => {
      const active = ref(args.modelValue);
      return { args, active };
    },
    template: `
      <div class="p-6">
        <Tabs v-model="active" :items="args.items" @update:model-value="args['onUpdate:modelValue']" />
        <p class="mt-4 text-sm text-abyssal-ink/70">Active: {{ active }}</p>
      </div>
    `,
  }),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { modelValue: "career" } };
export const LastActive: Story = { args: { modelValue: "food" } };
