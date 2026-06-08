// Blog "chrome" = the page wording from content/site/blogs.yml, shared by the
// layout's search modal and the blog list/detail pages. The shared "site:blogs"
// key dedups, so the query runs once across all of them.
export function useSiteBlogsChrome() {
  return useAsyncData("site:blogs", () => queryCollection("siteBlogs").first());
}
