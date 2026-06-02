// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PostCardSkeleton from "./PostCardSkeleton.vue";

const meta = {
  title: "blog/PostCardSkeleton",
  component: PostCardSkeleton,
} satisfies Meta<typeof PostCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { PostCardSkeleton },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-md">
        <PostCardSkeleton v-bind="args" />
      </div>
    `,
  }),
};

export const Grid: Story = {
  args: {},
  render: (args) => ({
    components: { PostCardSkeleton },
    setup: () => ({ args }),
    template: `
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <PostCardSkeleton v-bind="args" />
        <PostCardSkeleton v-bind="args" />
        <PostCardSkeleton v-bind="args" />
        <PostCardSkeleton v-bind="args" />
      </div>
    `,
  }),
};
