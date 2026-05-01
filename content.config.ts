import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const portalListSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal('portal-list'),
  portals: z.array(z.object({
    to: z.string(),
    icon: z.string(),
    title: z.string(),
    brief: z.string(),
  })),
})

const youtubeCarouselSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal('youtube-carousel'),
  carousels: z.array(z.object({
    id: z.string(),
    label: z.string().optional(),
    videos: z.array(z.object({
      id: z.string(),
      title: z.string(),
    })),
  })),
})

const imageCarouselSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal('image-carousel'),
  carousels: z.array(z.object({
    id: z.string(),
    label: z.string().optional(),
    images: z.array(z.string()),
  })),
})

const productListSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal('product-list'),
  products: z.array(z.object({
    banner: z.string(),
    title: z.string(),
    brief: z.string(),
    // `description` = markdown source. `descriptionHtml` is rendered at
    // build time by the markdown-it hook in nuxt.config.ts; the component
    // v-html's it so no parser ships to the client.
    description: z.string(),
    descriptionHtml: z.string().optional(),
    purchaseUrl: z.string(),
    purchaseLabel: z.string(),
  })),
})

const homeSchema = z.object({
  profile: z.object({
    avatar: z.string(),
    name: z.string(),
    tabs: z.array(z.object({
      label: z.string(),
      bio: z.string(),
    })),
  }),
  sections: z.array(z.discriminatedUnion('component', [
    portalListSection,
    youtubeCarouselSection,
    imageCarouselSection,
    productListSection,
  ])),
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
