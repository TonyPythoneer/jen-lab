<template>
  <SitePageContainer>
    <!-- Header -->
    <PageHeader
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
        <p class="text-abyssal-ink/50 mb-4">{{ chrome?.listPage.loadingErrorMessage }}</p>
        <Button color="neutral" variant="outline" @click="load()">
          {{ chrome?.listPage.loadingErrorRetryButton }}
        </Button>
      </div>

      <div v-else-if="posts.length" class="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-card">
        <BlogPostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :to="{
            path: `/blogs/${post.id}`,
            query: { title: post.slug },
          }"
          :tag-map="tagMap"
          :new-badge-text="chrome?.postCard.newBadgeText"
          :new-post-days-threshold="chrome?.postCard.newPostDaysThreshold"
        />
      </div>

      <div v-else class="text-center py-20 text-abyssal-ink/50">
        {{ chrome?.listPage.noResultsMessage }}
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center border-t border-abyssal-ink/10 pt-6">
      <Pagination
        :page="currentPage"
        :total="totalPages * PER_PAGE"
        :items-per-page="PER_PAGE"
        :disabled="loading || totalPages <= 1"
        @update:page="currentPage = $event"
      >
        <!-- Active page: orange fill via raw token (no `primary` alias is wired to digital-orange). -->
        <template #item="{ item, page: activePage }">
          <Button
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
            @click="currentPage = item.value as number"
          />
          <span v-else class="px-1.5 text-sm text-abyssal-ink/50">…</span>
        </template>
      </Pagination>
    </div>

    <SharedScrollToTopButton />
  </SitePageContainer>
</template>

<script setup lang="ts">
import { useBlogList } from "~/composables/blog/useBlogList";
import { useSiteBlogsChrome } from "~/composables/blog/useSiteBlogsChrome";
import { useBlogTaxonomies } from "~/composables/blog/useBlogTaxonomies";
import { fetchPosts } from "~/utils/blog/wpApi";
import { csvToIds } from "~/utils/shared/csvToIds";

const PER_PAGE = 20;
const SKELETON_COUNT = 4;

// Page wording comes from content/site/blogs.yml (single source of truth).
const { data: chrome } = useSiteBlogsChrome();
useSeoMeta({
  title: () => chrome.value?.listPage.seoTitle,
  description: () => chrome.value?.listPage.seoDescription,
});

const route = useRoute();
const router = useRouter();
const initialQuery = route.query;

// Filters, pagination + per-scope page cache (pure, see useBlogList).
const { search, selectedCategoryIds, selectedTagIds, currentPage, scopeKey, fullKey } =
  useBlogList(initialQuery);

// Taxonomies come from content collections (sync via `pnpm sync:wp`).
const { tags } = useBlogTaxonomies();
const tagMap = computed(() => Object.fromEntries((tags.value ?? []).map((t) => [t.wpId, t.name])));

// #region Posts
const scrollEl = ref<HTMLDivElement | null>(null);

// _key drives useMemoize's cache lookup; the closure refs carry the actual values.
const loadPosts = useMemoize((_key: string) =>
  fetchPosts({
    page: currentPage.value,
    perPage: PER_PAGE,
    search: search.value || undefined,
    categories: selectedCategoryIds.value,
    tags: selectedTagIds.value,
  }),
);

const result = ref<Awaited<ReturnType<typeof fetchPosts>> | null>(null);
const status = ref<"idle" | "pending" | "success" | "error">("idle");
const error = ref<Error | null>(null);

async function load() {
  status.value = "pending";
  error.value = null;
  try {
    result.value = await loadPosts(fullKey.value);
    status.value = "success";
  } catch (e) {
    // A rejected Promise stays cached under this key; evict it so a retry re-fetches.
    loadPosts.delete(fullKey.value);
    error.value = e instanceof Error ? e : new Error(String(e));
    status.value = "error";
  }
}

// New filter scope wipes the cache first so it cannot grow unbounded across sessions.
watch(scopeKey, () => loadPosts.clear());
watch(fullKey, load, { immediate: true });

watch(currentPage, async () => {
  await nextTick();
  scrollEl.value?.scrollTo({ top: 0 });
});

const posts = computed(() => result.value?.data ?? []);
const totalPages = computed(() => result.value?.totalPages ?? 1);
const loading = computed(() => status.value === "pending");
// #endregion

// #region URL sync
const lastQuery = useBlogLastQuery();

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
