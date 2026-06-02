// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PostCard from "./PostCard.vue";

const meta = { title: "blog/PostCard", component: PostCard } satisfies Meta<typeof PostCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const basePost = {
  id: 1,
  date: new Date().toISOString(),
  slug: "sydney-best-yum-cha",
  title: { rendered: "雪梨最好吃的早午餐清單" },
  excerpt: { rendered: "<p>從 CBD 到內西區，實測過的口袋名單。</p>" },
  content: { rendered: "<p>Full content here</p>" },
  link: "https://example.com/post/1",
  tags: [10, 20],
  categories: [1],
  jetpack_featured_media_url: "https://picsum.photos/seed/jenlab/640/360",
};

const tagMap = { 10: "早午餐", 20: "雪梨" };

export const Default: Story = {
  args: {
    post: basePost,
    to: "/blogs/sydney-best-yum-cha",
    tagMap,
  },
  render: (args) => ({
    components: { PostCard },
    setup() {
      return { args };
    },
    template: '<div class="max-w-sm"><PostCard v-bind="args" /></div>',
  }),
};

export const NoImage: Story = {
  args: {
    post: {
      ...basePost,
      jetpack_featured_media_url: "",
    },
    to: "/blogs/sydney-best-yum-cha",
    tagMap,
  },
  render: (args) => ({
    components: { PostCard },
    setup() {
      return { args };
    },
    template: '<div class="max-w-sm"><PostCard v-bind="args" /></div>',
  }),
};

export const NewBadge: Story = {
  args: {
    post: {
      ...basePost,
      date: new Date().toISOString(),
    },
    to: "/blogs/sydney-best-yum-cha",
    tagMap,
  },
  render: (args) => ({
    components: { PostCard },
    setup() {
      return { args };
    },
    template: '<div class="max-w-sm"><PostCard v-bind="args" /></div>',
  }),
};
