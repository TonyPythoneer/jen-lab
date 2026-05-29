import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";
import ui from "@nuxt/ui/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { uiConfig } from "../app/config/site";

const appDir = fileURLToPath(new URL("../app", import.meta.url));
const mocksDir = fileURLToPath(new URL("./mocks", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/vue3-vite",
  stories: ["../app/components/**/*.stories.@(ts|js)"],
  addons: [],
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite" as string);
    return mergeConfig(viteConfig, {
      plugins: [
        ui({ ui: uiConfig }),
        AutoImport({
          dts: false,
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
          dts: false,
          dirs: [`${appDir}/components`],
          directoryAsNamespace: true,
          collapseSamePrefixes: true,
        }),
      ],
      resolve: {
        alias: [
          { find: /^~\//, replacement: `${appDir}/` },
          { find: /^@\//, replacement: `${appDir}/` },
          { find: /^#imports$/, replacement: `${mocksDir}/nuxt` },
          { find: /^@nuxt\/content$/, replacement: `${mocksDir}/content` },
        ],
      },
    });
  },
};

export default config;
