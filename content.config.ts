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
    // Markdown source. Rendered to HTML at component level via the
    // tiny `markdownToHtml` util (see app/utils/markdown.ts) so we can
    // skip shipping the full @nuxtjs/mdc client runtime + its sqlite-wasm
    // dependency chunk.
    description: z.string(),
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
