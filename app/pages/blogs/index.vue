<template>
  <!-- `fixed inset-0` escapes UMain's `min-h-[calc(100vh-...)]`; the bottom pagination then pins to the visible viewport edge on mobile/desktop alike. -->
  <div class="fixed inset-0 z-10 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
    <BlogTopBar :title="blog.title" class="shrink-0">
      <template #left>
        <NuxtLink
          to="/"
          aria-label="返回首頁"
          class="inline-flex items-center text-neutral-400 hover:text-neutral-600"
        >
          <UIcon name="i-lucide-house" class="size-5" />
        </NuxtLink>
      </template>
      <template #right>
        <ClientOnly>
          <UButton
            :disabled="!filtersReady"
            :color="!filtersReady ? 'neutral' : searchOpen ? 'neutral' : 'primary'"
            :variant="!filtersReady || searchOpen ? 'soft' : 'solid'"
            :icon="searchOpen ? 'i-lucide-x' : 'i-lucide-search'"
            size="sm"
            :aria-label="searchOpen ? '關閉搜尋' : '開啟搜尋'"
            @click="searchOpen = !searchOpen"
          />
        </ClientOnly>
      </template>
    </BlogTopBar>

    <!-- Search + Category + Tags -->
    <div class="shrink-0 max-w-5xl mx-auto w-full px-4">
      <Transition name="search-fade">
        <BlogSearchBar
          v-if="searchOpen"
          v-model:selected-category-ids="selectedCategoryIds"
          v-model:selected-tag-ids="selectedTagIds"
          v-model:search-input="searchInput"
          :categories="categories ?? []"
          :tags="tags ?? []"
          class="pt-4"
          @submit="submitSearch"
        />
      </Transition>
    </div>

    <!-- Scrollable content body. Pagination drives navigation; one page rendered at a time. -->
    <div ref="scrollEl" class="flex-1 overflow-y-auto">
      <div class="max-w-5xl mx-auto px-4 py-6">
        <div v-if="loading" class="text-center py-20 text-neutral-400">載入中...</div>

        <div v-else-if="posts.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlogPostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :to="postRoute(post)"
            :tag-map="tagMap"
          />
        </div>

        <div v-else class="text-center py-20 text-neutral-400">沒有找到相關文章</div>

        <ScrollToTopButton />
      </div>
    </div>

    <!-- Pagination pinned to bottom -->
    <div
      v-if="totalPages > 1"
      class="shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-4 py-3 flex justify-center"
    >
      <UPagination
        :page="currentPage"
        :total="totalPages * PER_PAGE"
        :items-per-page="PER_PAGE"
        @update:page="loadPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchPosts, stripHtml, type WpPost } from "~/composables/useWpApi";

const PER_PAGE = 10;
const NEW_POST_DAYS = 7;

const { blog } = useAppConfig();
useSeoMeta({ title: `${blog.title} - ${blog.brief}`, description: blog.brief });

const route = useRoute();
const router = useRouter();
const lastQuery = useState<Record<string, string>>("blogs:lastQuery", () => ({}));

// Parse initial filters from URL (one-shot; subsequent URL → state sync would flicker on route leave)
function csvToIds(v: unknown): number[] {
  if (typeof v !== "string" || !v) return [];
  return v
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

const initialQuery = route.query;
const search = ref(typeof initialQuery.q === "string" ? initialQuery.q : "");
const selectedCategoryIds = ref<number[]>(csvToIds(initialQuery.cat));
const selectedTagIds = ref<number[]>(csvToIds(initialQuery.tag));
const currentPage = ref(Math.max(1, Number(initialQuery.page) || 1));
const searchInput = ref(search.value);

// State → URL (one-way). Skip when leaving /blogs to avoid clobbering during navigation.
watch([search, selectedCategoryIds, selectedTagIds, currentPage], () => {
  if (route.path !== "/blogs") return;
  const query: Record<string, string> = {};
  if (search.value) query.q = search.value;
  if (selectedCategoryIds.value.length) query.cat = selectedCategoryIds.value.join(",");
  if (selectedTagIds.value.length) query.tag = selectedTagIds.value.join(",");
  if (currentPage.value > 1) query.page = String(currentPage.value);
  lastQuery.value = query;
  router.replace({ query });
});

// Capture initial URL into lastQuery (covers fresh load / back-from-detail)
lastQuery.value = { ...initialQuery } as Record<string, string>;

// Cache: hit memory before re-fetching (Nuxt payload during hydration, then static.data on client)
const cached = (key: string, app: ReturnType<typeof useNuxtApp>) =>
  app.payload.data[key] ?? app.static.data[key];

// Taxonomies (sourced from content collections — sync via `pnpm sync:wp`)
// Client-only: defers taxonomy fetch off SSR/hydration critical path.
const { data: categories } = useLazyAsyncData(
  "wp-categories",
  () => queryCollection("wpCategories").order("wpId", "DESC").all(),
  { server: false, getCachedData: cached },
);
const { data: tags } = useLazyAsyncData(
  "wp-tags",
  () => queryCollection("wpTags").order("count", "DESC").order("wpId", "DESC").all(),
  { server: false, getCachedData: cached },
);

const searchOpen = ref(
  !!search.value || selectedCategoryIds.value.length > 0 || selectedTagIds.value.length > 0,
);
const filtersReady = computed(() => !!categories.value && !!tags.value);

const tagMap = computed(() => Object.fromEntries((tags.value ?? []).map((t) => [t.wpId, t.name])));

// Cache for instant page revisits. Wiped on filter/search change.
const cache = ref(new Map<number, WpPost[]>());
const totalPages = ref(1);
const loading = ref(false);
const scrollEl = ref<HTMLDivElement | null>(null);

function fetchPage(page: number) {
  return fetchPosts({
    page,
    perPage: PER_PAGE,
    search: search.value || undefined,
    categories: selectedCategoryIds.value,
    tags: selectedTagIds.value,
  });
}

// SSR seed: one-shot static-key fetch for the URL-requested page. Pagination clicks go through
// the manual `loadPage` path — keeping the seed non-reactive avoids refetch on filter watcher fires.
const seedKey = `wp-posts:seed:${currentPage.value}:${search.value}:${selectedCategoryIds.value.join(",")}:${selectedTagIds.value.join(",")}`;
const { data: seedResult } = await useAsyncData(seedKey, () => fetchPage(currentPage.value), {
  getCachedData: cached,
});
if (seedResult.value) {
  cache.value.set(currentPage.value, seedResult.value.data);
  totalPages.value = seedResult.value.totalPages;
}

// Filter/search change → wipe cache and reload from page 1.
watch([search, selectedCategoryIds, selectedTagIds], () => {
  cache.value.clear();
  loadPage(1);
});

// Featured/pinned post UI is currently disabled — flip the flag to re-enable.
// Original placement: first post of page 1, only when `isNew`.
const ENABLE_FEATURED = false;
const featuredPost = computed(() => {
  if (!ENABLE_FEATURED || currentPage.value !== 1) return null;
  const post = cache.value.get(1)?.[0];
  return post && isNew(post) ? post : null;
});

const posts = computed(() => cache.value.get(currentPage.value) ?? []);

async function loadPage(page: number) {
  if (page < 1 || page > totalPages.value || loading.value) return;
  if (!cache.value.has(page)) {
    loading.value = true;
    try {
      const result = await fetchPage(page);
      totalPages.value = result.totalPages;
      cache.value.set(page, result.data);
    } finally {
      loading.value = false;
    }
  }
  currentPage.value = page;
  await nextTick();
  scrollEl.value?.scrollTo({ top: 0 });
}

function submitSearch() {
  search.value = searchInput.value;
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

<style scoped>
.search-fade-enter-active,
.search-fade-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
  overflow: hidden;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
