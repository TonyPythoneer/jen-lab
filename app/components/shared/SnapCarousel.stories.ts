// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SnapCarousel from "./SnapCarousel.vue";

const meta = { title: "shared/SnapCarousel", component: SnapCarousel } satisfies Meta<
  typeof SnapCarousel
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    template: `<div class="h-64"><SnapCarousel :items="[]"><div class="min-w-full h-full bg-orange-200 flex items-center justify-center">Slide 1</div><div class="min-w-full h-full bg-violet-200 flex items-center justify-center">Slide 2</div><div class="min-w-full h-full bg-sky-200 flex items-center justify-center">Slide 3</div></SnapCarousel></div>`,
  }),
};
