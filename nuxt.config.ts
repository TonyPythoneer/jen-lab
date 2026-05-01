import type { NuxtConfig } from 'nuxt/schema'
import { analyzer } from 'vite-bundle-analyzer'

const setupSettings: NuxtConfig = {
  modules: [
    '@nuxtjs/mdc',
    '@nuxt/content',
    'nitro-cloudflare-dev',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    storage: 'cookie',
  },
  // Markdown content has no fenced code blocks. Disabling Shiki below drops the
  // oniguruma WASM runtime (~600 KB) and preloaded language grammars (~900 KB)
  // from the client bundle. Re-enable if a code block is ever introduced into
  // content/**.md or product description fields.
  mdc: {
    highlight: false,
  },
}

const cloudflareSettings: NuxtConfig = {
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'cloudflare-pages',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
}

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
        'leaflet', // CJS
      ]
    },
    plugins: [
      analyzer({ analyzerMode: 'json', fileName: 'stats' }) as any,
    ],
  },
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ...setupSettings,
  ...cloudflareSettings,
  ...devSettings,
  content: {
    build: {
      markdown: {
        // See `mdc.highlight: false` above — same rationale.
        highlight: false,
      },
    },
    database: process.env.NUXT_CONTENT_DB === 'd1'
      ? { type: 'd1', bindingName: 'DB' }
      : { type: 'sqlite', filename: ':memory:' },
  },
})
