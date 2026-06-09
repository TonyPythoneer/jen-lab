import { siteBlogs } from "#velite";

// Blog "chrome" = the page wording from content/site/blogs.yml, shared by the
// layout's search modal and the blog list/detail pages. Velite content is read
// synchronously, so this is a plain computed — `{ data }` shape kept for the
// three call sites that destructure it.
export function useSiteBlogsChrome() {
  return { data: computed(() => siteBlogs[0]) };
}
