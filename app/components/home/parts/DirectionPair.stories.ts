// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DirectionPair from "./DirectionPair.vue";

const meta = {
  title: "home/parts/DirectionPair",
  component: DirectionPair,
} satisfies Meta<typeof DirectionPair>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    colorBg: "bg-sydney-sky",
    imageSrc: "/home/jen-knows.png",
    imageAlt: "Jen profile",
    title: "Career",
    subtitle: "and Beyond",
    subtitleClass: "text-digital-orange",
    description:
      "Explore the professional journey and insights from years of experience in diverse industries.",
    ctaLabel: "Learn More",
    ctaClass: "bg-digital-orange hover:bg-[#e34800]",
    ctaTo: "/about",
    coloredSide: "left",
    scrollProgress: 0,
  },
  render: (args) => ({
    components: { DirectionPair },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] h-screen flex items-center justify-center p-8">
        <div class="w-full h-96">
          <DirectionPair v-bind="args" />
        </div>
      </div>
    `,
  }),
};

export const RightAligned: Story = {
  args: {
    colorBg: "bg-rose-100",
    imageSrc: "/home/jen-liu.png",
    imageAlt: "Jen profile",
    title: "Travel",
    subtitle: "Stories",
    subtitleClass: "text-orange-600",
    description: "Discover stories and hidden gems from travels around the world.",
    ctaLabel: "Explore",
    ctaClass: "bg-orange-600 hover:bg-orange-700",
    ctaTo: "/blogs",
    coloredSide: "right",
    scrollProgress: 0,
  },
  render: (args) => ({
    components: { DirectionPair },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] h-screen flex items-center justify-center p-8">
        <div class="w-full h-96">
          <DirectionPair v-bind="args" />
        </div>
      </div>
    `,
  }),
};

export const WithScrollProgress: Story = {
  args: {
    colorBg: "bg-blue-100",
    imageSrc: "/home/jen-knows.png",
    imageAlt: "Jen profile",
    title: "Development",
    subtitle: "Journey",
    subtitleClass: "text-blue-600",
    description: "Technical skills and projects built over the years.",
    ctaLabel: "View Work",
    ctaClass: "bg-blue-600 hover:bg-blue-700",
    ctaTo: "/work",
    coloredSide: "left",
    scrollProgress: 0.5,
  },
  render: (args) => ({
    components: { DirectionPair },
    setup: () => ({ args }),
    template: `
      <div class="bg-[var(--color-basalt-canvas)] h-screen flex items-center justify-center p-8">
        <div class="w-full h-96">
          <DirectionPair v-bind="args" />
        </div>
      </div>
    `,
  }),
};
