// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContentBody from "./ContentBody.vue";
import type { Collections } from "@nuxt/content";

const meta = {
  title: "home/ContentBody",
  component: ContentBody,
} satisfies Meta<typeof ContentBody>;

export default meta;
type Story = StoryObj<typeof meta>;

type HomePage = Collections["home"];

export const Default: Story = {
  args: {
    page: {
      sections: [
        {
          id: "section-1",
          label: "Portfolio",
          component: "portal-list",
          portals: [
            {
              to: "https://example.com",
              label: "My Project",
              description: "A sample project",
            },
          ],
        },
      ],
      _path: "/",
    } as HomePage,
    show: true,
  },
};

export const Empty: Story = {
  args: {
    page: {
      sections: [],
      _path: "/",
    } as HomePage,
    show: true,
  },
};

export const Hidden: Story = {
  args: {
    page: {
      sections: [
        {
          id: "section-1",
          label: "Content",
          component: "portal-list",
          portals: [],
        },
      ],
      _path: "/",
    } as HomePage,
    show: false,
  },
};
