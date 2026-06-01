import { defineCollection, defineContentConfig } from "@nuxt/content";
import { z } from "zod";

const portalListSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal("portal-list"),
  portals: z.array(
    z.object({
      to: z.string(),
      icon: z.string(),
      title: z.string(),
      brief: z.string(),
    }),
  ),
});

const youtubeCarouselSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal("youtube-carousel"),
  carousels: z.array(
    z.object({
      id: z.string(),
      label: z.string().optional(),
      videos: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
        }),
      ),
    }),
  ),
});

const imageCarouselSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal("image-carousel"),
  carousels: z.array(
    z.object({
      id: z.string(),
      label: z.string().optional(),
      images: z.array(z.string()),
    }),
  ),
});

const productListSection = z.object({
  id: z.string(),
  label: z.string(),
  component: z.literal("product-list"),
  products: z.array(
    z.object({
      banner: z.string(),
      title: z.string(),
      // `description` = markdown source. `descriptionHtml` is rendered at
      // build time by the markdown-it hook in nuxt.config.ts; the component
      // v-html's it so no parser ships to the client.
      description: z.string(),
      descriptionHtml: z.string().optional(),
      purchaseUrl: z.string(),
    }),
  ),
});

const homeSchema = z.object({
  profile: z.object({
    avatar: z.string(),
    name: z.string(),
    tabs: z.array(
      z.object({
        label: z.string(),
        bio: z.string(),
      }),
    ),
  }),
  sections: z.array(
    z.discriminatedUnion("component", [
      portalListSection,
      youtubeCarouselSection,
      imageCarouselSection,
      productListSection,
    ]),
  ),
});

const sectionHeroSchema = z.object({
  component: z.literal("section-hero"),
  headline: z.string().optional(),
  headlineAccent: z.string().optional(),
  subheadingLines: z.array(z.string()).optional(),
  marqueeItems: z.array(z.string()).optional(),
  portraitKnowsSrc: z.string().optional(),
  portraitLiuSrc: z.string().optional(),
});

const sectionDirectionsSchema = z.object({
  component: z.literal("section-directions"),
  heading: z.string().optional(),
  headingAccent: z.string().optional(),
  cards: z
    .array(
      z.object({
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        ctaLabel: z.string(),
        ctaTo: z.string(),
        imageSrc: z.string(),
        imageAlt: z.string(),
        // colorKey picks the card's brand colour; the component owns the actual
        // Tailwind classes so editors never touch CSS.
        colorKey: z.enum(["violet", "orange"]),
      }),
    )
    .optional(),
});

const sectionBlogSchema = z.object({
  component: z.literal("section-blog"),
  postCount: z.number().optional(),
  spinDuration: z.number().optional(),
  heading: z.string().optional(),
  ctaLabel: z.string().optional(),
});

const sectionNewsletterSchema = z.object({
  component: z.literal("section-newsletter"),
  headline: z.string().optional(),
  accentLines: z.array(z.string()).optional(),
  subheading: z.string().optional(),
  buttonLabel: z.string().optional(),
  subscriptionUrl: z.string().optional(),
});

const sectionSupportSchema = z.object({
  component: z.literal("section-support"),
});

const pagesLayoutSchema = z.object({
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
      ogTitle: z.string(),
      ogDescription: z.string(),
    })
    .optional(),
  sections: z.array(
    z.discriminatedUnion("component", [
      sectionHeroSchema,
      sectionDirectionsSchema,
      sectionBlogSchema,
      sectionNewsletterSchema,
      sectionSupportSchema,
    ]),
  ),
});

const wpTagSchema = z.object({
  wpId: z.number(),
  slug: z.string(),
  name: z.string(),
  count: z.number(),
});

const wpCategoryChildSchema = z.object({
  wpId: z.number(),
  slug: z.string(),
  name: z.string(),
});

const wpCategorySchema = z.object({
  wpId: z.number(),
  slug: z.string(),
  name: z.string(),
  children: z.array(wpCategoryChildSchema).optional(),
});

export default defineContentConfig({
  collections: {
    home: defineCollection({
      type: "page",
      source: "home/*.md",
      schema: homeSchema,
    }),
    pagesLayout: defineCollection({
      type: "page",
      source: "pages-layout/*.md",
      schema: pagesLayoutSchema,
    }),
    wpTags: defineCollection({
      type: "data",
      source: "wp/tags/*.yaml",
      schema: wpTagSchema,
    }),
    wpCategories: defineCollection({
      type: "data",
      source: "wp/categories/*.yaml",
      schema: wpCategorySchema,
    }),
    site: defineCollection({
      type: "data",
      source: "site/header.yml",
      schema: z.object({
        nav: z.array(z.object({ label: z.string(), to: z.string() })),
      }),
    }),
  },
});
