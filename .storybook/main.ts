import type { StorybookConfig } from "@storybook/vue3-vite";
import { googleFontsHref } from "../configs/vite/plugins/injectFonts";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      builder: {
        // Compile with Storybook's own pipeline (.storybook/vite.config.ts),
        // NOT the app's vite.config.ts — see that file for what's mirrored.
        viteConfigPath: ".storybook/vite.config.ts",
      },
    },
  },
  stories: ["../src/components/**/*.stories.@(ts|js)"],
  addons: [],
  // Same Google Fonts the app injects at its <!--google-fonts--> marker.
  previewHead: (head = "") => `${head}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${googleFontsHref}" />`,
};

export default config;
