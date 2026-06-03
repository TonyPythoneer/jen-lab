// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Toc from "./Toc.vue";
import type { ContentTocLink } from "@nuxt/ui";

const meta = {
  title: "home/Toc",
  component: Toc,
} satisfies Meta<typeof Toc>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLinks: ContentTocLink[] = [
  { id: "intro", text: "Introduction", depth: 2 },
  { id: "getting-started", text: "Getting Started", depth: 2 },
  { id: "setup", text: "Setup", depth: 3 },
  { id: "config", text: "Configuration", depth: 3 },
  { id: "usage", text: "Usage", depth: 2 },
  { id: "examples", text: "Examples", depth: 3 },
  { id: "advanced", text: "Advanced Topics", depth: 2 },
  { id: "faq", text: "FAQ", depth: 2 },
];

export const Default: Story = {
  args: {
    links: mockLinks,
    title: "Contents",
  },
  render: (args) => ({
    components: { Toc },
    setup: () => ({ args }),
    template: `
      <div class="flex gap-8 p-6">
        <div class="flex-1">
          <Toc v-bind="args" />
        </div>
        <div class="flex-1 space-y-8 max-w-2xl">
          <section v-for="link in args.links" :key="link.id" :id="link.id" class="scroll-mt-20">
            <h2 :style="{ fontSize: link.depth === 2 ? '1.5rem' : '1.25rem' }" class="font-bold mb-2">
              {{ link.text }}
            </h2>
            <p class="text-gray-600">Lorem ipsum dolor sit amet...</p>
          </section>
        </div>
      </div>
    `,
  }),
};

export const CompactList: Story = {
  args: {
    links: [
      { id: "h1", text: "Chapter 1", depth: 2 },
      { id: "h2", text: "Chapter 2", depth: 2 },
      { id: "h3", text: "Chapter 3", depth: 2 },
    ],
    title: "Chapters",
  },
  render: (args) => ({
    components: { Toc },
    setup: () => ({ args }),
    template: `
      <div class="p-6">
        <Toc v-bind="args" />
      </div>
    `,
  }),
};
