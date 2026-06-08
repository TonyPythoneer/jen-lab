import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import vue from "@vitejs/plugin-vue";

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
        // isProduction: false prevents rolldown's production-mode compiler from
        // tripping over `lang="ts" generic="T extends ..."` SFCs (Vue 3.3 generics).
        // Rolldown's prod path has a known parsing gap with generic components.
        vue(),
        // Storybook auto-import, standalone (no @nuxt/ui). One AutoImport
        // instance replicates Nuxt's: Vue APIs, VueUse, project composables, and
        // Nuxt composables routed to our mocks. Components resolves project
        // components with Nuxt's directory-prefix naming.
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
          // Replicate Nuxt's component naming: home/Sprite.vue -> <HomeSprite>.
          directoryAsNamespace: true,
          collapseSamePrefixes: true,
        }),
      ],
      resolve: {
        // Our app's Nuxt composables come from the AutoImport mapping above,
        // not from `#imports`, so no `#imports` alias is needed.
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
