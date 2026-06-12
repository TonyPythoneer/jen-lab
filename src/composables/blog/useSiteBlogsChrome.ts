import { siteBlogs } from "#velite";

// Blog "chrome" = page wording from content/site/blogs.yml, shared by the search
// modal and blog pages. `{ data }` shape kept for the destructuring call sites.
export function useSiteBlogsChrome() {
  return { data: computed(() => siteBlogs[0]) };
}
