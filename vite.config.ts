import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import VueRouter from "unplugin-vue-router/vite";
import Layouts from "vite-plugin-vue-layouts-next";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

// Velite content is PREBUILT (pnpm script: `velite build && vite-ssg build`) so
// generated/velite/ exists before the bundler resolves the content shim. An
// in-build plugin with clean:true raced the bundler and wiped the output.

// D5: home/ flattens to <Home<Filename>> across art/motion/parts/sections and is
// used cross-domain. Precomputed Map → valid absolute import (NOT a glob).
const homeComponents: Record<string, string> = {
  HomeBuyButton: "parts/BuyButton",
  HomeDirectionPair: "parts/DirectionPair",
  HomeImageCarousel: "parts/ImageCarousel",
  HomeProduct: "parts/Product",
  HomeYoutubeCarousel: "parts/YoutubeCarousel",
  HomeGlyphSvg: "art/GlyphSvg",
  HomeHarbourBridgeSvg: "art/HarbourBridgeSvg",
  HomeOperaHouseSvg: "art/OperaHouseSvg",
  HomeWaveSvg: "art/WaveSvg",
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

export default defineConfig({
  plugins: [
    tailwindcss(),
    VueRouter({ routesFolder: "app/pages", dts: "typed-router.d.ts" }),
    vue(),
    Layouts({ layoutsDirs: "app/layouts", defaultLayout: "default" }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/core",
        { "@unhead/vue": ["useHead", "useSeoMeta", "useHeadSafe"] },
      ],
      dirs: ["app/composables/**"],
      dts: "auto-imports.d.ts",
    }),
    Components({
      dirs: ["app/components"],
      directoryAsNamespace: true,
      collapseSamePrefixes: true,
      dts: "components.d.ts",
      resolvers: [
        {
          type: "component",
          resolve: (name: string) =>
            name in homeComponents
              ? { from: path.resolve(ROOT, `app/components/home/${homeComponents[name]}.vue`) }
              : undefined,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
      "@": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  ssgOptions: {
    includedRoutes: () => ["/", "/jen-knows", "/jen-liu", "/blogs", "/sydney-food-map"],
  },
  staged: { "*.{ts,vue}": "vp check --fix" },
});
