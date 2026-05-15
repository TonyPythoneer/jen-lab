import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify } from "yaml";
import { WP_BASE } from "../shared/wp.ts";

interface WpTaxonomyRaw {
  id: number;
  slug: string;
  name: string;
  count: number;
  parent?: number;
}

interface TaxonomyConfig<T> {
  label: string;
  endpoint: string;
  fields: string;
  dir: URL;
  transform: (raws: WpTaxonomyRaw[]) => T[];
}

interface SyncResult<T> {
  ok: boolean;
  items?: T[];
}

const CONTENT_ROOT = new URL("../content/wp/", import.meta.url);

interface CategoryChild {
  wpId: number;
  slug: string;
  name: string;
}

interface CategoryNode extends CategoryChild {
  children?: CategoryChild[];
}

const TAG_CONFIG: TaxonomyConfig<{ wpId: number; slug: string; name: string; count: number }> = {
  label: "tags",
  endpoint: "tags",
  fields: "id,slug,name,count",
  dir: new URL("tags/", CONTENT_ROOT),
  transform: (raws) =>
    raws
      .filter((t) => t.count > 0)
      .map(({ id, slug, name, count }) => ({ wpId: id, slug, name, count })),
};

const CATEGORY_CONFIG: TaxonomyConfig<CategoryNode> = {
  label: "categories",
  endpoint: "categories",
  fields: "id,slug,name,parent,count",
  dir: new URL("categories/", CONTENT_ROOT),
  transform: (raws) => {
    const childrenByParent = new Map<number, CategoryChild[]>();
    const roots: WpTaxonomyRaw[] = [];
    for (const raw of raws) {
      const child: CategoryChild = { wpId: raw.id, slug: raw.slug, name: raw.name };
      const parent = raw.parent ?? 0;
      if (parent) {
        const arr = childrenByParent.get(parent) ?? [];
        arr.push(child);
        childrenByParent.set(parent, arr);
      } else {
        roots.push(raw);
      }
    }
    return roots.map((root) => {
      const children = childrenByParent.get(root.id);
      return {
        wpId: root.id,
        slug: root.slug,
        name: root.name,
        ...(children?.length ? { children } : {}),
      };
    });
  },
};

async function fetchAllPages(endpoint: string, fields: string): Promise<WpTaxonomyRaw[]> {
  const all: WpTaxonomyRaw[] = [];
  let page = 1;
  while (true) {
    const url = `${WP_BASE}/${endpoint}?per_page=100&page=${page}&_fields=${fields}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`${endpoint} page ${page}: HTTP ${res.status} ${res.statusText}`);
    }
    const batch = (await res.json()) as WpTaxonomyRaw[];
    all.push(...batch);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1");
    if (page >= totalPages) break;
    page++;
  }
  return all;
}

async function syncTaxonomy<T>(config: TaxonomyConfig<T>): Promise<SyncResult<T>> {
  try {
    const raw = await fetchAllPages(config.endpoint, config.fields);
    const items = config.transform(raw);
    return { ok: true, items };
  } catch (err) {
    console.warn(`[sync-wp] ${config.label} fetch failed: ${(err as Error).message}`);
    console.warn(`[sync-wp] ${config.label}: existing files preserved`);
    return { ok: false };
  }
}

function fileNameFor(item: { wpId: number; name: string }) {
  const safeName = item.name.replace(/[/\\]/g, "-").trim();
  return `${item.wpId}-${safeName}.yaml`;
}

async function writeItemsToDir<T extends { wpId: number; name: string }>(dir: URL, items: T[]) {
  await mkdir(dir, { recursive: true });

  const wantedFiles = new Set(items.map((i) => fileNameFor(i)));
  const existing = await readdir(dir);
  const stale = existing.filter(
    (f) => (f.endsWith(".yml") || f.endsWith(".yaml")) && !wantedFiles.has(f),
  );

  for (const file of stale) {
    await rm(new URL(file, dir));
  }

  for (const item of items) {
    const fname = fileNameFor(item);
    const tmpPath = join(dir.pathname, `${fname}.tmp`);
    const finalPath = join(dir.pathname, fname);
    await writeFile(tmpPath, stringify(item), "utf-8");
    await rename(tmpPath, finalPath);
  }
}

async function main() {
  console.log(`[sync-wp] source: ${WP_BASE}`);

  const configs = [TAG_CONFIG, CATEGORY_CONFIG];
  const results = await Promise.all(configs.map((c) => syncTaxonomy(c)));

  let hadFailure = false;
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i]!;
    const result = results[i]!;
    if (result.ok && result.items) {
      await writeItemsToDir(config.dir, result.items);
      console.log(`[sync-wp] ${config.label}: wrote ${result.items.length} files`);
    } else {
      hadFailure = true;
    }
  }

  if (hadFailure) process.exit(1);
}

main().catch((err) => {
  console.error(`[sync-wp] unexpected error:`, err);
  process.exit(1);
});
