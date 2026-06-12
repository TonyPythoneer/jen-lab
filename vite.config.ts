import { defineConfig, type PluginOption } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import vize from "@vizejs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import VueRouter from "vue-router/vite";
import Layouts from "vite-plugin-vue-layouts-next";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Inspect from "vite-plugin-inspect";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { googleFontsHref } from "./src/config/site";
import { codegenIcons } from "./vite/codegenIcons";

// Experimental feature flag: VIZE=true swaps the stable @vitejs/plugin-vue SFC
// compiler for vize (Rust). Off by default — production builds stay on plugin-vue.
//   VIZE=true pnpm build   /   VIZE=true pnpm dev
const USE_VIZE = !!process.env.VIZE;

// vize emits CJS-interop for SFC script imports, so `vue-router` resolves to its
// CJS build while vite-ssg pulls the ESM build — two module instances with
// different injection-key Symbols, which breaks provide/inject in SSR. Pin both
// sides to the single ESM file (applied only under VIZE). Exact-match only, so
// `vue-router/auto-routes` (the unplugin-vue-router virtual module) is untouched.
const require = createRequire(import.meta.url);
const vueRouterEsm = require.resolve("vue-router").replace(/index\.cjs$/, "vue-router.node.mjs");

// Velite content is PREBUILT (pnpm script: `velite build && vite-ssg build`) so
// generated/velite/ exists before the bundler resolves the content shim. An
// in-build plugin with clean:true raced the bundler and wiped the output.

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
  // Keeps generated/icons/*.json in sync on dev + build (was `pnpm gen:icons`).
  codegenIcons(),
  tailwindcss(),
  VueRouter({ routesFolder: "src/pages", dts: "typed-router.d.ts" }),
  // Vue SFC compiler. VIZE=true → vize (Rust, experimental); else stable plugin-vue.
  // quirks keeps Vue-compatible template parsing (no <div/> → <div></div> rewrite).
  USE_VIZE ? vize({ templateSyntax: "quirks" }) : vue(),
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
  build: {
    // Every browser in the modern build target supports <link rel="modulepreload">
    // natively, so vite's injected polyfill is dead weight in the entry chunk.
    modulePreload: { polyfill: false },
  },
  resolve: {
    // vize-only: it compiles SFC script imports as CJS interop, duplicating vue-router
    // (ESM copy used by vite-ssg + CJS copy used by SFCs) — the duplicate has different
    // injection-key Symbols, breaking provide/inject in SSR. Pin to one ESM copy. These
    // are unwanted for the stable plugin-vue path, so apply them only under VIZE.
    ...(USE_VIZE ? { dedupe: ["vue", "vue-router", "@vue/runtime-core", "@vue/runtime-dom"] } : {}),
    alias: [
      // Exact match: force the single ESM vue-router (vize only — see note above).
      ...(USE_VIZE ? [{ find: /^vue-router$/, replacement: vueRouterEsm }] : []),
      { find: "~", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      // Velite's prebuilt content collections (generated/velite). Aliased so the
      // content shim and type imports skip the ../../ climb out of src/.
      {
        find: "#velite",
        replacement: fileURLToPath(new URL("./generated/velite/index.js", import.meta.url)),
      },
      // The restaurants dataset as built by Velite. Pointed straight at the json
      // (not via #velite) so useRestaurants can dynamic-import ONLY this chunk,
      // keeping the 44KB out of the route chunk. Not exposed through content.ts.
      {
        find: "#food-map-data",
        replacement: fileURLToPath(new URL("./generated/velite/foodMap.json", import.meta.url)),
      },
    ],
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
