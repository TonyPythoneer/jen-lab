export const WP_BASE = "https://jenliu.com.au/wp-json/wp/v2";

export interface WpPost {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  link: string;
  tags: number[];
  categories: number[];
  jetpack_featured_media_url: string;
  yoast_head_json?: {
    description?: string;
    og_image?: { url: string }[];
  };
}

export interface WpTag {
  id: number;
  name: string;
  count: number;
}

export interface WpCategory {
  id: number;
  name: string;
  count: number;
  parent: number;
}

export interface WpPage {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
}

export interface WpListResult<T> {
  data: T[];
  totalPages: number;
  total: number;
}

export async function fetchPosts(params: {
  page?: number;
  perPage?: number;
  search?: string;
  tags?: number[];
  categories?: number[];
}): Promise<WpListResult<WpPost>> {
  const { page = 1, perPage = 10, search, tags, categories } = params;
  const resp = await $fetch.raw<WpPost[]>(`${WP_BASE}/posts`, {
    query: {
      per_page: perPage,
      page,
      ...(search && { search }),
      ...(tags?.length && { tags: tags.join(",") }),
      ...(categories?.length && { categories: categories.join(",") }),
      _fields:
        "id,date,title,excerpt,link,tags,categories,jetpack_featured_media_url",
    },
  });
  return {
    data: resp._data ?? [],
    totalPages: parseInt(resp.headers.get("X-WP-TotalPages") ?? "1"),
    total: parseInt(resp.headers.get("X-WP-Total") ?? "0"),
  };
}

export async function fetchPost(id: number): Promise<WpPost> {
  return $fetch<WpPost>(`${WP_BASE}/posts/${id}`);
}

export async function fetchTags(perPage = 100): Promise<WpTag[]> {
  return $fetch<WpTag[]>(`${WP_BASE}/tags`, {
    query: { per_page: perPage, orderby: "count", order: "desc" },
  });
}

export async function fetchCategories(perPage = 100): Promise<WpCategory[]> {
  return $fetch<WpCategory[]>(`${WP_BASE}/categories`, {
    query: { per_page: perPage, orderby: "count", order: "desc" },
  });
}

export async function fetchPages(): Promise<WpPage[]> {
  return $fetch<WpPage[]>(`${WP_BASE}/pages`);
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
