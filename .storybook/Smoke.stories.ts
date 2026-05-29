// @ts-expect-error - Storybook types
import type { Meta, StoryObj } from "@storybook/vue3";

const meta: Meta = {
  title: "_smoke/Theme",
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-4 items-start font-sans">
        <h1 class="text-heading font-display">Storybook is up</h1>
        <UButton color="primary">Primary (digital-orange)</UButton>
        <UButton color="neutral" variant="outline">Ghost neutral</UButton>
        <UBadge color="secondary">secondary</UBadge>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
