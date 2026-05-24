# Homepage CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static section list in `app/pages/index.vue` with a config-driven system where a non-technical user can reorder or hide homepage sections by editing `content/pages-layout/home.md`.

**Architecture:** A new `pagesLayout` Nuxt Content collection reads `content/pages-layout/*.md`. The homepage queries this collection via `useLazyAsyncData` and renders sections dynamically using `<component :is="...">` with a `COMPONENT_MAP`. Presence in the config = section shown; absence = section hidden.

**Tech Stack:** Nuxt Content v3 (Zod schema + D1/SQLite), Vue 3 `<component :is>`, `resolveComponent`, Zod discriminated union

**Spec:** `docs/superpowers/specs/2026-05-24-homepage-cms-design.md`

---

### Task 0: Branch + Project Management Structure

**Files:**

- Create: `.claude/project-management/homepage-cms/00_overview.md`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/homepage-cms
```

- [ ] **Step 2: Create project management directory and overview**

```bash
mkdir -p .claude/project-management/homepage-cms
```

Create `.claude/project-management/homepage-cms/00_overview.md`:

```markdown
# Homepage CMS

Non-technical users control homepage section visibility and order via `content/pages-layout/home.md`.

## Tasks

- [ ] 01 — Add `pagesLayout` collection schema to `content.config.ts`
- [ ] 02 — Create `content/pages-layout/home.md`
- [ ] 03 — Update `app/pages/index.vue` to dynamic rendering
- [ ] 04 — Type-check and visual verification
```

- [ ] **Step 3: Commit PM structure**

```bash
git add .claude/project-management/homepage-cms/
git commit -m "chore: add project management structure for homepage-cms"
```

---

### Task 1: Add `pagesLayout` Collection to `content.config.ts`

**Files:**

- Modify: `content.config.ts`

- [ ] **Step 1: Add section schemas after existing schemas (line 88, after `homeSchema` closing brace)**

Open `content.config.ts`. After the `homeSchema` block (around line 88), insert:

```ts
const sectionHeroSchema = z.object({
  component: z.literal("section-hero"),
});

const sectionDirectionsSchema = z.object({
  component: z.literal("section-directions"),
});

const sectionBlogSchema = z.object({
  component: z.literal("section-blog"),
  postCount: z.number().optional(),
  spinDuration: z.number().optional(),
});

const sectionNewsletterSchema = z.object({
  component: z.literal("section-newsletter"),
});

const sectionSupportSchema = z.object({
  component: z.literal("section-support"),
});

const pagesLayoutSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("component", [
      sectionHeroSchema,
      sectionDirectionsSchema,
      sectionBlogSchema,
      sectionNewsletterSchema,
      sectionSupportSchema,
    ]),
  ),
});
```

- [ ] **Step 2: Add `pagesLayout` collection inside `defineContentConfig`**

In the `collections` object (around line 112), add after `home: defineCollection(...)`:

```ts
pagesLayout: defineCollection({
  type: "page",
  source: "pages-layout/*.md",
  schema: pagesLayoutSchema,
}),
```

- [ ] **Step 3: Run type-check to confirm no schema errors**

```bash
vp check
```

Expected: no errors related to `content.config.ts` or zod types.

- [ ] **Step 4: Commit**

```bash
git add content.config.ts
git commit -m "feat(cms): add pagesLayout collection schema to content.config.ts"
```

Update `.claude/project-management/homepage-cms/00_overview.md`: mark task 01 done.

---

### Task 2: Create `content/pages-layout/home.md`

**Files:**

- Create: `content/pages-layout/home.md`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p content/pages-layout
```

Create `content/pages-layout/home.md` with this exact content:

```markdown
---
# ===== Homepage Layout Manager =====
# How to use:
#   - Remove a section block -> that section will not appear on the homepage
#   - Reorder the blocks -> homepage order follows
#   WARNING: Do NOT change the English names after "component:"

sections:
  # Hero banner (recommended: keep at top)
  - component: section-hero

  # Dual-identity intro cards
  - component: section-directions

  # 3D rotating blog carousel
  - component: section-blog
    postCount: 10
    spinDuration: 90

  # Email newsletter signup
  - component: section-newsletter

  # Support the author
  - component: section-support
---
```

- [ ] **Step 2: Verify Nuxt Content can parse the file**

```bash
pnpm dev
```

Wait for "Nuxt ready" then open http://localhost:3500 in a browser — page should still load (we haven't changed the Vue page yet, sections still render statically). Check terminal for any content parse errors mentioning `pages-layout/home.md`.

- [ ] **Step 3: Commit**

```bash
git add content/pages-layout/home.md
git commit -m "feat(cms): add content/pages-layout/home.md as homepage layout config"
```

Update `.claude/project-management/homepage-cms/00_overview.md`: mark task 02 done.

---

### Task 3: Update `app/pages/index.vue` to Dynamic Rendering

**Files:**

- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace `<script setup>` block**

Replace the entire `<script setup lang="ts">` block in `app/pages/index.vue` with:

```vue
<script setup lang="ts">
const COMPONENT_MAP: Record<string, ReturnType<typeof resolveComponent>> = {
  "section-hero": resolveComponent("HomeSectionHero"),
  "section-directions": resolveComponent("HomeSectionDirections"),
  "section-blog": resolveComponent("HomeSectionBlog3DV2"),
  "section-newsletter": resolveComponent("HomeSectionNewsletter"),
  "section-support": resolveComponent("HomeSectionSupport"),
};

const { data: page } = useLazyAsyncData("pages-layout:home", () =>
  queryCollection("pagesLayout").path("/pages-layout/home").first(),
);

function sectionProps(section: { component: string; [key: string]: unknown }) {
  const { component, ...props } = section;
  return props;
}

useSeoMeta({
  title: "榛知 — 職涯 × 旅遊，從雪梨出發",
  description: "榛知 Jen：澳洲職涯顧問 × 旅遊作家。兩個身份，一個在雪梨的真實故事。",
  ogTitle: "榛知 — 職涯 × 旅遊，從雪梨出發",
  ogDescription: "澳洲職涯顧問 × 旅遊作家。探索 Jen Knows 職場資源，或跟著 Jen Liu 走訪澳洲。",
  ogType: "website",
});
</script>
```

- [ ] **Step 2: Replace `<template>` block**

Replace the entire `<template>` block with:

```vue
<template>
  <SitePageContainer breakout>
    <template v-if="page">
      <component
        v-for="section in page.sections"
        :key="section.component"
        :is="COMPONENT_MAP[section.component]"
        v-bind="sectionProps(section)"
      />
    </template>
  </SitePageContainer>
</template>
```

- [ ] **Step 3: Run type-check**

```bash
vp check
```

Expected: passes with no errors in `app/pages/index.vue`.

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(cms): drive homepage sections from pagesLayout content collection"
```

Update `.claude/project-management/homepage-cms/00_overview.md`: mark task 03 done.

---

### Task 4: Visual Verification

**Files:** none (read-only verification)

- [ ] **Step 1: Take a baseline screenshot of the homepage**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:3500', { waitUntil: 'networkidle' });
  await p.screenshot({ path: '/tmp/homepage-cms-after.png', fullPage: true });
  await b.close();
})();
"
```

Read `/tmp/homepage-cms-after.png` and confirm all 5 sections render in the correct order: Hero → Directions → Blog carousel → Newsletter → Support.

- [ ] **Step 2: Test hiding a section — remove `section-newsletter` from `home.md`**

Edit `content/pages-layout/home.md`: delete the `- component: section-newsletter` block. Save and wait for Nuxt HMR.

Take another screenshot:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:3500', { waitUntil: 'networkidle' });
  await p.screenshot({ path: '/tmp/homepage-cms-hidden.png', fullPage: true });
  await b.close();
})();
"
```

Read `/tmp/homepage-cms-hidden.png` and confirm Newsletter section is gone.

- [ ] **Step 3: Restore `section-newsletter` and test reordering**

Restore the newsletter block in `home.md`. Then move `section-support` to appear before `section-newsletter`. Save and screenshot:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:3500', { waitUntil: 'networkidle' });
  await p.screenshot({ path: '/tmp/homepage-cms-reordered.png', fullPage: true });
  await b.close();
})();
"
```

Read `/tmp/homepage-cms-reordered.png` and confirm Support appears before Newsletter.

- [ ] **Step 4: Restore `home.md` to original order**

Restore `content/pages-layout/home.md` to the original 5-section order (hero → directions → blog → newsletter → support).

- [ ] **Step 5: Final commit and cleanup**

```bash
git add content/pages-layout/home.md
git commit -m "chore: restore homepage layout to original section order after verification"
```

Delete project management files:

```bash
rm -rf .claude/project-management/homepage-cms/
git add .claude/project-management/
git commit -m "chore: remove homepage-cms project management files"
```

Update `.claude/project-management/homepage-cms/00_overview.md`: mark task 04 done.

---

## Self-Review Checklist

**Spec coverage:**

- ✅ New `pagesLayout` collection → Task 1
- ✅ `content/pages-layout/home.md` with English comments → Task 2
- ✅ `index.vue` dynamic rendering via `queryCollection` → Task 3
- ✅ `home` collection unchanged → Task 1 (no modification to existing collection)
- ✅ Visual verification of hide + reorder → Task 4

**Placeholder scan:** No TBD, no "add validation", all steps have exact code.

**Type consistency:**

- `COMPONENT_MAP` defined in Task 3 Step 1, used in Task 3 Step 2 template
- `sectionProps` defined in Task 3 Step 1, used in Task 3 Step 2 `v-bind`
- `pagesLayoutSchema` defined in Task 1, registered as `pagesLayout` collection, queried as `queryCollection("pagesLayout")` in Task 3 — consistent
- `resolveComponent("HomeSectionBlog3DV2")` → matches filename `app/components/home/SectionBlog3DV2.vue` → consistent
