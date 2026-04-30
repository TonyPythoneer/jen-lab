import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const homeSchema = z.object({
  sections: z.array(z.object({
    id: z.string(),
    label: z.string(),
    component: z.enum(['portal-list', 'youtube-carousel', 'product-list', 'image-carousel']),
  })),
  profile: z.object({
    avatarLink: z.string(),
    name: z.string(),
    tabs: z.array(z.object({
      label: z.string(),
      bio: z.string(),
    })),
  }),
  videos: z.array(z.object({
    id: z.string(),
    title: z.string(),
  })),
  products: z.array(z.object({
    bannerImage: z.string(),
    title: z.string(),
    brief: z.string(),
    description: z.string(),
    purchaseUrl: z.string(),
    purchaseLabel: z.string(),
  })),
  items: z.array(z.object({
    to: z.string(),
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  galleries: z.array(z.string()).optional(),
})

export default defineContentConfig({
  collections: {
    home: defineCollection({
      type: 'page',
      source: 'home/*.md',
      schema: homeSchema,
    }),
  },
})
