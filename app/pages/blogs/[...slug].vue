<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <header class="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800">
      <NuxtLink
        :to="{ path: '/blogs', query: lastQuery }"
        class="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 shrink-0"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        返回部落格
      </NuxtLink>
      <NuxtLink :to="{ path: '/blogs', query: lastQuery }" class="text-right hover:opacity-80 transition-opacity">
        <h2 class="text-xl md:text-2xl font-bold tracking-tight">{{ blog.title }}</h2>
        <p class="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">{{ blog.brief }}</p>
      </NuxtLink>
    </header>

    <div v-if="pending || error" class="text-center py-20 text-neutral-400">
      {{ pending ? '載入中...' : '找不到文章' }}
    </div>

    <article v-else-if="post">
      <div class="text-center border-b border-neutral-200 dark:border-neutral-800 pb-8 mb-10">
        <h1 class="text-4xl md:text-5xl font-bold leading-tight" v-html="post.title.rendered" />
        <p class="text-sm text-neutral-400 mb-4">{{ formatDate(post.date) }}</p>
      </div>
      <!-- prose enables @tailwindcss/typography; wp-content targets WP Gutenberg block selectors via :deep() -->
      <div
        class="prose prose-neutral dark:prose-invert max-w-none prose-img:rounded-none wp-content"
        v-html="post.content.rendered"
      />
    </article>
    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import { fetchPost, stripHtml, formatDate } from "~/composables/useWpApi";

const route = useRoute();
const lastQuery = useState<Record<string, string>>('blogs:lastQuery', () => ({}))
const { blog } = useAppConfig()

// [...slug][0] is the post ID; rest is ignored (human-readable title comes from ?title= query)
const postId = Number(route.params.slug?.[0]);

const {
  data: post,
  pending,
  error,
} = await useAsyncData(`wp-post-${postId}`, () => fetchPost(postId));

const meta = computed(() => {
  const p = post.value
  return {
    title: p ? stripHtml(p.title.rendered) : '文章',
    description: p ? stripHtml(p.excerpt.rendered).slice(0, 160) : '',
    image: p?.jetpack_featured_media_url ?? '',
  }
})

useSeoMeta({
  title: () => `${meta.value.title} | Jen Liu`,
  description: () => meta.value.description,
  ogTitle: () => meta.value.title,
  ogDescription: () => meta.value.description,
  ogImage: () => meta.value.image || undefined,
  twitterCard: 'summary_large_image',
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

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
