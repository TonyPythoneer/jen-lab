import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import { type App } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { createHead } from "@unhead/vue/client";
import { addCollection } from "@iconify/vue/offline";
// @ts-expect-error — tsconfig doesn't cover .storybook/ context, but runtime works fine
import StoryWrapper from "../src/storybook/StoryWrapper.vue";
// @ts-expect-error - CSS import resolution in Storybook context
import "../src/assets/css/main.css";
// Generated icon subsets (configs/vite/plugins/codegenIcons.ts) — same set src/main.ts bundles.
// @ts-ignore — generated JSON, no bundled types
import lucideData from "../generated/icons/lucide.json";
// @ts-ignore — generated JSON, no bundled types
import simpleIconsData from "../generated/icons/simple-icons.json";
// @ts-ignore — generated JSON, no bundled types
import streamlineFreehandData from "../generated/icons/streamline-freehand.json";

// Offline icon runtime, registered exactly like src/main.ts — <Icon> renders for real.
addCollection(lucideData);
addCollection(simpleIconsData);
addCollection(streamlineFreehandData);

// Real app runtime, not mocks: stories exercise the same router/unhead APIs the site
// uses (RouterLink, useRoute/useRouter, useHead/useSeoMeta). Catch-all route renders
// nothing — stories never navigate for real.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/:pathMatch(.*)*", component: { render: () => null } }],
});

setup((app: App) => {
  app.use(router);
  app.use(createHead());
});

const preview: Preview = {
  decorators: [
    (story: any) => ({
      components: { StoryWrapper, story },
      template: "<StoryWrapper><story /></StoryWrapper>",
    }),
  ],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      // Brand surfaces from theme.css (loaded via main.css above).
      options: {
        canvas: { name: "Canvas", value: "var(--color-basalt-canvas)" },
        ash: { name: "Ash", value: "var(--color-ash-white)" },
        white: { name: "White", value: "var(--color-pure-white)" },
        ink: { name: "Ink", value: "var(--color-abyssal-ink)" },
      },
    },
    viewport: {
      options: {
        mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },
  },
  initialGlobals: {
    viewport: { value: "desktop", isRotated: false },
    backgrounds: { value: "canvas" },
  },
};

export default preview;
