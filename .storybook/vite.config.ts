import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { codegenIcons } from "../configs/vite/plugins/codegenIcons";
import { autoImportPresets, uiGlobalNamespaces } from "../configs/vite/sharedPipeline";

const appDir = fileURLToPath(new URL("../src", import.meta.url));

// Storybook's own Vite pipeline. main.ts points viteConfigPath here, so the app's
// vite.config.ts (vize flag, router pages scan, inspect, …) stays out of Storybook.
// Mirror ONLY what stories need to compile and render.
export default {
  plugins: [
    vue(),
    tailwindcss(),
    // Keeps generated/icons/*.json in sync for preview.ts's addCollection.
    codegenIcons(),
    AutoImport({
      dts: false,
      imports: autoImportPresets,
      dirs: [`${appDir}/composables/**`],
    }),
    Components({
      dts: false,
      dirs: [`${appDir}/components`],
      directoryAsNamespace: true,
      globalNamespaces: uiGlobalNamespaces,
      collapseSamePrefixes: true,
    }),
  ],
  resolve: {
    // #velite / #food-map-data resolve via package.json#imports — no aliases needed.
    alias: [{ find: /^~\//, replacement: `${appDir}/` }],
  },
};
