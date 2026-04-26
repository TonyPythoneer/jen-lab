import { analyzer } from 'vite-bundle-analyzer'
import type { NuxtConfig } from 'nuxt/schema'

const setupSettings: NuxtConfig = {
  modules: [
    'nitro-cloudflare-dev',
    '@nuxt/ui',
  ],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
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
})
