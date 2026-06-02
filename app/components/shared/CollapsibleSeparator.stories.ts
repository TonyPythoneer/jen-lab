// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CollapsibleSeparator from "./CollapsibleSeparator.vue";

const meta = {
  title: "shared/CollapsibleSeparator",
  component: CollapsibleSeparator,
} satisfies Meta<typeof CollapsibleSeparator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "More Options",
  },
  render: (args) => ({
    components: { CollapsibleSeparator },
    setup: () => ({ args }),
    template: `
      <div class="p-6">
        <CollapsibleSeparator v-bind="args">
          <p class="text-sm text-gray-600">Content under the collapsible separator</p>
        </CollapsibleSeparator>
      </div>
    `,
  }),
};

export const DefaultOpen: Story = {
  args: {
    label: "Details",
    defaultOpen: true,
  },
  render: (args) => ({
    components: { CollapsibleSeparator },
    setup: () => ({ args }),
    template: `
      <div class="p-6">
        <CollapsibleSeparator v-bind="args">
          <p class="text-sm text-gray-600">This content is visible by default</p>
        </CollapsibleSeparator>
      </div>
    `,
  }),
};
