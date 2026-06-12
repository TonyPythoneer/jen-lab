// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ScrollToTopButton from "./ScrollToTopButton.vue";

const meta = {
  title: "shared/ScrollToTopButton",
  component: ScrollToTopButton,
  render: (args) => ({
    components: { ScrollToTopButton },
    setup: () => ({ args }),
    template: `
      <div class="min-h-[200vh] p-8">
        <div class="max-w-2xl mx-auto space-y-4">
          <h1 class="font-display text-3xl">Scroll down to see the button</h1>
          <p class="text-abyssal-ink/70">The button appears after scrolling {{ args.threshold }}px down the page.</p>
          <div v-for="i in 25" :key="i" class="p-4 bg-pure-white rounded border border-abyssal-ink/10">
            <p>Paragraph {{ i }}</p>
          </div>
        </div>
        <ScrollToTopButton v-bind="args" />
      </div>
    `,
  }),
} satisfies Meta<typeof ScrollToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { threshold: 200 } };
export const CustomThreshold: Story = { args: { threshold: 500 } };
