<template>
  <SitePageContainer>
    <!-- First section: back-nav + post header together fill the viewport -->
    <div class="min-h-[var(--first-section-h)] flex flex-col justify-center gap-6">
      <RouterLink
        :to="{ path: '/blogs', query: lastQuery }"
        class="inline-flex items-center gap-1 text-sm text-abyssal-ink/50 hover:text-digital-orange transition-colors"
      >
        <AppIcon name="i-lucide-arrow-left" class="size-4" />
        {{ chrome?.detailPage.backLink }}
      </RouterLink>

      <div v-if="pending || error || !post" class="text-center py-20 text-abyssal-ink/50">
        {{ pending ? chrome?.detailPage.loadingMessage : chrome?.detailPage.notFoundMessage }}
      </div>

      <AppPageHeader
        v-else
        :title="meta.title"
        :ui="{ title: 'font-display text-4xl md:text-5xl leading-tight' }"
      >
        <template #description>
          <span
            class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-ash-white text-abyssal-ink border border-abyssal-ink/10"
          >
            {{ formatDate(post.date) }}
          </span>
        </template>
      </AppPageHeader>
    </div>

    <!-- Featured image + post content (below the fold) -->
    <template v-if="post">
      <img
        v-if="meta.image"
        :src="meta.image"
        :alt="meta.title"
        class="w-full aspect-video object-cover rounded-card"
      />

      <article class="wp-content bg-ash-white rounded-card p-10" v-html="post.content.rendered" />
    </template>

    <SharedScrollToTopButton />
  </SitePageContainer>
</template>

<script setup lang="ts">
import { fetchPost, stripHtml, formatDate } from "~/utils/blog/wpApi";

const route = useRoute("/blogs/[...slug]");
const lastQuery = useBlogLastQuery();

// Page wording comes from content/site/blogs.yml (single source of truth).
const { data: chrome } = useAsyncData("site:blogs", () => queryCollection("siteBlogs").first());

// [...slug][0] is the post ID; rest is ignored (human-readable title comes from ?title= query)
// route.params.slug is a string with vue-router file routing; the Array.isArray guard is a defensive fallback
const rawSlug = route.params.slug;
const postId = Number(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);
const validId = Number.isInteger(postId) && postId > 0;

// Lazy (not useAsyncData): non-blocking, paints the shell + loading state first.
const {
  data: post,
  status,
  error,
} = useAsyncData(`wp-post-${postId}`, () => fetchPost(postId), { immediate: validId });
const pending = computed(() => validId && status.value === "pending");

const meta = computed(() => {
  const p = post.value;
  return {
    title: p ? stripHtml(p.title.rendered) : "文章",
    description: p ? stripHtml(p.excerpt.rendered).slice(0, 160) : "",
    image: p?.jetpack_featured_media_url ?? "",
  };
});

useSeoMeta({
  title: () => chrome.value?.detailPage.seoTitleTemplate.replace("{{title}}", meta.value.title),
  description: () => meta.value.description,
  ogTitle: () => meta.value.title,
  ogDescription: () => meta.value.description,
  ogImage: () => meta.value.image || undefined,
  twitterCard: "summary_large_image",
});
</script>

<style scoped>
@reference "~/assets/css/main.css";
@plugin "@tailwindcss/typography";

.wp-content {
  @apply prose prose-neutral max-w-none;
}

.wp-content :deep(.wp-block-gallery) {
  @apply flex flex-wrap gap-4 my-8 p-0 list-none;
}

.wp-content :deep(.wp-block-gallery > figure) {
  @apply m-0 flex-1 min-w-[200px];
}

.wp-content :deep(.wp-block-image img) {
  @apply w-full h-auto rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300;
}

.wp-content :deep(.aligncenter) {
  @apply flex justify-center mx-auto;
}

.wp-content :deep(.wp-block-image.aligncenter) {
  @apply flex justify-center;
}
</style>
