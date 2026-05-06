<template>
  <div>
    <BlogTopBar :title="blog.title">
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

    <div class="max-w-5xl mx-auto px-4 py-10">
      <!-- Search + Category + Tags -->
      <Transition name="search-fade">
        <BlogSearchBar
          v-if="searchOpen"
          v-model:selected-category-ids="selectedCategoryIds"
          v-model:selected-tag-ids="selectedTagIds"
          v-model:search-input="searchInput"
          :categories="categories ?? []"
          :tags="tags ?? []"
          @change="currentPage = 1"
          @submit="submitSearch"
        />
      </Transition>

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
