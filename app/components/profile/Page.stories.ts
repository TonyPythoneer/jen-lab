// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Page from "./Page.vue";

const meta = {
  title: "profile/Page",
  component: Page,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPageData: any = {
  profile: {
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
    name: "Jen",
    tabs: [
      {
        label: "Career",
        bio: "Sydney-based career coach and workplace dynamics expert.",
      },
      {
        label: "Travel",
        bio: "Travel writer documenting adventures and local insights.",
      },
    ],
  },
  sections: [
    {
      id: "portals-section",
      label: "Featured Links",
      component: "portal-list",
      portals: [
        {
          to: "https://example.com",
          label: "Project 1",
          description: "A showcase project",
        },
        {
          to: "https://example.com",
          label: "Project 2",
          description: "Another project",
        },
      ],
    },
    {
      id: "products-section",
      label: "Products",
      component: "product-list",
      products: [
        {
          banner:
            "https://images.unsplash.com/photo-1507842872885-ce7c1d7ff17f?w=400&h=300&fit=crop",
          title: "Book Title",
          brief: "A great book",
          descriptionHtml: "<p>Description of the book</p>",
          purchaseUrl: "https://example.com",
          purchaseLabel: "Buy",
        },
      ],
    },
    {
      id: "youtube-section",
      label: "Videos",
      component: "youtube-carousel",
      carousels: [
        {
          id: "carousel-1",
          label: "Latest Videos",
          videos: [
            { id: "jNQXAC9IVRw", title: "Video 1" },
            { id: "dQw4w9WgXcQ", title: "Video 2" },
          ],
        },
      ],
    },
  ],
  _path: "/about",
};

export const Default: Story = {
  args: {
    page: mockPageData,
    displayName: "Jen",
    brand: "jen-knows",
  },
  render: (args) => ({
    components: { Page },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)]">
        <Page v-bind="args" />
      </div>
    `,
  }),
};

export const JenLiuBrand: Story = {
  args: {
    page: mockPageData,
    displayName: "Jen",
    brand: "jen-liu",
  },
  render: (args) => ({
    components: { Page },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)]">
        <Page v-bind="args" />
      </div>
    `,
  }),
};

export const MinimalPage: Story = {
  args: {
    page: {
      profile: {
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
        name: "Jen",
        tabs: [
          {
            label: "Bio",
            bio: "Simple profile bio.",
          },
        ],
      },
      sections: [],
      _path: "/about",
    },
    displayName: "Jen",
    brand: "jen-knows",
  },
  render: (args) => ({
    components: { Page },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)]">
        <Page v-bind="args" />
      </div>
    `,
  }),
};
