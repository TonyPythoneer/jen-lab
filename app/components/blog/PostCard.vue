<template>
  <NuxtLink
    :to="to"
    class="group rounded-card overflow-hidden transition-transform hover:translate-y-[-4px]"
    :style="{
      backgroundColor: 'var(--color-ash-white)',
      borderLeft: '12px solid var(--color-digital-orange)',
    }"
  >
    <!-- Image with frame border. -->
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        v-if="post.jetpack_featured_media_url"
        :src="post.jetpack_featured_media_url"
        :alt="stripHtml(post.title.rendered)"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
        :style="{
          backgroundImage: 'linear-gradient(to bottom right, var(--color-basalt-canvas), #d1d5db)',
        }"
      >
        <UIcon name="i-lucide-newspaper" class="size-12" style="color: #6b7280" />
      </div>
      <!-- Frame effect: absolutely positioned border with offset shadow. -->
      <div
        class="absolute inset-0 pointer-events-none"
        :style="{
          border: '12px solid var(--color-ash-white)',
          boxShadow: '6px 6px 0 rgba(7, 6, 7, 0.8)',
        }"
      />
    </div>

    <!-- Content. -->
    <div class="flex flex-col gap-2 flex-1 p-7">
      <p
        class="text-xs font-semibold uppercase tracking-[0.04em]"
        :style="{ color: 'var(--color-digital-orange)' }"
      >
        {{ tagMap[post.tags?.[0]] ?? "—" }}
      </p>
      <h2
        class="font-semibold text-lg leading-snug"
        :style="{ color: 'var(--color-abyssal-ink)' }"
        v-html="post.title.rendered"
      />
      <p class="text-sm" :style="{ color: 'rgba(7, 6, 7, 0.6)' }">
        {{ formatDate(post.date) }}
      </p>
      <p class="text-sm line-clamp-2 flex-1" :style="{ color: 'rgba(7, 6, 7, 0.7)' }">
        {{ stripHtml(post.excerpt.rendered) }}
      </p>
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
