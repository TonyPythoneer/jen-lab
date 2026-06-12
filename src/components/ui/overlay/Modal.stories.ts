// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import Modal from "./Modal.vue";
// Runtime template strings skip unplugin-vue-components — register Button explicitly.
import Button from "../element/Button.vue";

const meta = {
  title: "ui/overlay/Modal",
  component: Modal,
  args: {
    title: "Demo dialog",
    description: "Storybook demo of the Modal overlay.",
    "onUpdate:open": fn(),
  },
  // Local open state so Esc / overlay-click close works live on the canvas.
  render: (args) => ({
    components: { Modal, Button },
    setup: () => {
      const open = ref(args.open);
      return { args, open };
    },
    template: `
      <div class="p-6">
        <Button label="Open modal" color="primary" variant="solid" @click="open = true" />
        <Modal
          :open="open"
          :fullscreen="args.fullscreen"
          :title="args.title"
          :description="args.description"
          @update:open="(v) => { open = v; args['onUpdate:open'](v); }"
        >
          <template #content>
            <div class="p-8 max-w-md">
              <h2 class="font-display text-2xl text-abyssal-ink">Modal content</h2>
              <p class="mt-2 text-abyssal-ink/70">
                reka-ui Dialog underneath: focus trap, Esc, scroll lock, aria — all built in.
              </p>
              <Button class="mt-6" label="Close" color="neutral" variant="outline" @click="open = false" />
            </div>
          </template>
        </Modal>
      </div>
    `,
  }),
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = { args: { open: true } };
export const ClosedWithTrigger: Story = { args: { open: false } };
