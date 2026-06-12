// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import Slideover from "./Slideover.vue";
// Runtime template strings skip unplugin-vue-components — register Button explicitly.
import Button from "../element/Button.vue";

const meta = {
  title: "ui/overlay/Slideover",
  component: Slideover,
  args: {
    title: "Demo panel",
    description: "Storybook demo of the Slideover overlay.",
    "onUpdate:open": fn(),
  },
  argTypes: {
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
  },
  render: (args) => ({
    components: { Slideover, Button },
    setup: () => {
      const open = ref(args.open);
      return { args, open };
    },
    template: `
      <div class="p-6">
        <Button label="Open panel" color="neutral" variant="outline" @click="open = true" />
        <Slideover
          :open="open"
          :side="args.side"
          :dismissible="args.dismissible"
          :title="args.title"
          :description="args.description"
          @update:open="(v) => { open = v; args['onUpdate:open'](v); }"
        >
          <template #content="{ close }">
            <div class="h-full w-80 max-w-full bg-pure-white p-6">
              <h2 class="font-display text-2xl text-abyssal-ink">Panel</h2>
              <p class="mt-2 text-abyssal-ink/70">Slides from {{ args.side ?? "right" }}.</p>
              <Button class="mt-6" label="Close" color="neutral" variant="ghost" @click="close()" />
            </div>
          </template>
        </Slideover>
      </div>
    `,
  }),
} satisfies Meta<typeof Slideover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenRight: Story = { args: { open: true } };
// `top` is the SearchModal configuration — the panel content goes full-width.
export const OpenTop: Story = { args: { open: true, side: "top" } };
export const NotDismissible: Story = { args: { open: true, dismissible: false } };
