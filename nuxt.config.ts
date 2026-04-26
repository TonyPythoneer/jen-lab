import { analyzer } from 'vite-bundle-analyzer'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: "cloudflare-pages",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  },

  vite: {
    plugins: [
      analyzer({ analyzerMode: 'json', fileName: 'stats' }) as any
    ]
  },

  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/ui",
  ]
})