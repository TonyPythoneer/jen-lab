<template>
  <Slideover
    v-model:open="open"
    side="top"
    :overlay="true"
    :transition="true"
    :dismissible="true"
    :ui="{ overlay: OVERLAY_CLASS }"
  >
    <template #content="{ close }">
      <div class="w-full bg-pure-white px-6 py-5 md:px-8">
        <!-- Top row: search input (underline + magnifier) and Close on one line -->
        <div class="flex items-center gap-4">
          <div class="relative flex-1">
            <input
              ref="searchInput"
              v-model="q"
              :placeholder="props.placeholder"
              class="w-full border-0 bg-transparent py-2 pr-10 text-2xl font-medium text-abyssal-ink outline-none placeholder:text-abyssal-ink/40 md:text-3xl"
              @keyup.enter="submit"
            />
            <button
              type="button"
              class="absolute right-0 top-1/2 -translate-y-1/2 text-abyssal-ink/60 hover:text-abyssal-ink transition-colors"
              aria-label="搜尋"
              @click="submit"
            >
              <Icon name="i-lucide-search" class="size-6" />
            </button>
            <div class="absolute inset-x-0 bottom-0 h-px bg-abyssal-ink" />
          </div>
          <Button
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="關閉搜尋"
            class="rounded-button shrink-0"
            @click="close"
          />
        </div>

        <!-- Filters: 分類 + 標籤 side by side, below the input. Enter in the input submits. -->
        <div class="mt-4 flex flex-wrap gap-3">
          <BlogFilterButton
            v-model="selectedCategoryIds"
            :label="props.categoryLabel"
            :items="categoryTree"
          />
          <BlogFilterButton v-model="selectedTagIds" :label="props.tagLabel" :items="tagTree" />
        </div>
      </div>
    </template>
  </Slideover>
</template>

<script setup lang="ts">
import { useBlogSearch } from "~/composables/blog/useBlogSearch";
import { useBlogTaxonomies } from "~/composables/blog/useBlogTaxonomies";
import { buildBlogSearchRoute } from "~/utils/blog/blogSearchQuery";
import { csvToIds } from "~/utils/shared/csvToIds";

// Search-box wording comes from content/site/blogs.yml via the layout.
// Defaults keep the modal self-contained for Storybook and as a fallback.
const props = withDefaults(
  defineProps<{
    placeholder?: string;
    categoryLabel?: string;
    tagLabel?: string;
  }>(),
  {
    placeholder: "Type for blog search",
    categoryLabel: "分類",
    tagLabel: "標籤",
  },
);

// The theme's default slideover overlay (bg-elevated) is transparent in this light-only
// palette, so set an explicit gray veil over the page behind the modal.
const OVERLAY_CLASS = "bg-abyssal-ink/40";

const { open, closeSearch } = useBlogSearch();
const { categoryTree, tagTree } = useBlogTaxonomies();
const route = useRoute();

const q = ref("");
const selectedCategoryIds = ref<number[]>([]);
const selectedTagIds = ref<number[]>([]);

// Sync current active filters into local state when modal opens, then focus.
const searchInput = ref<HTMLInputElement | null>(null);
watch(open, async (isOpen) => {
  if (!isOpen) return;
  q.value = typeof route.query.q === "string" ? route.query.q : "";
  selectedCategoryIds.value = csvToIds(route.query.cat);
  selectedTagIds.value = csvToIds(route.query.tag);
  await nextTick();
  searchInput.value?.focus();
});

const router = useRouter();

async function submit() {
  await router.push(
    buildBlogSearchRoute({
      q: q.value,
      categoryIds: selectedCategoryIds.value,
      tagIds: selectedTagIds.value,
    }),
  );
  closeSearch();
}
</script>
