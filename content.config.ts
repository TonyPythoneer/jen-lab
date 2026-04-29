import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    homeProducts: defineCollection({
      type: 'page',
      source: 'home/products/*.md',
    }),
  },
})
