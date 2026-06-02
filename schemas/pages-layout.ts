import { z } from "zod";

const sectionHeroSchema = z.object({
  component: z.literal("section-hero"),
});

const sectionDirectionsSchema = z.object({
  component: z.literal("section-directions"),
});

const sectionBlogSchema = z.object({
  component: z.literal("section-blog"),
  postCount: z.number().optional(),
  spinDuration: z.number().optional(),
});

const sectionNewsletterSchema = z.object({
  component: z.literal("section-newsletter"),
});

const sectionSupportSchema = z.object({
  component: z.literal("section-support"),
});

export const pagesLayoutSchema = z.object({
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
