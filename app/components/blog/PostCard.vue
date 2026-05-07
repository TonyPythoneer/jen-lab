<template>
  <NuxtLink
    :to="to"
    :class="[
      'group rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow flex flex-col',
      featured ? 'relative w-full md:max-w-[60%] mx-auto block mb-10' : '',
    ]"
  >
    <span
      v-if="featured"
      class="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-primary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow"
    >
      <UIcon name="i-lucide-sparkles" class="size-3" />
      New
    </span>
    <img
      v-if="post.jetpack_featured_media_url"
      :src="post.jetpack_featured_media_url"
      :alt="stripHtml(post.title.rendered)"
      :class="['w-full object-cover', featured ? 'h-48 md:h-56' : 'h-48']"
      loading="lazy"
    />
    <div
      v-else
      :class="[
        'w-full flex items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900',
        featured ? 'h-48 md:h-56' : 'h-48',
      ]"
    >
      <UIcon name="i-lucide-newspaper" class="size-12 text-neutral-400" />
    </div>
    <div :class="['flex flex-col gap-2 flex-1', featured ? 'p-4 md:p-5' : 'p-4']">
      <p class="text-xs text-neutral-400">{{ formatDate(post.date) }}</p>
      <h2
        :class="[
          'font-semibold leading-snug group-hover:text-primary-500 transition-colors',
          featured ? 'text-base md:text-lg' : 'text-base',
        ]"
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
import { stripHtml, formatDate, type WpPost } from "~/composables/useWpApi";
import type { RouteLocationRaw } from "vue-router";

defineProps<{
  post: WpPost;
  to: RouteLocationRaw;
  tagMap: Record<number, string>;
  featured?: boolean;
}>();
</script>
