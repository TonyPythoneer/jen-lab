<template>
  <SitePageContainer>
    <!-- Header -->
    <UPageHeader
      :title="chrome?.listPage.title"
      :description="chrome?.listPage.subtitle"
      class="font-display min-h-[var(--first-section-h)] flex flex-col justify-center"
      :ui="{ title: 'font-display uppercase text-6xl sm:text-8xl leading-[0.9] tracking-[0.03em]' }"
    />

    <!-- Posts grid -->
    <div ref="scrollEl">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-card">
        <BlogPostCardSkeleton v-for="n in SKELETON_COUNT" :key="n" />
      </div>

      <div v-else-if="error" class="text-center py-20">
        <p class="text-neutral-400 mb-4">{{ chrome?.listPage.loadingErrorMessage }}</p>
        <UButton color="neutral" variant="outline" @click="refresh()">
          {{ chrome?.listPage.loadingErrorRetryButton }}
        </UButton>
      </div>

      <div v-else-if="posts.length" class="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-card">
        <BlogPostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :to="{
            name: 'blogs-slug',
            params: { slug: [String(post.id)] },
            query: { title: post.slug },
          }"
          :tag-map="tagMap"
          :new-badge-text="chrome?.postCard.newBadgeText"
          :new-post-days-threshold="chrome?.postCard.newPostDaysThreshold"
        />
      </div>

      <div v-else class="text-center py-20 text-neutral-400">
        {{ chrome?.listPage.noResultsMessage }}
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center border-t border-neutral-200 pt-6">
      <UPagination
        :page="currentPage"
        :total="totalPages * PER_PAGE"
        :items-per-page="PER_PAGE"
        :disabled="loading || totalPages <= 1"
        @update:page="currentPage = $event"
      >
        <!-- Active page: orange fill via raw token (Nuxt UI `primary` semantic is not wired to digital-orange). -->
        <template #item="{ item, page: activePage }">
          <UButton
            v-if="item.type === 'page'"
            :label="String(item.value)"
            square
            color="neutral"
            variant="outline"
            :ui="{ label: 'min-w-5 text-center' }"
            :class="
              item.value === activePage
                ? 'bg-digital-orange text-pure-white shadow-none hover:bg-digital-orange hover:text-pure-white disabled:bg-digital-orange aria-disabled:bg-digital-orange'
                : undefined
            "
          />
          <span v-else class="px-1.5 text-sm text-neutral-400">…</span>
        </template>
      </UPagination>
    </div>

    <SharedScrollToTopButton />
  </SitePageContainer>
</template>

<script setup lang="ts">
import { fetchPosts } from "~/utils/wpApi";
import { csvToIds } from "~/utils/csvToIds";

const PER_PAGE = 20;
const SKELETON_COUNT = 4;

// Page wording comes from content/site/blogs.yml (single source of truth).
const { data: chrome } = await useAsyncData("site:blogs", () =>
  queryCollection("siteBlogs").first(),
);
useSeoMeta({
  title: () => chrome.value?.listPage.seoTitle,
  description: () => chrome.value?.listPage.seoDescription,
});

const route = useRoute();
const router = useRouter();
const initialQuery = route.query;

// Filters, pagination + per-scope page cache (pure, see useBlogList).
const {
  search,
  selectedCategoryIds,
  selectedTagIds,
  currentPage,
  fullKey,
  pageCache,
  totalPages,
  recordResult,
} = useBlogList(initialQuery);

// Taxonomies (categories + tags from content collections — sync via `pnpm sync:wp`).
// Client-only: defers taxonomy fetch off SSR/hydration critical path.
const { tags } = useBlogTaxonomies();
const tagMap = computed(() => Object.fromEntries((tags.value ?? []).map((t) => [t.wpId, t.name])));

// #region Posts
const scrollEl = ref<HTMLDivElement | null>(null);

const {
  data: result,
  status,
  error,
  refresh,
} = useLazyAsyncData(
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
  if (v) recordResult(v);
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

// URL → state (handles same-route navigateTo from SearchModal when already on /blogs)
watch(
  () => route.query,
  (q) => {
    const newSearch = typeof q.q === "string" ? q.q : "";
    const newCats = csvToIds(q.cat);
    const newTags = csvToIds(q.tag);
    if (newSearch !== search.value) search.value = newSearch;
    if (newCats.join(",") !== selectedCategoryIds.value.join(","))
      selectedCategoryIds.value = newCats;
    if (newTags.join(",") !== selectedTagIds.value.join(",")) selectedTagIds.value = newTags;
  },
);
// #endregion
</script>
