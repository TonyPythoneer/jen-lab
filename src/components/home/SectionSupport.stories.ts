// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SectionSupport from "./SectionSupport.vue";

const meta = {
  title: "home/SectionSupport",
  component: SectionSupport,
} satisfies Meta<typeof SectionSupport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { brand: "jen-knows" } };
export const JenLiu: Story = { args: { brand: "jen-liu" } };
export const NoBrand: Story = { args: { brand: undefined } };

export const InPage: Story = {
  args: { brand: "jen-knows" },
  render: (args) => ({
    components: { SectionSupport },
    setup: () => ({ args }),
    template: `<div class="min-h-dvh"><SectionSupport v-bind="args" /></div>`,
  }),
};
