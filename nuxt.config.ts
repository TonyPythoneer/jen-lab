import type { NuxtConfig } from "nuxt/schema";
import MarkdownIt from "markdown-it";
// @ts-expect-error — no types published for this plugin
import linkAttrs from "markdown-it-link-attributes";
import { readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { WP_BASE } from "./shared/wp";
import { DEV_PORT } from "./shared/dev";

// Derive the set of valid static routes from app/pages/ at config-load time.
// Used by the content:file:afterParse hook to validate nav URLs in header.yml.
function getStaticRoutes(pagesDir: string): Set<string> {
  const routes = new Set<string>();
  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (extname(entry) !== ".vue") continue;
      const rel = relative(pagesDir, full).replace(/\\/g, "/");
      // Skip dynamic segments — they can't appear in a static nav list.
      if (rel.includes("[")) continue;
      const route = "/" + rel.replace(/(\/index)?\.vue$/, "") || "/";
      routes.add(route === "/" ? "/" : route);
    }
  }
  walk(pagesDir);
  return routes;
}

const VALID_ROUTES = getStaticRoutes(join(__dirname, "app/pages"));

// Build-time markdown renderer for product description fields.
// Runs only inside content:file:afterParse on the server during the
// content build, so this lib never ships to the client.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true }).use(linkAttrs, {
  matcher: (href: string) => /^https?:/.test(href),
  attrs: { target: "_blank", rel: "noopener" },
});

const moduleSettings: NuxtConfig = {
  modules: [
    "@nuxtjs/mdc",
    "@nuxt/content",
    "nitro-cloudflare-dev",
    "@nuxt/ui",
    "@nuxt/fonts",
    "@vueuse/nuxt",
  ],
  fonts: {
    // The food-map atlas declares its serif stack only inside the --font-serif
    // CSS variable. @nuxt/fonts ignores CSS variables by default, so the CJK
    // serif (Noto Serif TC) never loaded and Chinese fell back to a system font.
    // Scanning CSS variables makes those fonts actually load, matching the source.
    experimental: { processCSSVariables: true },
    families: [
      // Food map atlas typography — serif-led parchment style (matches source)
      {
        name: "Crimson Pro",
        provider: "google",
        weights: [400, 500, 600, 700],
        styles: ["normal", "italic"],
      },
      { name: "Noto Serif TC", provider: "google", weights: [400, 500, 600, 700] },
      // English display — bold condensed headlines
      { name: "Bebas Neue", provider: "google", weights: [400] },
      // English body — humanist, matching caldera reference
      { name: "DM Sans", provider: "google", weights: [400, 500, 700] },
      // English body — fallback
      { name: "Inter", provider: "google", weights: [400, 500, 700] },
      // Chinese body — neutral modern (recommended default)
      { name: "Noto Sans TC", provider: "google", weights: [400, 500, 700, 900] },
      // Chinese body — rounded friendly
      // { name: "Zen Maru Gothic", provider: "google", weights: [400, 500, 700] },
      // Chinese body — geometric, close to Inter feel
      // { name: "Murecho", provider: "google", weights: [400, 500, 700] },
      // Chinese body — handwritten, personal blog vibe
      // { name: "LXGW WenKai TC", provider: "google", weights: [400, 700] },
      // Chinese body — clean, legible
      // { name: "BIZ UDPGothic", provider: "google", weights: [400, 700] },
      // Chinese body — serif, elegant
      // { name: "Noto Serif TC", provider: "google", weights: [400, 500, 700] },
    ],
  },
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "light",
    fallback: "light",
    storage: "cookie",
  },
  // Markdown content has no fenced code blocks. Disabling Shiki below drops the
  // oniguruma WASM runtime (~600 KB) and preloaded language grammars (~900 KB)
  // from the client bundle. Re-enable if a code block is ever introduced into
  // content/**.md or product description fields.
  mdc: {
    highlight: false,
  },
  content: {
    build: {
      markdown: {
        // See `mdc.highlight: false` above — same rationale.
        highlight: false,
      },
    },
    experimental: {
      sqliteConnector: "native",
    },
    database: { type: "sqlite", filename: ":memory:" },
  },
};

const cloudflareSettings: NuxtConfig = {
  compatibilityDate: "2025-07-15",
  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/jen-liu": { prerender: true },
    "/jen-knows": { prerender: true },
    "/blogs": { prerender: true },
    "/sydney-food-map": { prerender: true },
  },
};

const devSettings: NuxtConfig = {
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  devServer: {
    port: DEV_PORT,
  },
  vite: {
    optimizeDeps: {
      include: [
        "leaflet", // CJS
      ],
    },
    // Build-time constants (string-replaced into bundle, zero runtime overhead)
    define: {
      __WP_BASE__: JSON.stringify(WP_BASE),
    },
  },
};

const experimentalSettings: NuxtConfig = {
  experimental: {
    typedPages: true,
  },
};

const lifecycleHookstSettings: NuxtConfig = {
  hooks: {
    // Render markdown → HTML once at build, store on the content row as
    // `descriptionHtml`. Keeps `description` (source) intact and avoids
    // shipping markdown-it to the client. Scoped to the `home` collection;
    // hook fires per parsed file (e.g. content/home/jen-knows.md).
    "content:file:afterParse"({ collection, content }) {
      if (collection.name === "home") {
        for (const section of (content as any).sections ?? []) {
          if (section.component !== "product-list") continue;
          for (const product of section.products) {
            product.descriptionHtml = md.render(product.description);
          }
        }
      }

      // Validate that every nav URL in content/site/header.yml is a real Nuxt route.
      // Throws at build time so a typo can never ship a broken link.
      if (collection.name === "site") {
        for (const item of (content as any).nav ?? []) {
          if (!VALID_ROUTES.has(item.to)) {
            throw new Error(
              `content/site/header.yml: nav item "${item.label}" has url "${item.to}" which is not a valid route.\n` +
                `Valid static routes: ${[...VALID_ROUTES].sort().join(", ")}`,
            );
          }
        }
      }
    },
  },
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ...moduleSettings,
  ...cloudflareSettings,
  ...devSettings,
  ...lifecycleHookstSettings,
  ...experimentalSettings,
});
