// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImageGallery from "./ImageGallery.vue";

const meta = {
  title: "home/ImageGallery",
  component: ImageGallery,
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
];

export const Default: Story = {
  args: {
    images: mockImages,
  },
  render: (args) => ({
    components: { ImageGallery },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-4xl">
        <ImageGallery v-bind="args" />
      </div>
    `,
  }),
};

export const SingleImage: Story = {
  args: {
    images: [mockImages[0]],
  },
  render: (args) => ({
    components: { ImageGallery },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-4xl">
        <ImageGallery v-bind="args" />
      </div>
    `,
  }),
};

export const ManyImages: Story = {
  args: {
    images: [...mockImages, mockImages[0], mockImages[1], mockImages[2], mockImages[0]],
  },
  render: (args) => ({
    components: { ImageGallery },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-4xl">
        <ImageGallery v-bind="args" />
      </div>
    `,
  }),
};
