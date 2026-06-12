// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import Pagination from "./Pagination.vue";
// Runtime template strings skip unplugin-vue-components — register Button explicitly.
import Button from "../element/Button.vue";

const meta = {
  title: "ui/navigation/Pagination",
  component: Pagination,
  args: { itemsPerPage: 10, "onUpdate:page": fn() },
  // Interactive page state + the same #item markup the blogs page supplies.
  render: (args) => ({
    components: { Pagination, Button },
    setup: () => {
      const current = ref(args.page);
      return { args, current };
    },
    template: `
      <div class="p-6 flex justify-center">
        <Pagination
          :page="current"
          :total="args.total"
          :items-per-page="args.itemsPerPage"
          :disabled="args.disabled"
          @update:page="(p) => { current = p; args['onUpdate:page'](p); }"
        >
          <template #item="{ item, page: activePage }">
            <Button
              v-if="item.type === 'page'"
              :label="String(item.value)"
              square
              color="neutral"
              variant="outline"
              :class="item.value === activePage ? 'bg-digital-orange text-pure-white shadow-none hover:bg-digital-orange hover:text-pure-white' : ''"
            />
            <span v-else class="px-1 text-abyssal-ink/50">{{ item.value }}</span>
          </template>
        </Pagination>
      </div>
    `,
  }),
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewPages: Story = { args: { page: 1, total: 30 } };
export const ManyPages: Story = { args: { page: 7, total: 200 } };
export const Disabled: Story = { args: { page: 1, total: 30, disabled: true } };
