import { defineCollection, s } from "velite";

export const wpTags = defineCollection({
  name: "wpTags",
  pattern: "wp/tags/*.yaml",
  schema: s.object({
    wpId: s.number(),
    slug: s.string(),
    name: s.string(),
    count: s.number(),
  }),
});

export const wpCategories = defineCollection({
  name: "wpCategories",
  pattern: "wp/categories/*.yaml",
  schema: s.object({
    wpId: s.number(),
    slug: s.string(),
    name: s.string(),
    children: s
      .array(s.object({ wpId: s.number(), slug: s.string(), name: s.string() }))
      .optional(),
  }),
});
