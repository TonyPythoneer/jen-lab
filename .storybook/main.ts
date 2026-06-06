import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

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
        AutoImport({
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
        }),
        Components({
          dirs: [`${appDir}/components`],
          // Replicate Nuxt's component naming: home/Sprite.vue -> <HomeSprite>.
          directoryAsNamespace: true,
          collapseSamePrefixes: true,
        }),
      ],
      resolve: {
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
