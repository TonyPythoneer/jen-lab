import { defineCollection, defineContentConfig } from "@nuxt/content";
import { homeSchema } from "./schemas/home";
import { pagesLayoutSchema } from "./schemas/pages-layout";
import { wpTagSchema, wpCategorySchema } from "./schemas/wp";
import { siteNavSchema, siteBlogsSchema } from "./schemas/site";

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
      schema: siteNavSchema,
    }),
    // Blog page wording (titles, button/state text, SEO). Separate from `site`
    // because the shape differs — do NOT glob both into one schema. Query with
    // `.first()`, never `.path()` (the data-collection path bug).
    siteBlogs: defineCollection({
      type: "data",
      source: "site/blogs.yml",
      schema: siteBlogsSchema,
    }),
  },
});
