import { describe, it, expect } from "vite-plus/test";
import { buildBlogSearchRoute } from "~/utils/blog/blogSearchQuery";

describe("buildBlogSearchRoute", () => {
  it("builds a bare /blogs route when empty", () => {
    expect(buildBlogSearchRoute({ q: "", categoryIds: [], tagIds: [] })).toEqual({
      path: "/blogs",
      query: {},
    });
  });
  it("includes q, cat, tag when present", () => {
    expect(buildBlogSearchRoute({ q: "雪梨", categoryIds: [3, 5], tagIds: [9] })).toEqual({
      path: "/blogs",
      query: { q: "雪梨", cat: "3,5", tag: "9" },
    });
  });
  it("trims whitespace-only q to empty", () => {
    expect(buildBlogSearchRoute({ q: "   ", categoryIds: [], tagIds: [] })).toEqual({
      path: "/blogs",
      query: {},
    });
  });
});
