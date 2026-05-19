<script setup lang="ts">
import { fetchPosts, stripHtml, formatDate } from "~/utils/wpApi";

const { data: postsResult, status: postsStatus } = useLazyAsyncData(
  "home:blog-carousel",
  () => fetchPosts({ page: 1, perPage: 10 }),
  { server: false },
);
const blogLoading = computed(() => postsStatus.value === "idle" || postsStatus.value === "pending");

const { data: wpTagsData } = useLazyAsyncData(
  "home:wp-tags",
  () => queryCollection("wpTags").order("count", "DESC").all(),
  { server: false },
);

const tagMap = computed(() =>
  Object.fromEntries((wpTagsData.value ?? []).map((t) => [t.wpId, t.name])),
);

const BANNER_TONES = ["orange", "violet", "dark"] as const;

const blogPosts = computed(() =>
  (postsResult.value?.data ?? []).map((p, i) => ({
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    excerpt: stripHtml(p.excerpt.rendered),
    date: formatDate(p.date),
    image: p.jetpack_featured_media_url,
    tagLabel: (p.tags?.[0] !== undefined && tagMap.value[p.tags[0]]) || "Post",
    bannerTone: BANNER_TONES[i % BANNER_TONES.length],
  })),
);

const blogCarousel = ref<{ scrollPrev: () => void; scrollNext: () => void } | null>(null);
function scrollBlogPrev() {
  blogCarousel.value?.scrollPrev();
}
function scrollBlogNext() {
  blogCarousel.value?.scrollNext();
}
</script>

<template>
  <section id="blog" class="py-[72px] sm:py-[140px] space-y-6">
    <!-- px aligns header to the 1200px content column when section is full-bleed -->
    <div class="flex items-end justify-between gap-4 px-[max(1rem,calc((100vw-1200px)/2+1rem))]">
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-6xl"
      >
        Blog.
      </h2>
      <div
        class="flex items-center gap-1 border border-dotted border-abyssal-ink/30 rounded-button p-1"
      >
        <button
          class="size-9 inline-flex items-center justify-center rounded-button hover:bg-ash-white transition-colors text-abyssal-ink"
          aria-label="Previous"
          @click="scrollBlogPrev"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
        </button>
        <span class="border-l border-dotted border-abyssal-ink/30 self-stretch" />
        <button
          class="size-9 inline-flex items-center justify-center rounded-button hover:bg-ash-white transition-colors text-abyssal-ink"
          aria-label="Next"
          @click="scrollBlogNext"
        >
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </button>
      </div>
    </div>

    <SnapCarousel
      ref="blogCarousel"
      :items="blogPosts"
      :loading="blogLoading"
      peek="max(1rem, calc((100vw - 1200px) / 2 + 1rem))"
    >
      <template #skeleton>
        <div class="space-y-3">
          <USkeleton class="w-full aspect-[16/9] rounded-card" />
          <USkeleton class="h-5 w-16 rounded" />
          <USkeleton class="h-4 w-full rounded" />
          <USkeleton class="h-4 w-3/4 rounded" />
          <USkeleton class="h-3 w-20 rounded" />
        </div>
      </template>
      <template #default="{ item }">
        <NuxtLink :to="`/blogs/${item.id}?title=${item.slug}`" class="group block space-y-3">
          <div
            class="relative aspect-[16/9] rounded-card overflow-hidden border-2 border-abyssal-ink"
            :class="{
              'bg-digital-orange': item.bannerTone === 'orange',
              'bg-cyber-violet': item.bannerTone === 'violet',
              'bg-abyssal-ink': item.bannerTone === 'dark',
            }"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="stripHtml(item.title)"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover"
            />

            <template v-else>
              <div
                aria-hidden="true"
                class="absolute inset-0 pointer-events-none"
                :style="{
                  backgroundImage:
                    'radial-gradient(circle, var(--color-abyssal-ink) 2px, transparent 2.5px)',
                  backgroundSize: '12px 12px',
                  opacity: 0.22,
                  maskImage:
                    'radial-gradient(circle at 25% 50%, black 25%, rgba(0,0,0,0.4) 65%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(circle at 25% 50%, black 25%, rgba(0,0,0,0.4) 65%, transparent 100%)',
                }"
              />
              <div class="absolute inset-0 flex items-center justify-center p-4 text-center">
                <span
                  class="font-display tracking-[0.02em] leading-[0.95] text-2xl md:text-3xl text-pure-white drop-shadow line-clamp-2"
                  v-html="item.title"
                />
              </div>
            </template>

            <div class="absolute bottom-2 left-3 flex items-center gap-1.5">
              <span class="size-2 bg-pure-white rotate-45 rounded-[1px]" />
              <span class="text-[10px] text-pure-white/80 uppercase tracking-widest font-medium">
                jen-lab
              </span>
            </div>
          </div>

          <div class="space-y-2 px-1">
            <span
              class="inline-block bg-pixel-glare text-abyssal-ink text-xs px-2.5 py-1 rounded font-medium"
            >
              {{ item.tagLabel }}
            </span>
            <h3
              class="text-base font-bold leading-snug text-abyssal-ink line-clamp-2 group-hover:text-digital-orange transition-colors"
              v-html="item.title"
            />
            <p class="text-sm text-abyssal-ink/60">{{ item.date }}</p>
          </div>
        </NuxtLink>
      </template>
    </SnapCarousel>
  </section>
</template>
