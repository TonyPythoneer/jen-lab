<template>
  <NuxtLink
    :to="to"
    class="group rounded-card border border-abyssal-ink/10 overflow-hidden hover:shadow-lg transition-shadow flex flex-col bg-ash-white"
  >
    <!-- Fixed-height media box reserves space before the image decodes (no CLS). -->
    <div class="relative h-48">
      <img
        v-if="post.jetpack_featured_media_url"
        :src="post.jetpack_featured_media_url"
        :alt="stripHtml(post.title.rendered)"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-basalt-canvas">
        <UIcon name="i-lucide-newspaper" class="size-12 text-abyssal-ink/30" />
      </div>
      <span
        v-if="isNew"
        class="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-digital-orange text-pure-white text-xs font-semibold px-2 py-0.5 rounded-button shadow"
      >
        <UIcon name="i-lucide-sparkles" class="size-3" />
        {{ props.newBadgeText }}
      </span>
    </div>
    <div class="flex flex-col gap-2 flex-1 p-4">
      <p class="text-xs text-abyssal-ink/50">{{ formatDate(post.date) }}</p>
      <h2
        class="text-base font-semibold leading-snug group-hover:text-digital-orange transition-colors text-abyssal-ink"
        v-html="post.title.rendered"
      />
      <p class="text-sm text-abyssal-ink/60 line-clamp-3">
        {{ stripHtml(post.excerpt.rendered) }}
      </p>
      <div class="flex flex-wrap gap-1 mt-auto pt-2">
        <UBadge
          v-for="tagId in post.tags.slice(0, 3)"
          :key="tagId"
          color="neutral"
          variant="outline"
          size="xs"
        >
          {{ tagMap[tagId] ?? tagId }}
        </UBadge>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { stripHtml, formatDate, type WpPost } from "~/utils/wpApi";
import type { RouteLocationRaw } from "vue-router";

// Badge text + age cutoff come from content/site/blogs.yml via the page.
// Defaults keep the card self-contained for Storybook and as a fallback.
const props = withDefaults(
  defineProps<{
    post: WpPost;
    to: RouteLocationRaw;
    tagMap: Record<number, string>;
    newBadgeText?: string;
    newPostDaysThreshold?: number;
  }>(),
  {
    newBadgeText: "New!",
    newPostDaysThreshold: 7,
  },
);

const isNew = computed(() => {
  const t = new Date(props.post.date).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= props.newPostDaysThreshold * 86400_000;
});
</script>
