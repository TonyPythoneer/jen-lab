// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Skeleton from "./Skeleton.vue";

const meta = {
  title: "ui/element/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sizing comes from the caller's class — the component is just the pulse surface.
export const Shapes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="p-6 max-w-sm space-y-4">
        <Skeleton class="size-12 rounded-full" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-40 w-full rounded-card" />
      </div>
    `,
  }),
};
