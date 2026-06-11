// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import YoutubeGallery from "./YoutubeGallery.vue";

const meta = {
  title: "profile/YoutubeGallery",
  component: YoutubeGallery,
} satisfies Meta<typeof YoutubeGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockVideos = [
  { id: "jNQXAC9IVRw", title: "Me at the zoo" },
  { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up" },
  { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE" },
];

export const Default: Story = {
  args: {
    videos: mockVideos,
  },
  render: (args) => ({
    components: { YoutubeGallery },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-4xl">
        <YoutubeGallery v-bind="args" />
      </div>
    `,
  }),
};

export const SingleVideo: Story = {
  args: {
    videos: [mockVideos[0]],
  },
  render: (args) => ({
    components: { YoutubeGallery },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-4xl">
        <YoutubeGallery v-bind="args" />
      </div>
    `,
  }),
};

export const ManyVideos: Story = {
  args: {
    videos: [...mockVideos, ...mockVideos, mockVideos[0]],
  },
  render: (args) => ({
    components: { YoutubeGallery },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-4xl">
        <YoutubeGallery v-bind="args" />
      </div>
    `,
  }),
};
