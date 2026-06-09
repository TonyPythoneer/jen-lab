// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SearchModal from "./SearchModal.vue";

const meta = {
  title: "blog/SearchModal",
  component: SearchModal,
} satisfies Meta<typeof SearchModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { SearchModal },
    setup: () => {
      // Mock composables
      const useBlogSearch = () => ({
        open: ref(true),
        closeSearch: () => console.log("Search closed"),
      });

      const useBlogTaxonomies = () => ({
        categoryTree: [
          { id: 1, label: "Technology", value: 1 },
          { id: 2, label: "Design", value: 2 },
          { id: 3, label: "Business", value: 3 },
        ],
        tagTree: [
          { id: 11, label: "Vue", value: 11 },
          { id: 12, label: "TypeScript", value: 12 },
          { id: 13, label: "Tutorial", value: 13 },
        ],
      });

      // Override composables in the template by providing them via template scope
      return { args, useBlogSearch, useBlogTaxonomies };
    },
    template: `
      <div class="min-h-screen bg-ash-white">
        <SearchModal v-bind="args" />
      </div>
    `,
  }),
};
