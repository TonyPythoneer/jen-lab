// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Picture from "./Picture.vue";

const meta = {
  title: "shared/Picture",
  component: Picture,
  render: (args) => ({
    components: { Picture },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-md">
        <Picture v-bind="args" class="w-full rounded-card" />
      </div>
    `,
  }),
} satisfies Meta<typeof Picture>;

export default meta;
type Story = StoryObj<typeof meta>;

// src in avifManifest → renders <source type="image/avif"> + webp fallback.
export const WithAvif: Story = { args: { src: "/home/jen-knows.webp" } };
// src not in the manifest → plain <img>, no <source>.
export const WebpOnly: Story = { args: { src: "/home/jen-knows/avatar.webp" } };
