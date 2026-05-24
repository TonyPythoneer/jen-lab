# Homepage CMS Design

**Date:** 2026-05-24
**Status:** Approved

## Goal

Allow non-technical users (with no coding background) to control which homepage sections appear and in what order by editing a single Markdown file (`content/pages-layout/home.md`), without touching any Vue code.

## Approach

Follow the same pattern as `app/pages/jen-liu.vue`: a content file drives the page via `queryCollection`, and the page renders dynamically from the config.

A new `pagesLayout` collection is introduced at `content/pages-layout/*.md`. This path is separate from the existing `home` collection (`content/home/jen-*.md`), so there is no schema conflict.

## Data Model

**`content/pages-layout/home.md`** — the CMS entry point:

```yaml
# ===== Homepage Layout Manager =====
# How to use:
#   - Remove a section block -> that section won't appear
#   - Reorder the blocks -> homepage order follows
#   ⚠️  Do NOT change the English names after component:

sections:
  # Hero banner (recommended: keep at top)
  - component: section-hero

  # Dual-identity intro cards
  - component: section-directions

  # 3D rotating blog carousel
  - component: section-blog
    postCount: 10 # number of posts to show (5-15 recommended)
    spinDuration: 90 # rotation speed in seconds (larger = slower)

  # Email newsletter signup
  - component: section-newsletter

  # Support the author
  - component: section-support
```

Rules:

- To hide a section, delete its block (from `- component:` to the last key of that block).
- To reorder, move the block up or down.
- Unknown `component` values are silently skipped — no crash.

## Schema (`content.config.ts`)

Add five discriminated section schemas and a `pagesLayoutSchema`:

```ts
const sectionHeroSchema = z.object({ component: z.literal("section-hero") });
const sectionDirectionsSchema = z.object({ component: z.literal("section-directions") });
const sectionBlogSchema = z.object({
  component: z.literal("section-blog"),
  postCount: z.number().optional(),
  spinDuration: z.number().optional(),
});
const sectionNewsletterSchema = z.object({ component: z.literal("section-newsletter") });
const sectionSupportSchema = z.object({ component: z.literal("section-support") });

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

Add to `defineContentConfig`:

```ts
pagesLayout: defineCollection({
  type: "page",
  source: "pages-layout/*.md",
  schema: pagesLayoutSchema,
});
```

The existing `home` collection is **not changed**.

## Page (`app/pages/index.vue`)

```vue
<script setup lang="ts">
const COMPONENT_MAP = {
  "section-hero": resolveComponent("HomeSectionHero"),
  "section-directions": resolveComponent("HomeSectionDirections"),
  "section-blog": resolveComponent("HomeSectionBlog3DV2"),
  "section-newsletter": resolveComponent("HomeSectionNewsletter"),
  "section-support": resolveComponent("HomeSectionSupport"),
};

const { data: page } = useLazyAsyncData("pages-layout:home", () =>
  queryCollection("pagesLayout").path("/pages-layout/home").first(),
);

useSeoMeta({
  /* unchanged from current */
});
</script>

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

`sectionProps` strips `component` before `v-bind`:

```ts
function sectionProps(section: (typeof page.value)["sections"][number]) {
  const { component, ...props } = section;
  return props;
}
```

`resolveComponent()` is used instead of explicit imports — Nuxt's auto-import system exposes component objects this way at runtime without manual import statements.

## Files Changed

| File                           | Action                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `content.config.ts`            | Add 5 section schemas + `pagesLayoutSchema` + `pagesLayout` collection |
| `content/pages-layout/home.md` | Create — CMS entry point with English comments                         |
| `app/pages/index.vue`          | Replace static component list with dynamic rendering                   |

## Out of Scope

- Text content inside sections (hero headline, newsletter copy, etc.) — sections remain self-contained; text changes still require editing the component.
- Adding new section types — requires a developer to add a schema entry and a `COMPONENT_MAP` entry.
