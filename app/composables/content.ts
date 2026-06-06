// Replacement for @nuxt/content's queryCollection, backed by Velite's
// build-time output (.velite). Reproduces only the chained API the app uses:
//   queryCollection("home").path("/home/jen-knows").first()
//   queryCollection("wpTags").order("count","DESC").order("wpId","DESC").all()
//   queryCollection("site").first()
// Auto-imported (app/composables) so call sites stay byte-identical.
import {
  home,
  pagesLayout,
  site,
  siteBlogs,
  wpTags,
  wpCategories,
} from "../../generated/velite/index.js";

const collections = { home, pagesLayout, site, siteBlogs, wpTags, wpCategories };
export type CollectionName = keyof typeof collections;

class QueryBuilder<T> {
  private rows: T[];
  private sortKeys: Array<[keyof T, "ASC" | "DESC"]> = [];

  constructor(rows: T[]) {
    this.rows = rows;
  }

  // matches @nuxt/content "page" path queries
  path(p: string): this {
    this.rows = this.rows.filter((r) => (r as { path?: string }).path === p);
    return this;
  }

  order(key: keyof T, dir: "ASC" | "DESC" = "ASC"): this {
    this.sortKeys.push([key, dir]);
    return this;
  }

  private applied(): T[] {
    if (this.sortKeys.length === 0) return this.rows;
    return [...this.rows].sort((a, b) => {
      for (const [key, dir] of this.sortKeys) {
        const av = a[key];
        const bv = b[key];
        if (av === bv) continue;
        const cmp = av < bv ? -1 : 1;
        return dir === "DESC" ? -cmp : cmp;
      }
      return 0;
    });
  }

  first(): T | undefined {
    return this.applied()[0];
  }

  all(): T[] {
    return this.applied();
  }
}

export function queryCollection<K extends CollectionName>(name: K) {
  const data = collections[name] as unknown as Array<(typeof collections)[K][number]>;
  return new QueryBuilder(Array.isArray(data) ? [...data] : [data]);
}
