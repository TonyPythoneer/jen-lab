// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PageContainer from "./PageContainer.vue";

const meta = {
  title: "site/PageContainer",
  component: PageContainer,
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: any) => ({
    components: { PageContainer },
    setup: () => ({ args }),
    template: `
      <PageContainer v-bind="args">
        <h1 class="font-display text-4xl mb-4">Page Title</h1>
        <p class="text-abyssal-ink/70">This is sample page content inside a page container.</p>
      </PageContainer>
    `,
  }),
  args: {
    breakout: false,
  },
};

export const Breakout: Story = {
  render: (args: any) => ({
    components: { PageContainer },
    setup: () => ({ args }),
    template: `
      <PageContainer v-bind="args">
        <div class="full-bleed bg-sydney-sky py-8 px-4">
          <h2 class="font-display text-2xl">Full-bleed Section</h2>
          <p class="text-abyssal-ink/70">This section breaks out to full viewport width.</p>
        </div>
      </PageContainer>
    `,
  }),
  args: {
    breakout: true,
  },
};
