import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";
import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { uiConfig } from "../app/config/site";

// @nuxt/ui generates color palettes (50-950 shades) only for known Tailwind
// color names. Our brand names ("digital-orange", "cyber-violet", "abyssal-ink")
// are CSS custom properties, not Tailwind palette entries, so no palette gets
// generated and UButton color="primary" renders transparent.
// Map to nearest Tailwind equivalents for Storybook only — the exact brand
// tokens still apply via theme.css to any element that uses var(--color-*).
const storybookUiColors = {
  primary: "orange", // #fc5000 digital-orange → Tailwind orange
  secondary: "violet", // #524ae9 cyber-violet → Tailwind violet
  neutral: "zinc", // #070607 abyssal-ink → Tailwind zinc
};

const appDir = fileURLToPath(new URL("../app", import.meta.url));
const mocksDir = fileURLToPath(new URL("./mocks", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/vue3-vite",
  stories: ["../app/components/**/*.stories.@(ts|js)", "../.storybook/**/*.stories.@(ts|js)"],
  addons: [],
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite" as string);
    return mergeConfig(viteConfig, {
      plugins: [
        // vite-plus (the workspace vite alias) doesn't register @vitejs/plugin-vue
        // automatically the way standard Storybook+Vite does. Without it .vue files
        // hit import-analysis raw and fail. Explicit registration fixes that.
        vue(),
        // @nuxt/ui already bundles unplugin-auto-import AND unplugin-vue-components,
        // and throws if it sees a second instance. So we extend ITS instances via
        // the `autoImport` / `components` options (merged with @nuxt/ui's own config
        // via defu) instead of adding our own plugins. This single auto-import
        // instance replicates Nuxt's: Vue APIs, VueUse, project composables, and
        // Nuxt composables routed to our mocks. The single components instance
        // resolves both <U*> (via @nuxt/ui's resolver) and our project components.
        ui({
          ui: { ...uiConfig, colors: storybookUiColors },
          dts: false,
          autoImport: {
            imports: [
              "vue",
              "@vueuse/core",
              {
                [`${mocksDir}/nuxt`]: [
                  "useRoute",
                  "useRouter",
                  "useAppConfig",
                  "useRuntimeConfig",
                  "useState",
                  "useLazyAsyncData",
                  "useAsyncData",
                  "navigateTo",
                  "useHead",
                  "useSeoMeta",
                ],
                [`${mocksDir}/content`]: ["queryCollection"],
              },
            ],
            dirs: [`${appDir}/composables`],
          },
          components: {
            dirs: [`${appDir}/components`],
            // Replicate Nuxt's component naming: home/Sprite.vue -> <HomeSprite>.
            directoryAsNamespace: true,
            collapseSamePrefixes: true,
          },
        }),
      ],
      resolve: {
        // NOTE: do NOT alias `#imports` — @nuxt/ui's plugin owns it (and wires
        // `#build/app.config`). Our app's Nuxt composables come from the
        // AutoImport mapping above, not from `#imports`.
        alias: [
          { find: /^~\//, replacement: `${appDir}/` },
          { find: /^@\//, replacement: `${appDir}/` },
          { find: /^@nuxt\/content$/, replacement: `${mocksDir}/content` },
        ],
      },
    });
  },
};

export default config;
