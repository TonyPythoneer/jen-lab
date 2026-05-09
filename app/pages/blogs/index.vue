<template>
  <!-- `fixed inset-0` escapes UMain's `min-h-[calc(100vh-...)]`; the bottom pagination then pins to the visible viewport edge on mobile/desktop alike. -->
  <div class="fixed inset-0 z-10 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
    <BlogTopBar class="shrink-0">
      <template #left>
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          icon="i-lucide-house"
          aria-label="返回首頁"
          class="rounded-full"
        />
      </template>
      <template #center>
        <div class="relative h-8 overflow-hidden">
          <Transition name="topbar-swap">
            <UFieldGroup v-if="searchOpen" key="search" class="absolute inset-0 w-full">
              <BlogFilterButton
                v-model="selectedCategoryIds"
                label="分類"
                icon="i-lucide-folder"
                :items="categoryTree"
              />
              <BlogFilterButton
                v-model="selectedTagIds"
                label="標籤"
                icon="i-lucide-tag"
                :items="tagTree"
              />
              <UInput
                v-model="searchInput"
                placeholder="🔍 Search"
                class="flex-1 min-w-0"
                @keyup.enter="submitSearch"
              />
              <UButton
                v-if="hasActiveFilters"
                icon="i-lucide-eraser"
                color="neutral"
                variant="outline"
                aria-label="清除全部篩選"
                @click="clearAllFilters"
              />
            </UFieldGroup>
            <h1
              v-else
              key="title"
              class="absolute inset-0 flex items-center justify-center text-base md:text-lg font-semibold tracking-tight truncate"
            >
              {{ blog.title }}
            </h1>
          </Transition>
        </div>
      </template>
      <template #right>
        <ClientOnly>
          <UButton
            :disabled="!filtersReady"
            :color="!filtersReady ? 'neutral' : searchOpen ? 'neutral' : 'primary'"
            :variant="!filtersReady || searchOpen ? 'soft' : 'solid'"
            :icon="searchOpen ? 'i-lucide-x' : 'i-lucide-search'"
            :aria-label="searchOpen ? '關閉搜尋' : '開啟搜尋'"
            @click="searchOpen = !searchOpen"
            class="rounded-full"
          />
        </ClientOnly>
      </template>
    </BlogTopBar>

    <!-- Scrollable content body. Pagination drives navigation; one page rendered at a time. -->
    <div ref="scrollEl" class="flex-1 overflow-y-auto">
      <div class="max-w-5xl mx-auto px-4 py-6">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlogPostCardSkeleton v-for="n in SKELETON_COUNT" :key="n" />
        </div>

        <div v-else-if="posts.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlogPostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :to="{ name: 'blogs-slug', params: { slug: [String(post.id)] }, query: { title: post.slug } }"
            :tag-map="tagMap"
          />
        </div>

        <div v-else class="text-center py-20 text-neutral-400">沒有找到相關文章</div>

        <ScrollToTopButton />
      </div>
    </div>

    <!-- Pagination pinned to bottom -->
    <div
      class="shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-4 py-3 flex justify-center"
    >
      <UPagination
        :page="currentPage"
        :total="totalPages * PER_PAGE"
        :items-per-page="PER_PAGE"
        :disabled="loading || totalPages <= 1"
        @update:page="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchPosts, type WpPost } from "~/composables/useWpApi";

const PER_PAGE = 20;
const SKELETON_COUNT = 4;

const { blog } = useAppConfig();
useSeoMeta({ title: `${blog.title} - ${blog.brief}`, description: blog.brief });

const route = useRoute();
const router = useRouter();
const initialQuery = route.query;

// Cache: hit memory before re-fetching (Nuxt payload during hydration, then static.data on client)
const cached = (key: string, app: ReturnType<typeof useNuxtApp>) =>
  app.payload.data[key] ?? app.static.data[key];

// #region Filter state
function csvToIds(v: unknown): number[] {
  if (typeof v !== "string" || !v) return [];
  return v
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

const search = ref(typeof initialQuery.q === "string" ? initialQuery.q : "");
const searchInput = ref(search.value);
const selectedCategoryIds = ref<number[]>(csvToIds(initialQuery.cat));
const selectedTagIds = ref<number[]>(csvToIds(initialQuery.tag));

const hasActiveFilters = computed(
  () =>
    !!search.value ||
    !!searchInput.value ||
    selectedCategoryIds.value.length > 0 ||
    selectedTagIds.value.length > 0,
);

function submitSearch() {
  search.value = searchInput.value;
}

function clearAllFilters() {
  searchInput.value = "";
  search.value = "";
  selectedCategoryIds.value = [];
  selectedTagIds.value = [];
}
// #endregion

// #region Taxonomies (categories + tags from content collections — sync via `pnpm sync:wp`)
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

const filtersReady = computed(() => !!categories.value && !!tags.value);
const tagMap = computed(() => Object.fromEntries((tags.value ?? []).map((t) => [t.wpId, t.name])));
const categoryTree = computed(() =>
  (categories.value ?? []).map((c) => ({
    label: c.name,
    value: c.wpId,
    children: c.children?.map((ch) => ({ label: ch.name, value: ch.wpId })),
  })),
);
const tagTree = computed(() => (tags.value ?? []).map((t) => ({ label: t.name, value: t.wpId })));
// #endregion

// #region Pagination + posts
const currentPage = ref(Math.max(1, Number(initialQuery.page) || 1));
const scrollEl = ref<HTMLDivElement | null>(null);

// scopeKey = filter set; pageCache lives within one scope. New scope → wipe.
const scopeKey = computed(
  () =>
    `${search.value}|${selectedCategoryIds.value.join(",")}|${selectedTagIds.value.join(",")}`,
);
const fullKey = computed(() => `wp-posts:${scopeKey.value}:${currentPage.value}`);

type PageResult = { data: WpPost[]; totalPages: number };
const pageCache = ref(new Map<number, PageResult>());
const totalPages = ref(1);

watch(scopeKey, () => {
  pageCache.value.clear();
  currentPage.value = 1;
  totalPages.value = 1;
});

const { data: result, status } = useLazyAsyncData<PageResult>(
  fullKey.value,
  () =>
    fetchPosts({
      page: currentPage.value,
      perPage: PER_PAGE,
      search: search.value || undefined,
      categories: selectedCategoryIds.value,
      tags: selectedTagIds.value,
    }),
  {
    server: false,
    watch: [fullKey],
    getCachedData: () => pageCache.value.get(currentPage.value),
  },
);

watch(result, (v) => {
  if (!v) return;
  pageCache.value.set(currentPage.value, v);
  if (totalPages.value === 1) totalPages.value = v.totalPages;
});

watch(currentPage, async () => {
  await nextTick();
  scrollEl.value?.scrollTo({ top: 0 });
});

const posts = computed(() => result.value?.data ?? []);
const loading = computed(() => status.value === "pending");
// #endregion

// #region URL sync
const lastQuery = useState<Record<string, string>>("blogs:lastQuery", () => ({}));

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
// #endregion

// #region UI state
const searchOpen = ref(
  !!search.value || selectedCategoryIds.value.length > 0 || selectedTagIds.value.length > 0,
);
// #endregion

</script>

<style scoped>
.topbar-swap-enter-active,
.topbar-swap-leave-active {
  transition:
    transform 250ms ease,
    opacity 250ms ease;
}
.topbar-swap-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.topbar-swap-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
