<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 mb-8"
    >
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      平臺入口
    </NuxtLink>

    <!-- Search + Category + Tags -->
    <form class="flex flex-wrap gap-2 mb-6" @submit.prevent="submitSearch">
      <BlogFilterButton
        v-model="selectedCategoryIds"
        label="分類"
        clear-label="清除分類"
        :items="categories ?? []"
        @change="currentPage = 1"
      />

      <BlogFilterButton
        v-model="selectedTagIds"
        label="標籤"
        clear-label="清除標籤"
        :items="activeTags"
        @change="currentPage = 1"
      />

      <div class="flex gap-2 flex-1">
        <UInput
          v-model="searchInput"
          placeholder="搜尋文章..."
          icon="i-lucide-search"
          class="flex-1"
        />
        <UButton size="sm" type="submit">搜尋</UButton>
      </div>
    </form>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-20 text-neutral-400">載入中...</div>

    <template v-else-if="posts?.length">
      <!-- Featured latest post -->
      <BlogPostCard
        v-if="featuredPost"
        :post="featuredPost"
        :to="postRoute(featuredPost)"
        :tag-map="tagMap"
        featured
      />

      <!-- Posts grid (exclude featured) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BlogPostCard
          v-for="post in remainingPosts"
          :key="post.id"
          :post="post"
          :to="postRoute(post)"
          :tag-map="tagMap"
        />
      </div>
    </template>

    <!-- Empty -->
    <div v-else class="text-center py-20 text-neutral-400">沒有找到相關文章</div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-10">
      <UPagination
        v-model:page="currentPage"
        :total="totalPages * PER_PAGE"
        :items-per-page="PER_PAGE"
      />
    </div>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import {
  fetchCategories,
  fetchPosts,
  fetchTags,
  stripHtml,
  type WpPost,
} from "~/composables/useWpApi";

const PER_PAGE = 10;
const NEW_POST_DAYS = 7;

useSeoMeta({ title: "榛知 - 關於澳洲的中文知識庫", description: "關於澳洲的中文知識庫" });

const route = useRoute();
const router = useRouter();
const lastQuery = useState<Record<string, string>>("blogs:lastQuery", () => ({}));

// Parse initial filters from URL (one-shot; subsequent URL → state sync would flicker on route leave)
function csvToIds(v: unknown): number[] {
  if (typeof v !== "string" || !v) return [];
  return v.split(",").map(Number).filter((n) => Number.isFinite(n) && n > 0);
}

const initialQuery = route.query;
const search = ref(typeof initialQuery.q === "string" ? initialQuery.q : "");
const selectedCategoryIds = ref<number[]>(csvToIds(initialQuery.cat));
const selectedTagIds = ref<number[]>(csvToIds(initialQuery.tag));
const currentPage = ref(Math.max(1, Number(initialQuery.page) || 1));
const searchInput = ref(search.value);

// State → URL (one-way). Skip when leaving /blogs to avoid clobbering during navigation.
watch(
  [search, selectedCategoryIds, selectedTagIds, currentPage],
  () => {
    if (route.path !== "/blogs") return;
    const query: Record<string, string> = {};
    if (search.value) query.q = search.value;
    if (selectedCategoryIds.value.length) query.cat = selectedCategoryIds.value.join(",");
    if (selectedTagIds.value.length) query.tag = selectedTagIds.value.join(",");
    if (currentPage.value > 1) query.page = String(currentPage.value);
    lastQuery.value = query;
    router.replace({ query });
  },
);

// Capture initial URL into lastQuery (covers fresh load / back-from-detail)
lastQuery.value = { ...initialQuery } as Record<string, string>;

// Cache: hit memory before re-fetching (Nuxt payload during hydration, then static.data on client)
const cached = (key: string, app: ReturnType<typeof useNuxtApp>) =>
  app.payload.data[key] ?? app.static.data[key];

// Taxonomies
const { data: categories } = await useAsyncData("wp-categories", () => fetchCategories(), {
  getCachedData: cached,
});
const { data: tags } = await useAsyncData("wp-tags", () => fetchTags(), {
  getCachedData: cached,
});

const activeTags = computed(() => (tags.value ?? []).filter((t) => t.count > 0));
const tagMap = computed(() => Object.fromEntries((tags.value ?? []).map((t) => [t.id, t.name])));

// Posts (key includes filters → each combo cached separately)
const postsKey = computed(
  () =>
    `wp-posts:${currentPage.value}:${search.value}:${selectedCategoryIds.value.join(",")}:${selectedTagIds.value.join(",")}`,
);

const { data: postsResult, pending } = await useAsyncData(
  postsKey,
  () =>
    fetchPosts({
      page: currentPage.value,
      perPage: PER_PAGE,
      search: search.value || undefined,
      categories: selectedCategoryIds.value,
      tags: selectedTagIds.value,
    }),
  { getCachedData: cached },
);

const posts = computed(() => postsResult.value?.data ?? []);
const totalPages = computed(() => postsResult.value?.totalPages ?? 1);

const featuredPost = computed(() => {
  const first = posts.value[0];
  return first && isNew(first) ? first : null;
});

const remainingPosts = computed(() => (featuredPost.value ? posts.value.slice(1) : posts.value));

// Actions
function submitSearch() {
  search.value = searchInput.value;
  currentPage.value = 1;
}

// Helpers
function isNew(post: WpPost) {
  return Date.now() - new Date(post.date).getTime() < NEW_POST_DAYS * 86_400_000;
}

function postRoute(post: WpPost) {
  const slug = stripHtml(post.title.rendered)
    .replace(/\s+/g, "-")
    .replace(/[^\w一-鿿-]/g, "")
    .toLowerCase();
  return { path: `/blogs/${post.id}`, query: { title: slug } };
}
</script>
