import { z } from "zod";

export const wpTagSchema = z.object({
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

export const wpCategorySchema = z.object({
  wpId: z.number(),
  slug: z.string(),
  name: z.string(),
  children: z.array(wpCategoryChildSchema).optional(),
});
