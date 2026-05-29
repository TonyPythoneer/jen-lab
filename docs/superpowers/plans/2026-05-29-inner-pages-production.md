# Inner Pages Production Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the profile pages (`/jen-liu`, `/jen-knows`) and blog pages (`/blogs`, `/blogs/[...slug]`) to a production-level "Bold Poster" look, and move blog search into a header-triggered slide-down modal.

**Architecture:** Restyle the shared `ProfilePage` + blog components in the locked "Bold Poster" Caldera language. Replace the in-page blog search bar with a global header magnifier icon that opens a Nuxt UI `UModal` (text + 分類 + 標籤); submitting routes to `/blogs?q=&cat=&tag=`, which the existing `useBlogList(route.query)` already consumes — so the data flow is untouched. The URL is the hand-off channel; no shared search state needed for results.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Nuxt UI v4 (`UModal`/`UButton`/`UInput`/`UPageHeader`/`UPagination`), Tailwind v4 with Caldera tokens, Vitest.

**Spec:** `docs/superpowers/specs/2026-05-29-inner-pages-production-design.md`. Visual references (open via `python3 -m http.server` in the dir): `docs/superpowers/specs/assets/2026-05-29-bold-poster-profile-mockup.html`, `2026-05-29-bold-poster-blog-list-mockup.html`, `2026-05-29-bold-poster-blog-detail-mockup.html`, `2026-05-29-header-search-overlay-mockup.html`.

**Conventions (from CLAUDE.md):** light mode only; `useLazyAsyncData`; plain-English comments; no hardcoded domain strings in templates (use `<script setup>` consts); 2-space indent. **Verify every visual change with webwright** (`/webwright:run`) against the running dev server at `:3500` — never start/kill it. Do not modify header/footer styling beyond the one authorized search-icon addition.

---

## File Structure

**Profile group**

- Modify `app/components/home/SectionSupport.vue` — add optional `brand` prop to render only one support button.
- Modify `app/components/profile/Page.vue` — Bold Poster restyle; remove the two hero CTAs; append `<HomeSectionSupport :brand>` before the page footer.
- Modify `app/pages/jen-liu.vue`, `app/pages/jen-knows.vue` — pass `brand`; drop now-unused subscribe/support props.

**Blog-search group**

- Create `app/composables/useBlogTaxonomies.ts` — lazy client-only categories/tags loader (shared).
- Create `app/composables/useBlogSearch.ts` — shared open/close state for the modal.
- Create `app/utils/blogSearchQuery.ts` — pure helper: build the `/blogs` route object from `{ q, categoryIds, tagIds }`.
- Create `app/components/blog/SearchModal.vue` — the slide-down `UModal` (text + 分類 + 標籤 + submit).
- Modify `app/components/site/Header.vue` — add the magnifier icon button (before "Get in Touch") that opens the modal.
- Modify `app/layouts/default.vue` — render `<BlogSearchModal />` once, globally.

**Blog-pages group**

- Modify `app/components/blog/PostCard.vue` — Bold Poster card.
- Modify `app/pages/blogs/index.vue` — Bold Poster masthead/grid; remove the in-page `BlogTopBar` search; keep the data layer + pagination.
- Modify `app/pages/blogs/[...slug].vue` — Bold Poster detail.
- Delete `app/components/blog/TopBar.vue` if nothing else references it after the index change (verify with grep first).

---

## Group A — Profile pages

### Task A1: `SectionSupport` brand prop

**Files:**

- Modify: `app/components/home/SectionSupport.vue`
- Test: `app/components/home/SectionSupport.nuxt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/components/home/SectionSupport.nuxt.test.ts
import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import SectionSupport from "./SectionSupport.vue";

describe("SectionSupport brand prop", () => {
  it("shows both buttons when no brand is set", async () => {
    const w = await mountSuspended(SectionSupport);
    expect(w.text()).toContain("支持 Jen Knows");
    expect(w.text()).toContain("支持 Jen Liu");
  });

  it("shows only Jen Liu when brand=jen-liu", async () => {
    const w = await mountSuspended(SectionSupport, { props: { brand: "jen-liu" } });
    expect(w.text()).toContain("支持 Jen Liu");
    expect(w.text()).not.toContain("支持 Jen Knows");
  });

  it("shows only Jen Knows when brand=jen-knows", async () => {
    const w = await mountSuspended(SectionSupport, { props: { brand: "jen-knows" } });
    expect(w.text()).toContain("支持 Jen Knows");
    expect(w.text()).not.toContain("支持 Jen Liu");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- SectionSupport`
Expected: FAIL (brand prop not implemented; both buttons always render).

- [ ] **Step 3: Implement the prop**

Add a `brand` prop and gate each button. Each support entry already has a fixed URL/label; turn them into a small list and filter by `brand`.

```vue
<script setup lang="ts">
type Brand = "jen-liu" | "jen-knows";
const props = defineProps<{ brand?: Brand }>();

const SUPPORTS = [
  { brand: "jen-knows", label: "支持 Jen Knows", url: "https://portaly.cc/jenknowsau/support" },
  { brand: "jen-liu", label: "支持 Jen Liu", url: "https://portaly.cc/jenliuau/support" },
] as const;

const visibleSupports = computed(() =>
  props.brand ? SUPPORTS.filter((s) => s.brand === props.brand) : SUPPORTS,
);
</script>
```

Replace the two hard-coded `<UButton>`s with a `v-for` over `visibleSupports` (keep the existing classes/icon):

```vue
<UButton
  v-for="s in visibleSupports"
  :key="s.brand"
  as="a"
  :href="s.url"
  target="_blank"
  rel="noopener"
  color="neutral"
  variant="outline"
  size="md"
  :ui="{ base: 'rounded-button' }"
  icon="fluent-emoji-high-contrast:bubble-tea"
>
  {{ s.label }}
</UButton>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- SectionSupport`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/home/SectionSupport.vue app/components/home/SectionSupport.nuxt.test.ts
git commit -m "feat(support): add brand prop to SectionSupport"
```

### Task A2: Restyle `ProfilePage`, remove hero CTAs, append support section

**Files:**

- Modify: `app/components/profile/Page.vue`

- [ ] **Step 1: Remove the two hero CTA buttons**

Delete the `<div class="flex flex-wrap gap-3">…</div>` block containing the `訂閱電子報` and `請我喝奶茶` `<UButton>`s (lines ~40–66) and the now-unused `subscribeUrl`/`supportUrl` props + `SUBSCRIBE_LABEL`/`SUPPORT_LABEL` consts. The newsletter is NOT re-placed (per spec).

- [ ] **Step 2: Add `brand` prop and append the support section**

In `<script setup>`:

```ts
const props = defineProps<{
  page: Collections["home"];
  displayName: string;
  brand: "jen-liu" | "jen-knows";
}>();
```

At the END of the root `<div class="flex flex-col gap-12">`, after the sections `v-for`, add:

```vue
<!-- Support: bubble-tea section, brand-specific, sits before the page footer -->
<HomeSectionSupport :brand="props.brand" />
```

- [ ] **Step 3: Apply Bold Poster styling**

Match `assets/2026-05-29-bold-poster-profile-mockup.html`. Concretely:

- Hero name `<h1>`: keep `font-display` uppercase but push to poster scale — `text-7xl sm:text-9xl`, `leading-[0.9]`, `tracking-[0.03em]`; on `sm+` allow it to dominate (it already does).
- Section headings `<h2>`: `font-display uppercase text-4xl sm:text-5xl leading-[0.9] tracking-[0.02em]` (already close — keep).
- Product cards (`HomeProduct`) and portal grid: add the Bold Poster accent — a hard left border stripe. Since `HomeProduct`/`HomePortal` are shared, do NOT restyle them globally here; instead wrap the product/portal grids' section in the accent treatment via the section container only if it does not change the homepage. **If `HomeProduct`/`HomePortal` are reused on the homepage, leave them as-is and limit Bold Poster accents to the ProfilePage-level layout (heading scale + spacing rhythm: `gap-12` between sections, generous).** Note this constraint in the commit body.
- Keep all existing config-path bindings; no hardcoded strings.

- [ ] **Step 4: Visual verification (webwright)**

Run `/webwright:run` → navigate to `http://localhost:3500/jen-liu`, screenshot. Confirm: no hero CTAs; poster-scale name; support (bubble-tea) section appears near the bottom with only **支持 Jen Liu**. Repeat for `/jen-knows` → only **支持 Jen Knows**.
Expected: matches the profile mockup; brand-correct support button.

- [ ] **Step 5: Commit**

```bash
git add app/components/profile/Page.vue
git commit -m "feat(profile): Bold Poster restyle, drop hero CTAs, add brand support section"
```

### Task A3: Update the two profile pages

**Files:**

- Modify: `app/pages/jen-liu.vue`, `app/pages/jen-knows.vue`

- [ ] **Step 1: Pass `brand`, drop unused props**

`jen-liu.vue` — remove `SUBSCRIBE_URL`/`SUPPORT_URL` consts and the `:subscribe-url`/`:support-url` bindings; pass `brand`:

```vue
<ProfilePage v-if="page" :page="page" :display-name="DISPLAY_NAME" brand="jen-liu" />
```

`jen-knows.vue` — same, with `brand="jen-knows"`. Keep `DISPLAY_NAME`, `HEAD_TITLE`, the `useLazyAsyncData` call, and SEO meta untouched.

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: no type errors (ProfilePage no longer requires subscribe/support URLs).

- [ ] **Step 3: Commit**

```bash
git add app/pages/jen-liu.vue app/pages/jen-knows.vue
git commit -m "feat(profile): wire brand prop, remove unused CTA URLs"
```

---

## Group B — Blog search (header → modal → URL)

### Task B1: Pure query-builder helper

**Files:**

- Create: `app/utils/blogSearchQuery.ts`
- Test: `app/utils/blogSearchQuery.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/utils/blogSearchQuery.test.ts
import { describe, it, expect } from "vitest";
import { buildBlogSearchRoute } from "./blogSearchQuery";

describe("buildBlogSearchRoute", () => {
  it("builds a bare /blogs route when empty", () => {
    expect(buildBlogSearchRoute({ q: "", categoryIds: [], tagIds: [] })).toEqual({
      path: "/blogs",
      query: {},
    });
  });
  it("includes q, cat, tag when present", () => {
    expect(buildBlogSearchRoute({ q: "雪梨", categoryIds: [3, 5], tagIds: [9] })).toEqual({
      path: "/blogs",
      query: { q: "雪梨", cat: "3,5", tag: "9" },
    });
  });
  it("trims whitespace-only q to empty", () => {
    expect(buildBlogSearchRoute({ q: "   ", categoryIds: [], tagIds: [] })).toEqual({
      path: "/blogs",
      query: {},
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- blogSearchQuery`
Expected: FAIL ("buildBlogSearchRoute is not a function").

- [ ] **Step 3: Implement**

```ts
// app/utils/blogSearchQuery.ts
// Builds the /blogs route the blog list page already reads (q / cat / tag).
export function buildBlogSearchRoute(input: {
  q: string;
  categoryIds: number[];
  tagIds: number[];
}) {
  const query: Record<string, string> = {};
  const q = input.q.trim();
  if (q) query.q = q;
  if (input.categoryIds.length) query.cat = input.categoryIds.join(",");
  if (input.tagIds.length) query.tag = input.tagIds.join(",");
  return { path: "/blogs", query };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- blogSearchQuery`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/utils/blogSearchQuery.ts app/utils/blogSearchQuery.test.ts
git commit -m "feat(blog-search): pure /blogs route builder"
```

### Task B2: Taxonomy + open-state composables

**Files:**

- Create: `app/composables/useBlogTaxonomies.ts`
- Create: `app/composables/useBlogSearch.ts`

- [ ] **Step 1: Implement `useBlogTaxonomies`**

Extract the taxonomy loading that currently lives in `blogs/index.vue` so the modal (and page) share it. Client-only, lazy, cached.

```ts
// app/composables/useBlogTaxonomies.ts
// Categories + tags from content collections (synced via `pnpm sync:wp`).
// Client-only to keep them off the SSR/hydration critical path.
export function useBlogTaxonomies() {
  const cached = (key: string, app: ReturnType<typeof useNuxtApp>) =>
    app.payload.data[key] ?? app.static.data[key];

  const { data: categories } = useLazyAsyncData(
    "wp-categories",
    () => queryCollection("wpCategories").order("wpId", "DESC").all(),
    { server: false, getCachedData: cached },
  );
  const { data: tags } = useLazyAsyncData(
    "wp-tags",
    () => queryCollection("wpTags").order("count", "DESC").order("wpId", "DESC").all(),
    { server: false, getCachedData: cached },
  );

  const ready = computed(() => !!categories.value && !!tags.value);
  const categoryTree = computed(() =>
    (categories.value ?? []).map((c) => ({
      label: c.name,
      value: c.wpId,
      children: c.children?.map((ch) => ({ label: ch.name, value: ch.wpId })),
    })),
  );
  const tagTree = computed(() => (tags.value ?? []).map((t) => ({ label: t.name, value: t.wpId })));
  return { categories, tags, ready, categoryTree, tagTree };
}
```

- [ ] **Step 2: Implement `useBlogSearch` (shared open state)**

```ts
// app/composables/useBlogSearch.ts
// Shared open/close flag so the header icon and the global modal stay in sync.
export function useBlogSearch() {
  const open = useState("blog-search-open", () => false);
  return {
    open,
    openSearch: () => (open.value = true),
    closeSearch: () => (open.value = false),
  };
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/composables/useBlogTaxonomies.ts app/composables/useBlogSearch.ts
git commit -m "feat(blog-search): taxonomy + open-state composables"
```

### Task B3: `BlogSearchModal` component

**Files:**

- Create: `app/components/blog/SearchModal.vue`

- [ ] **Step 1: Build the modal**

Use Nuxt UI `UModal` (handles focus trap, Esc, scroll-lock, backdrop pointer-events — avoids the hand-rolled scrim bug noted in the spec). Vertical stack: text input → 分類 → 標籤 → submit. Reuse `BlogFilterButton` for 分類/標籤. On submit, route via the B1 helper and close.

```vue
<script setup lang="ts">
import { buildBlogSearchRoute } from "~/utils/blogSearchQuery";

const PLACEHOLDER = "Type for blog search";
const { open, closeSearch } = useBlogSearch();
const { categoryTree, tagTree } = useBlogTaxonomies();

const q = ref("");
const selectedCategoryIds = ref<number[]>([]);
const selectedTagIds = ref<number[]>([]);

async function submit() {
  await navigateTo(
    buildBlogSearchRoute({
      q: q.value,
      categoryIds: selectedCategoryIds.value,
      tagIds: selectedTagIds.value,
    }),
  );
  closeSearch();
}
</script>

<template>
  <!-- Top slide-down sheet; UModal manages backdrop dim + a11y -->
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-3xl' }">
    <template #content>
      <div class="bg-pure-white rounded-card p-8 md:p-10 flex flex-col gap-6">
        <div class="flex justify-end">
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="closeSearch">
            Close
          </UButton>
        </div>

        <!-- Text query -->
        <UInput
          v-model="q"
          :placeholder="PLACEHOLDER"
          size="xl"
          variant="none"
          autofocus
          icon="i-lucide-search"
          trailing
          class="text-2xl border-b border-abyssal-ink"
          @keyup.enter="submit"
        />

        <!-- Filters: stacked vertically under the input -->
        <div class="flex flex-col gap-3">
          <BlogFilterButton
            v-model="selectedCategoryIds"
            label="分類"
            icon="i-lucide-folder"
            :items="categoryTree"
          />
          <BlogFilterButton
            v-model="selectedTagIds"
            label="標籤"
            icon="i-lucide-tag"
            :items="tagTree"
          />
        </div>

        <div class="flex justify-end">
          <UButton color="primary" :ui="{ base: 'rounded-button' }" @click="submit">搜尋</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
```

> Note: if `UModal`'s default centered transition does not read as "slide down from top," pass a top-anchored `:ui` transition class or use Nuxt UI's slideover with `side="top"`. Decide during implementation by comparing to `assets/2026-05-29-header-search-overlay-mockup.html`.

- [ ] **Step 2: Verify `BlogFilterButton`'s prop shape**

Read `app/components/blog/FilterButton.vue` and confirm it accepts `v-model` (number[]), `label`, `icon`, `items` (the `categoryTree`/`tagTree` shape from `useBlogTaxonomies`). Adjust bindings to match its real API. (It is already used this way in `blogs/index.vue`.)

- [ ] **Step 3: Commit**

```bash
git add app/components/blog/SearchModal.vue
git commit -m "feat(blog-search): UModal search overlay with text + 分類/標籤"
```

### Task B4: Header trigger + global mount

**Files:**

- Modify: `app/components/site/Header.vue`
- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Add the magnifier button in the header right group (before "Get in Touch")**

In `Header.vue`, inside `<!-- Socials + CTA + burger -->` `<div class="flex items-center gap-2 shrink-0">`, BEFORE the `Get in Touch` anchor:

```vue
<!-- Blog search: opens the global search modal -->
<UButton
  color="neutral"
  variant="ghost"
  icon="i-lucide-search"
  aria-label="搜尋文章"
  class="rounded-button"
  :class="scrolled ? 'size-8' : 'size-10'"
  @click="openSearch"
/>
```

Add to `<script setup>`: `const { openSearch } = useBlogSearch();`. Do NOT change any other header styling (authorized addition only).

- [ ] **Step 2: Mount the modal globally**

In `app/layouts/default.vue`, render `<BlogSearchModal />` once (it is inert until `open` is true). Place it as a sibling of the header/page content.

- [ ] **Step 3: Visual + interaction verification (webwright)**

Run `/webwright:run` → `http://localhost:3500/` → confirm a magnifier sits before "Get in Touch". Click it → modal opens with the dim backdrop, input autofocused, placeholder "Type for blog search", 分類 + 標籤 stacked below. Type a term, press Enter → lands on `/blogs?q=…` with results. Press the icon again, pick a 分類, 搜尋 → `/blogs?cat=…`. Esc / backdrop closes it.
Expected: all interactions work; URL reflects the query; blog list shows filtered results.

- [ ] **Step 4: Commit**

```bash
git add app/components/site/Header.vue app/layouts/default.vue
git commit -m "feat(blog-search): header magnifier opens global search modal"
```

---

## Group C — Blog pages (Bold Poster)

### Task C1: Restyle `PostCard`

**Files:**

- Modify: `app/components/blog/PostCard.vue`

- [ ] **Step 1: Apply Bold Poster card styling**

Match `assets/2026-05-29-bold-poster-blog-list-mockup.html`. Concretely, on the card root + image:

- Card: `bg-ash-white rounded-card overflow-hidden border-l-[12px] border-digital-orange` (alternate `border-cyber-violet` on even cards via the parent passing an `accent` prop or `:class`).
- Image: framed look — wrap in a relative container with `aspect-[4/3]`, the `<img>` `object-cover`, plus an absolutely-positioned frame `border-[12px] border-ash-white` with a hard offset shadow `shadow-[6px_6px_0_rgba(7,6,7,0.8)]`.
- Category badge: `text-xs font-semibold uppercase tracking-[0.04em] text-digital-orange`.
- Title: `font-semibold text-lg leading-snug`; date: `text-sm text-abyssal-ink/60`; excerpt: 2-line clamp.

Keep the existing props (`post`, `to`, `tag-map`) and bindings; do not change the data contract. No hardcoded domain strings.

- [ ] **Step 2: Visual verification (webwright)**

Run `/webwright:run` → `http://localhost:3500/blogs` → screenshot a card. Confirm framed image + accent left border + badge.

- [ ] **Step 3: Commit**

```bash
git add app/components/blog/PostCard.vue
git commit -m "feat(blog): Bold Poster post card"
```

### Task C2: Restyle blog index, remove in-page search bar

**Files:**

- Modify: `app/pages/blogs/index.vue`
- (Delete after grep) `app/components/blog/TopBar.vue`

- [ ] **Step 1: Remove the in-page search UI**

Delete the `<BlogTopBar>…</BlogTopBar>` block and the `searchOpen`/filter-bar template bits. KEEP everything that drives data: `useBlogList(initialQuery)`, the posts `useLazyAsyncData`, taxonomy refs (or switch to `useBlogTaxonomies()` for DRY), `tagMap`, pagination, URL sync. The page still reads `q`/`cat`/`tag`/`page` from the URL — that is how the header modal's results arrive.

- [ ] **Step 2: Bold Poster masthead + grid**

Keep `UPageHeader` for the masthead (`title="Notes From The Notebook."`) but push it to poster scale via `:ui="{ title: 'font-display uppercase text-6xl sm:text-8xl leading-[0.9] tracking-[0.03em]' }"`. Keep the existing posts grid (`grid grid-cols-1 md:grid-cols-2 gap-6`) and `BlogPostCard` loop, the skeleton/error/empty states, and `<UPagination>` unchanged.

- [ ] **Step 3: DRY the taxonomy code (optional but preferred)**

Replace the inline `wp-categories`/`wp-tags` `useLazyAsyncData` blocks with `const { tagTree, categoryTree, tags } = useBlogTaxonomies()` and derive `tagMap` from `tags`. (The page only needs `tagMap` for cards now that filters moved to the modal; drop `categoryTree`/`tagTree` here if unused.)

- [ ] **Step 4: Remove the now-orphan component**

Run: `rg "BlogTopBar|blog/TopBar" app/` — if `blogs/index.vue` was the only user, delete `app/components/blog/TopBar.vue`. If anything else references it, leave it.

- [ ] **Step 5: Visual + interaction verification (webwright)**

Run `/webwright:run` → `http://localhost:3500/blogs` → confirm: poster masthead, 2-col Bold Poster cards, pagination works, NO in-page search bar. Then `http://localhost:3500/blogs?q=雪梨` directly → confirm it still filters from the URL.

- [ ] **Step 6: Commit**

```bash
git add app/pages/blogs/index.vue
git rm app/components/blog/TopBar.vue  # only if grep showed no other references
git commit -m "feat(blog): Bold Poster list, move search to header modal"
```

### Task C3: Restyle blog detail

**Files:**

- Modify: `app/pages/blogs/[...slug].vue`

- [ ] **Step 1: Apply Bold Poster detail styling**

Match `assets/2026-05-29-bold-poster-blog-detail-mockup.html`. Keep the existing data flow (`fetchPost`, `useLazyAsyncData`, SEO meta, `lastQuery` back-link). Concretely:

- Title `UPageHeader`: poster scale `font-display text-5xl md:text-7xl leading-[0.95] tracking-[0.02em]` (uppercase optional for Latin; keep readable for CJK).
- Date pill: keep the existing rounded-full chip.
- Featured image: framed hard — `rounded-card` → swap to the Bold Poster hard frame (`border-[12px] border-ash-white shadow-[6px_6px_0_rgba(7,6,7,0.8)]`, `aspect-video object-cover`).
- Keep the `.wp-content` prose block + its `:deep()` rules unchanged (long-form readability stays calm per spec).

- [ ] **Step 2: Visual verification (webwright)**

Run `/webwright:run` → open a real post (e.g. from `/blogs`, click a card) → screenshot. Confirm poster title, framed featured image, readable article body.

- [ ] **Step 3: Commit**

```bash
git add "app/pages/blogs/[...slug].vue"
git commit -m "feat(blog): Bold Poster post detail"
```

---

## Final verification

- [ ] **Run full checks**

Run: `pnpm check && pnpm test`
Expected: lint/format/typecheck clean; all unit tests pass.

- [ ] **Full visual sweep (webwright)**

Verify each route at `:3500`: `/jen-liu`, `/jen-knows` (brand-correct support, no hero CTAs), `/blogs` (poster list, header search), a `/blogs/[id]` post (poster detail). Confirm header/footer styling is otherwise unchanged and light-mode only.

- [ ] **Finish the branch**

Use `superpowers:finishing-a-development-branch` (PR or merge per user choice). Do not commit/PR without the user's go-ahead.

---

## Self-review notes

- **Spec coverage:** Profile restyle + CTA removal + brand support (A1–A3) ✓; header magnifier → modal with text+分類+標籤 → `/blogs?q=&cat=&tag=` (B1–B4) ✓; data flow preserved (URL-driven, B1/Task C2 keep `useBlogList`) ✓; blog list + detail Bold Poster (C1–C3) ✓; "no in-page search bar" (C2) ✓; header-only authorized change (B4) ✓; UModal avoids the pointer-events scrim bug (B3) ✓; newsletter not re-placed (A2) ✓; per-brand support (A1) ✓.
- **Type consistency:** `buildBlogSearchRoute({ q, categoryIds, tagIds })` used identically in B1 and B3; `useBlogSearch()` exposes `open`/`openSearch`/`closeSearch` used in B3/B4; `useBlogTaxonomies()` exposes `categoryTree`/`tagTree`/`tags` used in B3/C2.
- **Open risk flagged inline:** UModal top-slide transition (B3 Step 1 note) and `BlogFilterButton` real prop API (B3 Step 2) are verify-during-implementation items, not placeholders.
