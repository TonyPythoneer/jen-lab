import { defineConfig } from "velite";
import { home } from "./configs/velite/schemas/home";
import { pagesLayout } from "./configs/velite/schemas/pagesLayout";
import { site, siteFooter, siteBlogs } from "./configs/velite/schemas/site";
import { wpTags, wpCategories } from "./configs/velite/schemas/wp";
import { foodMap } from "./configs/velite/schemas/foodMap";

export default defineConfig({
  root: "content",
  output: { data: "generated/velite", assets: "public/static", base: "/static/", clean: true },
  collections: { home, pagesLayout, site, siteFooter, siteBlogs, wpTags, wpCategories, foodMap },
});
