import { z } from "zod";

export const siteNavSchema = z.object({
  nav: z.array(z.object({ label: z.string(), to: z.string() })),
});

// Blog page wording (titles, button/state text, SEO). Separate from the nav
// schema because the shape differs — do NOT glob both into one collection.
export const siteBlogsSchema = z.object({
  listPage: z.object({
    title: z.string(),
    subtitle: z.string(),
    loadingErrorMessage: z.string(),
    loadingErrorRetryButton: z.string(),
    noResultsMessage: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  }),
  detailPage: z.object({
    backLink: z.string(),
    loadingMessage: z.string(),
    notFoundMessage: z.string(),
    // "{{title}}" is replaced with the post title at render time.
    seoTitleTemplate: z.string(),
  }),
  search: z.object({
    placeholder: z.string(),
    categoryLabel: z.string(),
    tagLabel: z.string(),
  }),
  postCard: z.object({
    newBadgeText: z.string(),
    newPostDaysThreshold: z.number(),
  }),
});
