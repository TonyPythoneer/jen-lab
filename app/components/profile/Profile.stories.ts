// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Profile from "./Profile.vue";

const meta = {
  title: "profile/Profile",
  component: Profile,
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProfile = {
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
  name: "Jen",
  tabs: [
    {
      label: "Knows",
      bio: "Sydney-based career coach and writer exploring workplace dynamics and personal growth.",
    },
    {
      label: "Liu",
      bio: "Travel writer and author documenting adventures across Australia and beyond.",
    },
  ],
};

export const Default: Story = {
  args: {
    profile: mockProfile,
  },
  render: (args) => ({
    components: { Profile },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm mx-auto">
        <Profile v-bind="args" />
      </div>
    `,
  }),
};

export const SingleTab: Story = {
  args: {
    profile: {
      ...mockProfile,
      tabs: [mockProfile.tabs[0]],
    },
  },
  render: (args) => ({
    components: { Profile },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm mx-auto">
        <Profile v-bind="args" />
      </div>
    `,
  }),
};

export const MultipleTabs: Story = {
  args: {
    profile: {
      ...mockProfile,
      tabs: [
        ...mockProfile.tabs,
        {
          label: "Author",
          bio: "Dedicated to creating meaningful content for readers worldwide.",
        },
      ],
    },
  },
  render: (args) => ({
    components: { Profile },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm mx-auto">
        <Profile v-bind="args" />
      </div>
    `,
  }),
};
