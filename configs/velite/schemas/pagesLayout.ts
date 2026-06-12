import { defineCollection, s } from "velite";
import { prefixPath } from "./shared";

export const pagesLayout = defineCollection({
  name: "pagesLayout",
  pattern: "pages-layout/*.md",
  schema: s
    .object({
      path: s.path(),
      seo: s
        .object({
          title: s.string(),
          description: s.string(),
          ogTitle: s.string(),
          ogDescription: s.string(),
        })
        .optional(),
      sections: s.array(
        s.union([
          s.object({
            component: s.literal("section-hero"),
            headline: s.string().optional(),
            headlineAccent: s.string().optional(),
            subheadingLines: s.array(s.string()).optional(),
            marqueeItems: s.array(s.string()).optional(),
            portraitKnowsSrc: s.string().optional(),
            portraitLiuSrc: s.string().optional(),
          }),
          s.object({
            component: s.literal("section-directions"),
            heading: s.string().optional(),
            headingAccent: s.string().optional(),
            cards: s
              .array(
                s.object({
                  title: s.string(),
                  subtitle: s.string(),
                  description: s.string(),
                  ctaLabel: s.string(),
                  ctaTo: s.string(),
                  imageSrc: s.string(),
                  imageAlt: s.string(),
                  colorKey: s.enum(["violet", "orange"]),
                }),
              )
              .optional(),
          }),
          s.object({
            component: s.literal("section-blog"),
            postCount: s.number().optional(),
            spinDuration: s.number().optional(),
            heading: s.string().optional(),
            ctaLabel: s.string().optional(),
          }),
          s.object({
            component: s.literal("section-newsletter"),
            headline: s.string().optional(),
            accentLines: s.array(s.string()).optional(),
            subheading: s.string().optional(),
            buttonLabel: s.string().optional(),
            subscriptionUrl: s.string().optional(),
          }),
          s.object({ component: s.literal("section-support") }),
        ]),
      ),
    })
    .transform(prefixPath),
});
