import { defineCollection, s } from "velite";
import { iconName } from "./shared";

export const site = defineCollection({
  name: "site",
  pattern: "site/header.yml",
  schema: s.object({
    nav: s.array(s.object({ label: s.string(), to: s.string() })),
  }),
});

export const siteFooter = defineCollection({
  name: "siteFooter",
  pattern: "site/footer.yml",
  schema: s.object({
    socials: s.array(s.object({ label: s.string(), url: s.string(), icon: iconName })),
  }),
});

export const siteBlogs = defineCollection({
  name: "siteBlogs",
  pattern: "site/blogs.yml",
  schema: s.object({
    listPage: s.object({
      title: s.string(),
      subtitle: s.string(),
      loadingErrorMessage: s.string(),
      loadingErrorRetryButton: s.string(),
      noResultsMessage: s.string(),
      seoTitle: s.string(),
      seoDescription: s.string(),
    }),
    detailPage: s.object({
      backLink: s.string(),
      loadingMessage: s.string(),
      notFoundMessage: s.string(),
      seoTitleTemplate: s.string(),
    }),
    search: s.object({
      placeholder: s.string(),
      categoryLabel: s.string(),
      tagLabel: s.string(),
    }),
    postCard: s.object({
      newBadgeText: s.string(),
      newPostDaysThreshold: s.number(),
    }),
  }),
});
