declare const __WP_BASE__: string;
export const WP_BASE = __WP_BASE__;

// Field whitelists keep payloads lean (WP defaults include many unused properties)
const POST_LIST_FIELDS =
  "id,date,slug,title,excerpt,link,tags,categories,jetpack_featured_media_url";
const POST_DETAIL_FIELDS =
  "id,date,slug,title,excerpt,content,link,tags,categories,jetpack_featured_media_url";

export interface WpPost {
  id: number;
  date: string;
  slug: string;
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

export interface WpPostsPage {
  data: WpPost[];
  totalPages: number;
}

export async function fetchPosts(params: {
  page?: number;
  perPage?: number;
  search?: string;
  tags?: number[];
  categories?: number[];
}): Promise<WpPostsPage> {
  const { page = 1, perPage = 10, search, tags, categories } = params;
  const resp = await $fetch.raw<WpPost[]>(`${WP_BASE}/posts`, {
    query: {
      per_page: perPage,
      page,
      ...(search && { search }),
      ...(tags?.length && { tags: tags.join(",") }),
      ...(categories?.length && { categories: categories.join(",") }),
      _fields: POST_LIST_FIELDS,
    },
  });
  return {
    data: resp._data ?? [],
    totalPages: parseInt(resp.headers.get("X-WP-TotalPages") ?? "1"),
  };
}

export async function fetchPost(id: number): Promise<WpPost> {
  return $fetch<WpPost>(`${WP_BASE}/posts/${id}`, {
    query: { _fields: POST_DETAIL_FIELDS },
  });
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
