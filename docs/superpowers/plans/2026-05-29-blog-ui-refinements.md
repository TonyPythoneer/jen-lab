# Blog UI Refinements — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or execute inline. Steps use `- [ ]`.
> Spec: `docs/superpowers/specs/2026-05-29-blog-ui-refinements-design.md`. Branch: `feat/inner-pages-production`.

**Goal:** (1) restore the original blog post-card style, (2) make the search modal's input match the approved mockup and lay the 分類/標籤 selectors horizontally below it. Profile pages and the blog detail page are NOT touched.

**Tech:** Nuxt 4, Vue 3 `<script setup>`, Nuxt UI v4 (`USlideover`, `UButton`, `UIcon`), Tailwind v4 Caldera tokens.

**Conventions:** light mode only; plain-English minimal comments; no hardcoded domain strings; 2-space indent; verify visuals with webwright at `:3500` (user-run; never start/kill).

---

## Task 1: Restore the original `PostCard` style

**Files:** Modify `app/components/blog/PostCard.vue`

The original (pre-Bold-Poster) version lives on `chore/cleanup`. Restore it verbatim rather than hand-editing.

- [ ] **Step 1: Restore the file from `chore/cleanup`**

```bash
git checkout chore/cleanup -- app/components/blog/PostCard.vue
```

- [ ] **Step 2: Confirm it's byte-identical to the original**

```bash
git diff chore/cleanup -- app/components/blog/PostCard.vue
```

Expected: EMPTY output (the card now matches the original).

- [ ] **Step 3: Verify the list still type-checks and tests pass**

Run: `pnpm check` → clean. `pnpm test` → all pass.
(The list page `app/pages/blogs/index.vue` passes `post`, `to`, `tag-map` to `BlogPostCard`; the original component takes those same props, so no page change is needed. If `pnpm check` flags a prop mismatch, STOP and report — do not edit the page.)

- [ ] **Step 4: Visual check (webwright)**

Open `http://localhost:3500/blogs` → confirm the cards look like the ORIGINAL design again (no 12px frame / hard offset shadow / accent left border). Masthead + pagination unaffected.

- [ ] **Step 5: Commit**

```bash
git add app/components/blog/PostCard.vue
git commit -m "revert(blog): restore original post-card style"
```

---

## Task 2: Search modal — mockup-style input + horizontal 分類/標籤

**Files:** Modify `app/components/blog/SearchModal.vue`

Read the current `app/components/blog/SearchModal.vue` first, and the mockup `docs/superpowers/specs/assets/2026-05-29-header-search-overlay-mockup.html` for the input look. Keep ALL existing logic (`useBlogSearch`, `useBlogTaxonomies`, `buildBlogSearchRoute`, `submit()`, the `USlideover side="top"` + dim + Esc/backdrop/Close, autofocus-on-open). Only change the input's presentation and the filter row.

- [ ] **Step 1: Replace the input with the mockup look**

A large, borderless input with a 1px bottom underline and a magnifier icon at the right end:

```vue
<div class="relative">
  <input
    ref="searchInput"
    v-model="q"
    :placeholder="PLACEHOLDER"
    class="w-full bg-transparent border-0 outline-none py-3 pr-10 text-2xl md:text-3xl font-medium text-abyssal-ink placeholder:text-abyssal-ink/40"
    @keyup.enter="submit"
  />
  <UIcon
    name="i-lucide-search"
    class="absolute right-0 top-1/2 -translate-y-1/2 size-6 text-abyssal-ink/60"
  />
  <div class="absolute bottom-0 inset-x-0 h-px bg-abyssal-ink" />
</div>
```

- `PLACEHOLDER` const stays `"Type for blog search"`.
- Preserve the existing autofocus behaviour (the modal already focuses the input on open — keep whatever ref/`onMounted`/`watch(open)` mechanism is there; if it used the old input element, point it at this `searchInput` ref).

- [ ] **Step 2: Put 分類 + 標籤 in a HORIZONTAL row below the input, with visible labels**

```vue
<!-- Filters: 分類 + 標籤 side by side, below the input -->
<div class="flex flex-wrap gap-3">
  <BlogFilterButton v-model="selectedCategoryIds" label="分類" :items="categoryTree" />
  <BlogFilterButton v-model="selectedTagIds" label="標籤" :items="tagTree" />
</div>
```

IMPORTANT: do NOT pass an `icon` to `BlogFilterButton`. Per `app/components/blog/FilterButton.vue`, the label text only renders when no icon is set (`<template v-if="!icon">{{ label }}</template>`). Omitting `icon` makes the buttons show the visible "分類" / "標籤" text the user asked for. Keep `categoryTree` / `tagTree` from `useBlogTaxonomies()` and the `selectedCategoryIds` / `selectedTagIds` refs as they are.

- [ ] **Step 3: Keep the Close control + 搜尋 submit button** (unchanged from current). Layout order top→bottom: Close (top-right) → input → 分類/標籤 row → 搜尋 button.

- [ ] **Step 4: Verify type/lint + tests**

Run: `pnpm check` → clean. `pnpm test` → all pass.

- [ ] **Step 5: Visual + interaction check (webwright)**

Open `http://localhost:3500/jen-liu`, click the header magnifier:

- input is large with a bottom underline + magnifier at the right, placeholder `Type for blog search`, autofocused;
- 分類 and 標籤 buttons show their text labels and sit in ONE horizontal row below the input;
- type a term + 搜尋 (or pick a 分類) → routes to `/blogs?q=…` (and `&cat=…`) and the modal closes.

- [ ] **Step 6: Commit**

```bash
git add app/components/blog/SearchModal.vue
git commit -m "feat(blog-search): mockup-style input + horizontal 分類/標籤 filters"
```

---

## Final verification

- [ ] `pnpm check && pnpm test` → both green.
- [ ] webwright sweep: `/blogs` (original cards), header search modal (mockup input + horizontal labelled filters + submit works). Profile pages and `/blogs/:id` unchanged.
- [ ] Then `superpowers:finishing-a-development-branch` — PR base is **`chore/cleanup`**, not `main`. Do not PR/merge without the user's go-ahead.

## Self-review notes

- Task 1 restores PostCard from `chore/cleanup` (Step 2 diff must be empty) — guarantees the exact original, no guesswork. Spec decision #3 ✓.
- Task 2 changes only presentation in `SearchModal.vue`; all search logic/data flow preserved. Spec decision #2 ✓ (mockup input + horizontal labelled 分類/標籤).
- Profile pages + blog detail untouched. Spec decision #1 + out-of-scope ✓.
