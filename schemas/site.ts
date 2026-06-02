import { z } from "zod";

export const siteNavSchema = z.object({
  nav: z.array(z.object({ label: z.string(), to: z.string() })),
});
