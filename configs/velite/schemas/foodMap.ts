import { defineCollection, s } from "velite";

export const foodMap = defineCollection({
  name: "foodMap",
  pattern: "food-map/restaurants.yml",
  single: true,
  schema: s
    .object({
      categories: s.array(s.object({ id: s.string(), name: s.string(), color: s.string() })),
      restaurants: s.array(
        s.object({
          id: s.string(),
          name: s.string(),
          categoryId: s.string(),
          area: s.string(),
          coordinates: s.object({ lat: s.number(), lng: s.number() }),
          summary: s.string(),
          description: s.string(),
          priceRange: s.string(),
          recommendations: s.array(s.string()),
          googleMapsLink: s.string(),
          photoUrl: s.string(),
        }),
      ),
    })
    // Build-time cross-check: every restaurant.categoryId must exist in categories.
    // The old `as const` could not enforce this across the two arrays.
    .superRefine((data, ctx) => {
      const ids = new Set(data.categories.map((c) => c.id));
      for (const r of data.restaurants)
        if (!ids.has(r.categoryId))
          ctx.addIssue({
            code: "custom",
            message: `restaurant "${r.id}" has categoryId "${r.categoryId}" not in categories`,
          });
    }),
});
