// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import GlyphSvg from "./GlyphSvg.vue";

const meta = {
  title: "home/GlyphSvg",
  component: GlyphSvg,
} satisfies Meta<typeof GlyphSvg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GumLeaf: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "gum-leaf",
  },
};

export const Terminal: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "terminal",
  },
};

export const Book: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "book",
  },
};

export const Compass: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "compass",
  },
};

export const Coffee: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "coffee",
  },
};

export const Surf: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "surf",
  },
};

export const Ferris: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "ferris",
  },
};

export const Sail: Story = {
  render: (args) => ({
    components: { GlyphSvg },
    setup: () => ({ args }),
    template: `<div class="w-24 h-24"><GlyphSvg v-bind="args" /></div>`,
  }),
  args: {
    kind: "sail",
  },
};
