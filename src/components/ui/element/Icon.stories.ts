// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Icon from "./Icon.vue";

const meta = {
  title: "ui/element/Icon",
  component: Icon,
  args: { name: "i-lucide-search" },
  render: (args) => ({
    components: { Icon },
    setup: () => ({ args }),
    template: `<div class="p-6"><Icon v-bind="args" class="size-8 text-abyssal-ink" /></div>`,
  }),
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Icons from each bundled collection (generated/icons/*.json) — proves the
// name-prefix mapping (incl. multi-word prefixes) and the offline registration.
export const Gallery: Story = {
  render: () => ({
    components: { Icon },
    setup: () => ({
      icons: [
        "i-lucide-search",
        "i-lucide-x",
        "i-lucide-filter",
        "i-lucide-heart",
        "i-lucide-mail",
        "i-lucide-calendar",
        "i-simple-icons-github",
        "i-simple-icons-youtube",
        "i-simple-icons-instagram",
        "i-streamline-freehand-e-commerce-click-buy",
      ],
    }),
    template: `
      <div class="p-6 flex flex-wrap gap-4">
        <div v-for="n in icons" :key="n" class="flex flex-col items-center gap-1">
          <Icon :name="n" class="size-6 text-abyssal-ink" />
          <code class="text-[10px] text-abyssal-ink/50">{{ n }}</code>
        </div>
      </div>
    `,
  }),
};
