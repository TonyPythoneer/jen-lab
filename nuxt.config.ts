import type { NuxtConfig } from "nuxt/schema";
import MarkdownIt from "markdown-it";
// @ts-expect-error — no types published for this plugin
import linkAttrs from "markdown-it-link-attributes";
import { analyzer } from "vite-bundle-analyzer";

const isD1 = process.env.NUXT_CONTENT_DB === "d1";

// Build-time markdown renderer for product description fields.
// Runs only inside content:file:afterParse on the server during the
// content build, so this lib never ships to the client.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true }).use(linkAttrs, {
  matcher: (href: string) => /^https?:/.test(href),
  attrs: { target: "_blank", rel: "noopener" },
});

const moduleSettings: NuxtConfig = {
  modules: ["@nuxtjs/mdc", "@nuxt/content", "nitro-cloudflare-dev", "@nuxt/ui", "@vueuse/nuxt"],
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
    database: isD1 ? { type: "d1", bindingName: "DB" } : { type: "sqlite", filename: ":memory:" },
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
};

const devSettings: NuxtConfig = {
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  devServer: {
    port: 3500,
  },
  vite: {
    optimizeDeps: {
      include: [
        "leaflet", // CJS
      ],
    },
    plugins: [analyzer({ analyzerMode: "json", fileName: "stats" }) as any],
    // Build-time constants (string-replaced into bundle, zero runtime overhead)
    define: {
      __WP_BASE__: JSON.stringify("https://jenliu.com.au/wp-json/wp/v2"),
    },
  },
};

const lifecycleHookstSettings: NuxtConfig = {
  hooks: {
    // Render markdown → HTML once at build, store on the content row as
    // `descriptionHtml`. Keeps `description` (source) intact and avoids
    // shipping markdown-it to the client. Scoped to the `home` collection;
    // hook fires per parsed file (e.g. content/home/jen-knows.md).
    "content:file:afterParse"({ collection, content }) {
      if (collection.name !== "home") return;
      for (const section of (content as any).sections ?? []) {
        if (section.component !== "product-list") continue;
        for (const product of section.products) {
          product.descriptionHtml = md.render(product.description);
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
});
