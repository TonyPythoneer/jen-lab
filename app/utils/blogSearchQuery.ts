// Builds the /blogs route the blog list page already reads (q / cat / tag).
export function buildBlogSearchRoute(input: {
  q: string;
  categoryIds: number[];
  tagIds: number[];
}) {
  const query: Record<string, string> = {};
  const q = input.q.trim();
  if (q) query.q = q;
  if (input.categoryIds.length) query.cat = input.categoryIds.join(",");
  if (input.tagIds.length) query.tag = input.tagIds.join(",");
  return { path: "/blogs", query };
}
