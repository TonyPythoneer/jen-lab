<template>
  <SitePageContainer>
    <!-- First section: back-nav + post header together fill the viewport -->
    <div class="min-h-[var(--first-section-h)] flex flex-col justify-center gap-6">
      <RouterLink
        :to="{ path: '/blogs', query: lastQuery }"
        class="inline-flex items-center gap-1 text-sm text-abyssal-ink/50 hover:text-digital-orange transition-colors"
      >
        <Icon name="i-lucide-arrow-left" class="size-4" />
        {{ chrome?.detailPage.backLink }}
      </RouterLink>

      <div v-if="pending || error || !post" class="text-center py-20 text-abyssal-ink/50">
        {{ pending ? chrome?.detailPage.loadingMessage : chrome?.detailPage.notFoundMessage }}
      </div>

      <PageHeader
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
      </PageHeader>
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
import { useSiteBlogsChrome } from "~/composables/blog/useSiteBlogsChrome";
// Imported via the script (not an SFC <style>) so Tailwind processes it under
// vize too — vize skips Tailwind over SFC style blocks.
import "~/assets/css/wp-content.css";

const route = useRoute("/blogs/[...slug]");
const lastQuery = useBlogLastQuery();

// Page wording comes from content/site/blogs.yml (single source of truth).
const { data: chrome } = useSiteBlogsChrome();

// [...slug][0] is the post ID; rest is ignored (human-readable title comes from ?title= query)
// route.params.slug is a string with vue-router file routing; the Array.isArray guard is a defensive fallback
const rawSlug = route.params.slug;
const postId = Number(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);
const validId = Number.isInteger(postId) && postId > 0;

// Non-blocking: paint the shell + loading state first, fetch the post client-side.
const post = ref<Awaited<ReturnType<typeof fetchPost>> | null>(null);
const pending = ref(false);
const error = ref<Error | null>(null);

onMounted(async () => {
  if (!validId) return;
  pending.value = true;
  try {
    post.value = await fetchPost(postId);
  } catch (e) {
    error.value = e instanceof Error ? e : new Error(String(e));
  } finally {
    pending.value = false;
  }
});

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
