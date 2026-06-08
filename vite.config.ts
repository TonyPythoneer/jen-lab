import { defineConfig, type PluginOption } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import VueRouter from "vue-router/vite";
import Layouts from "vite-plugin-vue-layouts-next";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Inspect from "vite-plugin-inspect";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { googleFontsHref } from "./src/config/site";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

// Velite content is PREBUILT (pnpm script: `velite build && vite-ssg build`) so
// generated/velite/ exists before the bundler resolves the content shim. An
// in-build plugin with clean:true raced the bundler and wiped the output.

// D5: home/ flattens to <Home<Filename>> across art/motion/parts/sections and is
// used cross-domain. Precomputed Map → valid absolute import (NOT a glob).
const homeComponents: Record<string, string> = {
  HomeBuyButton: "parts/BuyButton",
  HomeDirectionPair: "parts/DirectionPair",
  HomeImageGallery: "parts/ImageGallery",
  HomeProduct: "parts/Product",
  HomeYoutubeGallery: "parts/YoutubeGallery",
  HomeOperaHouseSvg: "art/OperaHouseSvg",
  HomeBackgroundDots: "motion/BackgroundDots",
  HomeBubbleTeaCss: "motion/BubbleTeaCss",
  HomeEnvelopeAnimation: "motion/EnvelopeAnimation",
  HomePortal: "motion/Portal",
  HomeSectionBlog3D: "sections/SectionBlog3D",
  HomeSectionDirections: "sections/SectionDirections",
  HomeSectionHero: "sections/SectionHero",
  HomeSectionNewsletter: "sections/SectionNewsletter",
  HomeSectionSupport: "sections/SectionSupport",
};

// Plugins are typed against the `vite` package; defineConfig/PluginOption come
// from `vite-plus`. The two Plugin types are structurally the same but nominally
// distinct, so a direct annotation makes tsc recurse the PluginOption union too
// deep (TS2321). One assertion on the whole array bridges them.
// Build the Google Fonts <link> from src/config/site.ts and inject it at the
// <!--google-fonts--> marker in index.html. Keeps the font list in one config.
function injectFonts(): PluginOption {
  return {
    name: "inject-google-fonts",
    transformIndexHtml(html: string) {
      return html.replace(
        "<!--google-fonts-->",
        `<link rel="stylesheet" href="${googleFontsHref}" />`,
      );
    },
  };
}

const plugins = [
  injectFonts(),
  tailwindcss(),
  VueRouter({ routesFolder: "src/pages", dts: "typed-router.d.ts" }),
  vue(),
  Layouts({ layoutsDirs: "src/layouts", defaultLayout: "default" }),
  AutoImport({
    imports: [
      "vue",
      "vue-router",
      "@vueuse/core",
      { "@unhead/vue": ["useHead", "useSeoMeta", "useHeadSafe"] },
    ],
    dirs: ["src/composables/**"],
    dts: "auto-imports.d.ts",
  }),
  Components({
    dirs: ["src/components"],
    directoryAsNamespace: true,
    // ui/<category>/<Name>.vue → bare <Name>. unplugin-vue-components strips EVERY
    // folder segment listed here, so ui/overlay/Modal.vue resolves to <Modal>.
    //
    // Categories MUST mirror Nuxt UI's component taxonomy — file every ui/
    // component under the Nuxt UI category it belongs to (element, navigation,
    // overlay, page, utility). Do NOT invent per-component folders or new
    // categories; pick the matching Nuxt UI bucket and put it there.
    globalNamespaces: ["ui", "element", "navigation", "overlay", "page", "utility"],
    collapseSamePrefixes: true,
    dts: "components.d.ts",
    resolvers: [
      {
        type: "component",
        resolve: (name: string) =>
          name in homeComponents
            ? { from: path.resolve(ROOT, `src/components/home/${homeComponents[name]}.vue`) }
            : undefined,
      },
    ],
  }),
  Inspect(),
] as PluginOption[];

// `ssgOptions` is read by vite-ssg at build time, but vite-plus's defineConfig
// type doesn't model it (it lives on @voidzero-dev/vite-plus-core's UserConfig,
// which can't be augmented from here). Assert the arg type to allow the field;
// every other key is still structurally checked.
export default defineConfig({
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["dist/**", "generated/**", "storybook-static/**", ".agents/**", "tasks/**"],
  },
  fmt: {
    // Only format the web app source — skip planning docs and committed-but-not-ours dirs.
    ignorePatterns: [".agents/**", "AGENTS.md", "tasks/**", ".vscode/**", "docs/**"],
  },
  // Vue build-time feature flags. The app is 100% Composition API (<script setup>),
  // so drop Options API support; also strip prod devtools + hydration-mismatch
  // helpers. Tree-shakes a few KB out of the Vue runtime on every page.
  define: {
    __VUE_OPTIONS_API__: "false",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
  plugins,
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true, // listen on 0.0.0.0 so the dev site is reachable on the LAN / phone
    port: Number(process.env.DEV_PORT) || 3500,
  },
  ssgOptions: {
    includedRoutes: () => ["/", "/jen-knows", "/jen-liu", "/blogs", "/sydney-food-map"],
  },
  staged: { "*.{ts,vue}": "vp check --fix" },
} as Parameters<typeof defineConfig>[0]);
