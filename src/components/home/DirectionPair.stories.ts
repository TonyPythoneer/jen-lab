// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DirectionPair from "./DirectionPair.vue";

// The two brand color sets SectionDirections actually feeds this component.
const orange = {
  colorBg: "bg-digital-orange",
  subtitleClass: "text-digital-orange",
  ctaClass: "bg-digital-orange hover:bg-digital-orange/90",
};
const violet = {
  colorBg: "bg-cyber-violet",
  subtitleClass: "text-cyber-violet",
  ctaClass: "bg-cyber-violet hover:bg-cyber-violet/90",
};

const meta = {
  title: "home/DirectionPair",
  component: DirectionPair,
  render: (args) => ({
    components: { DirectionPair },
    setup: () => ({ args }),
    template: `
      <div class="h-screen flex items-center justify-center p-8">
        <div class="w-full h-96">
          <DirectionPair v-bind="args" />
        </div>
      </div>
    `,
  }),
} satisfies Meta<typeof DirectionPair>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...orange,
    imageSrc: "/home/jen-knows.webp",
    imageAlt: "Jen profile",
    title: "Career",
    subtitle: "and Beyond",
    description:
      "Explore the professional journey and insights from years of experience in diverse industries.",
    ctaLabel: "Learn More",
    ctaTo: "/jen-knows",
    coloredSide: "left",
    scrollProgress: 0,
  },
};

export const RightAligned: Story = {
  args: {
    ...violet,
    imageSrc: "/home/jen-liu.webp",
    imageAlt: "Jen profile",
    title: "Travel",
    subtitle: "Stories",
    description: "Discover stories and hidden gems from travels around the world.",
    ctaLabel: "Explore",
    ctaTo: "/jen-liu",
    coloredSide: "right",
    scrollProgress: 0,
  },
};

export const WithScrollProgress: Story = {
  args: {
    ...violet,
    imageSrc: "/home/jen-knows.webp",
    imageAlt: "Jen profile",
    title: "Development",
    subtitle: "Journey",
    description: "Technical skills and projects built over the years.",
    ctaLabel: "View Work",
    ctaTo: "/blogs",
    coloredSide: "left",
    scrollProgress: 0.5,
  },
};
