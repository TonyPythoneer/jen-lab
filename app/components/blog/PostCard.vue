<template>
  <NuxtLink
    :to="to"
    class="group rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
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
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900"
      >
        <UIcon name="i-lucide-newspaper" class="size-12 text-neutral-400" />
      </div>
      <span
        v-if="isNew"
        class="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow"
      >
        <UIcon name="i-lucide-sparkles" class="size-3" />
        New!
      </span>
    </div>
    <div class="flex flex-col gap-2 flex-1 p-4">
      <p class="text-xs text-neutral-400">{{ formatDate(post.date) }}</p>
      <h2
        class="text-base font-semibold leading-snug group-hover:text-primary-500 transition-colors"
        v-html="post.title.rendered"
      />
      <p class="text-sm text-neutral-500 line-clamp-3">
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

const props = defineProps<{
  post: WpPost;
  to: RouteLocationRaw;
  tagMap: Record<number, string>;
}>();

const NEW_POST_DAYS = 7;
const isNew = computed(() => {
  const t = new Date(props.post.date).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= NEW_POST_DAYS * 86400_000;
});
</script>
