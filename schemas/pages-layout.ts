import { z } from "zod";

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

export const pagesLayoutSchema = z.object({
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
