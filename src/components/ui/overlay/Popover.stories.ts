// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Popover from "./Popover.vue";
// Runtime template strings skip unplugin-vue-components — register Button explicitly.
import Button from "../element/Button.vue";

const meta = {
  title: "ui/overlay/Popover",
  component: Popover,
  argTypes: {
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <div class="p-24 flex justify-center">
        <Popover :side="args.side" :align="args.align">
          <Button label="Toggle popover" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 w-64">
              <p class="text-sm text-abyssal-ink/70">
                Anchored content. Click outside or press Esc to dismiss.
              </p>
            </div>
          </template>
        </Popover>
      </div>
    `,
  }),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TopCentered: Story = { args: { side: "top", align: "center" } };
