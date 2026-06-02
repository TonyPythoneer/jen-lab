import { defineCollection, defineContentConfig } from "@nuxt/content";
import { homeSchema } from "./schemas/home";
import { pagesLayoutSchema } from "./schemas/pages-layout";
import { wpTagSchema, wpCategorySchema } from "./schemas/wp";
import { siteNavSchema } from "./schemas/site";

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
  },
});
