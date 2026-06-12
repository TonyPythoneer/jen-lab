// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Product from "./Product.vue";

const meta = {
  title: "profile/Product",
  component: Product,
  render: (args) => ({
    components: { Product },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-md">
        <Product v-bind="args" />
      </div>
    `,
  }),
} satisfies Meta<typeof Product>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    banner: "https://images.unsplash.com/photo-1507842872885-ce7c1d7ff17f?w=400&h=300&fit=crop",
    title: "雪梨 附：藍山．紐卡索．獵人谷．賈維斯灣",
    descriptionHtml:
      "<p>Explore the beauty of Sydney and beyond with insider knowledge. Each chapter covers different regions with practical tips and stunning visuals.</p>",
    purchaseUrl: "https://books.com.tw",
  },
};

export const WithoutBanner: Story = {
  args: {
    banner: undefined,
    title: "Digital Product",
    descriptionHtml: "<p>Learn modern web development practices with hands-on projects.</p>",
    purchaseUrl: "https://example.com",
  },
};

export const WithExtendedDescription: Story = {
  args: {
    banner: "https://images.unsplash.com/photo-1507842872885-ce7c1d7ff17f?w=400&h=300&fit=crop",
    title: "Complete Guide",
    descriptionHtml: `
      <p>This comprehensive guide covers:</p>
      <ul>
        <li>Chapter 1: Introduction</li>
        <li>Chapter 2: Core Concepts</li>
        <li>Chapter 3: Advanced Topics</li>
      </ul>
      <p>Perfect for beginners and intermediate learners.</p>
    `,
    purchaseUrl: "https://example.com",
  },
};
