// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ScrollToTopButton from "./ScrollToTopButton.vue";

const meta = {
  title: "shared/ScrollToTopButton",
  component: ScrollToTopButton,
} satisfies Meta<typeof ScrollToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    threshold: 200,
  },
  render: (args) => ({
    components: { ScrollToTopButton },
    setup: () => {
      const isScrolled = ref(false);
      return { args, isScrolled };
    },
    template: `
      <div class="min-h-[200vh] bg-gray-50 p-8">
        <div class="max-w-2xl mx-auto space-y-4">
          <h1 class="text-3xl font-bold">Scroll down to see the button</h1>
          <p class="text-gray-600">The button appears after scrolling {{ args.threshold }}px down the page.</p>
          <div v-for="i in 20" :key="i" class="p-4 bg-white rounded border">
            <p>Paragraph {{ i }}</p>
          </div>
        </div>
        <ScrollToTopButton v-bind="args" />
      </div>
    `,
  }),
};

export const CustomThreshold: Story = {
  args: {
    threshold: 500,
  },
  render: (args) => ({
    components: { ScrollToTopButton },
    setup: () => ({ args }),
    template: `
      <div class="min-h-[200vh] bg-gray-50 p-8">
        <div class="max-w-2xl mx-auto space-y-4">
          <h1 class="text-3xl font-bold">Custom Threshold (500px)</h1>
          <div v-for="i in 30" :key="i" class="p-4 bg-white rounded border">
            <p>Paragraph {{ i }}</p>
          </div>
        </div>
        <ScrollToTopButton v-bind="args" />
      </div>
    `,
  }),
};
