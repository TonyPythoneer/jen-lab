// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SearchModal from "./SearchModal.vue";
import { useBlogSearch } from "~/composables/blog/useBlogSearch";

const meta = {
  title: "blog/SearchModal",
  component: SearchModal,
} satisfies Meta<typeof SearchModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// SearchModal opens through the module-level useBlogSearch flag — the same shared
// state the header icon flips. Flip it in setup so the slideover renders open.
// Categories/tags come from the real #velite collections.
export const Open: Story = {
  render: (args) => ({
    components: { SearchModal },
    setup: () => {
      useBlogSearch().openSearch();
      return { args };
    },
    template: `<div class="min-h-screen"><SearchModal v-bind="args" /></div>`,
  }),
};
