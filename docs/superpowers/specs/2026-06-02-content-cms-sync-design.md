# Content ↔ UI Sync + CMS-Driven Pages — Design

- **Date**: 2026-06-02
- **Branch / Worktree**: `feat/content-cms-sync` (based on `feat/food-map`), at `.claude/worktrees/content-cms-sync`
- **Status**: Design — awaiting user review before plan/implementation

## Problem

UI components were updated ahead of the content layer, so the schema/docs/content drifted out of sync.

**Verified by native re-read (2026-06-02):** an earlier audit run on compressed file reads wrongly suspected empty/malformed content. The actual `content/home/*.md` files are fully populated and well-formed — portals have title/brief, videos have titles, both `profile.tabs` are valid lists. The _only_ real drift is **dead fields**: `product.brief` and `product.purchaseLabel` are still declared in schema/docs/content but `Product.vue` no longer renders them ("Title/brief/purchase moved off the card"; `BuyButton` uses only `purchaseUrl`).

Separately, the site should become **CMS-driven**: page copy that is currently hard-coded in Vue should move into `content/`, so a **non-technical editor** can change it. Every content surface must be understandable to a non-technical person.

## Goal

Make `content/` the single, honest, non-tech-friendly source for editable page data, fully aligned with what the UI actually renders.

## Scope

### In scope (three phases)

- **Phase 0 — Clean up existing content** (content + schema + docs only)
- **Phase 1 — Homepage `/` → CMS-driven** (copy into `pages-layout/home.md`; section components read props)
- **Phase 2 — Blog page chrome → CMS** (`/blogs`, `/blogs/[...slug]`)

### Explicitly out of scope (decided with the user)

- **All restaurant context** — the dataset `app/assets/data/pages/restaurants.ts`, the `/my-best-restaurants-search-in-sydney` page, and its page chrome. Not touched.
- **`/sydney-food-map`** page — not touched.
- **Site-global layer** (footer text, CTA label, contact links) — **left in code**. Reason: `app/config/site.ts` is the single source shared by both `app.config.ts` and Storybook (Storybook does not read Nuxt Content), so moving contacts to `content/` would break Storybook; remaining footer strings are tiny and rarely change. Low ROI.

### Notes left untouched (out of scope)

- **Food-map route inconsistency**: the food-map portal in `jen-knows.md` still points to the old `/my-best-restaurants-search-in-sydney`, while the nav uses `/sydney-food-map`. Left as-is per the "no restaurant context" scope.
- **Commented-out blocks** in `jen-knows.md` / `jen-liu.md` (parked WordPress/support/portal options) are kept — they act as ready-to-uncomment templates for the editor.
- An earlier agent flagged a restaurant category-color mismatch; on full read all 16 category IDs are defined, so it is a non-issue.

## Locked architectural decisions

1. **Homepage copy lives in `pages-layout/home.md` section blocks**, not separate per-section files.
   - **Why**: `index.vue` already spreads every non-`component` field of a section block into the section component as props (`sectionProps()`). Adding copy fields to a block flows them in automatically — near-zero `index.vue` change — and a non-tech editor sees the whole homepage (sections, order, copy) in one file, which already exists as the documented "layout manager".

2. **Do not create per-section content files or a build-time generator.** Rejected as over-engineering (simplicity-first).

3. **Restaurant dataset stays in code.** Out of scope per user.

4. **Phases 1 & 2 copy current values verbatim** — extraction must be a pure move (no rewording), so the rendered pages stay pixel-identical.

## Established patterns this follows

- `@nuxt/content` v3 collections in `content.config.ts` (zod schemas).
- Page content = markdown + YAML frontmatter (`content/home/*.md`).
- Pure data = YAML (`content/site/header.yml`).
- Non-tech editor guides = `.tmpl` files beside content (kept out of the `*.md` glob on purpose).

---

## Phase 0 — Remove dead product fields

Only the two confirmed-dead fields are removed, everywhere they appear. No copy is filled and no tabs are "fixed" — the content was already correct.

### 0.1 `content.config.ts`

- `productListSection.products`: remove `brief` and `purchaseLabel`. (`video.title` stays required — every video already has one, so there is no drift.)

### 0.2 Content

- `content/home/jen-knows.md`: drop `brief` + `purchaseLabel` from both products.
- `content/home/jen-liu.md`: drop `brief` + `purchaseLabel` from all three products.

### 0.3 Component + stories (orphans created by the schema change)

- `app/components/home/Product.vue`: drop `brief` and `purchaseLabel` from `defineProps` (they only existed to absorb the `v-bind="product"` spread; nothing renders them — no visual change).
- `app/components/home/Product.stories.ts` and `app/components/profile/Page.stories.ts`: drop the same two keys from the dev fixtures.

### 0.4 Editor doc

- `content/home/homepage.complete.tmpl`: drop `brief` / `purchaseLabel` from the product-list example and the full example. (`homepage.tmpl` has no product-field detail — untouched.)

### Phase 0 verification

- `pnpm check` (lint + format + typecheck; zod still validates both product files).
- Visual: products still render banner + info-drawer (title + description) + buy button — `brief`/`purchaseLabel` were never on screen, so removal is calculably no-op. Screenshot `/jen-knows` + `/jen-liu` to confirm cards unchanged.

---

## Phase 1 — Homepage `/` → CMS-driven

Move hard-coded copy from the 5 section components + page SEO into `content/pages-layout/home.md`. Refactor each section component to read props (values flow via existing `sectionProps()` spread).

### 1.1 `content.config.ts` — enrich the pages-layout section schemas

```ts
const sectionHeroSchema = z.object({
  component: z.literal("section-hero"),
  headline: z.string(),
  headlineEmphasis: z.string(),
  subheading: z.string(), // multi-line
  marqueeItems: z.array(z.string()),
  portraitLeft: z.object({ src: z.string(), alt: z.string() }),
  portraitRight: z.object({ src: z.string(), alt: z.string() }),
});

const directionCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  ctaLabel: z.string(),
  ctaLink: z.string(),
  heroImage: z.object({ src: z.string(), alt: z.string() }),
  colorKey: z.enum(["violet", "orange"]),
});
const sectionDirectionsSchema = z.object({
  component: z.literal("section-directions"),
  heading: z.string(),
  headingContinued: z.string(),
  cards: z.array(directionCardSchema),
});

const sectionBlogSchema = z.object({
  component: z.literal("section-blog"),
  postCount: z.number().optional(),
  spinDuration: z.number().optional(),
  heading: z.string(),
  ctaLabel: z.string(),
});

const sectionNewsletterSchema = z.object({
  component: z.literal("section-newsletter"),
  headline: z.string(),
  headlineEmphasis: z.string(),
  subheading: z.string(),
  buttonLabel: z.string(),
  subscriptionUrl: z.string(),
});

const sectionSupportSchema = z.object({
  component: z.literal("section-support"),
  heading: z.string(),
  description: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
});

// pagesLayoutSchema gains an optional homepage SEO block:
//   seo: { title, description, ogTitle, ogDescription }
```

### 1.2 `content/pages-layout/home.md` — fill with current values

Each existing section block gains its copy fields (values copied verbatim from the components so the page is pixel-identical), plus a top-level `seo:` block. Current values (file:line evidence in the homepage survey):

- **Hero**: headline `Two Worlds` / emphasis `One Jen`; subheading `從澳洲職場到雪梨巷弄\n一個人，兩個身份\n用中文記錄走過的每一步`; marquee `[Sydney-based, 職涯 × 旅遊, NextSteps Academy, 澳洲旅遊作家, Walk Like A Local, 中英雙語創作, Open for reading]`; portraits `/home/jen-knows.png`, `/home/jen-liu.png`.
- **Directions**: heading `Jen is Jen.` / continued `Jen is always me.`; 2 cards (jen-knows / violet, jen-liu / orange) with current titles/subtitles/descriptions/CTAs/hero images.
- **Blog**: heading `My Stories`; ctaLabel `閱讀全文` (keep `postCount: 10`, `spinDuration: 90`).
- **Newsletter**: headline `這是一份邀請`; emphasis `走進個人\n真實思考空間`; subheading `也寫給同樣正在努力向前的你`; buttonLabel `訂閱電子報`; subscriptionUrl `https://jen-nextsteps.kit.com/60463af80d`.
- **Support**: heading `如果這些內容對你有幫助`; description `歡迎請我喝杯奶茶——完全隨意，你的閱讀本身就是最好的支持。`; links `[支持 Jen Knows → portaly…/jenknowsau/support, 支持 Jen Liu → portaly…/jenliuau/support]`.
- **SEO**: title/description/ogTitle/ogDescription from `index.vue:20-23`.

### 1.3 Component refactors (each reads props, hard-coded strings removed)

| Component               | Change                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `SectionHero.vue`       | props: headline, headlineEmphasis, subheading, marqueeItems, portraitLeft, portraitRight                                               |
| `SectionDirections.vue` | props: heading, headingContinued, cards[]; pass each card's fields to `DirectionPair.vue`                                              |
| `DirectionPair.vue`     | unchanged contract (still receives the same fields, now from a card object)                                                            |
| `SectionBlog3D.vue`     | props: heading, ctaLabel (plus existing postCount, spinDuration)                                                                       |
| `SectionNewsletter.vue` | props: headline, headlineEmphasis, subheading, buttonLabel, subscriptionUrl                                                            |
| `SectionSupport.vue`    | prop: links[]; stop deriving from `sectionSupport.ts`. If this orphans `sectionSupport.ts`, remove it (orphan created by this change). |
| `index.vue`             | read `page.seo` → `useSeoMeta`; switch `useLazyAsyncData` → `useAsyncData` (CLAUDE.md rule, file already being edited).                |

### 1.4 Non-tech doc

- Update `homepage.tmpl` / `homepage.complete.tmpl` (or add a short section) describing the new homepage section blocks (hero/directions/newsletter/support/blog) and the `seo` block, with the usability fixes from the haiku review baked in: explain `id` uniqueness, that `headline` vs `headlineEmphasis` are two separate fields, `colorKey` is `violet`/`orange`, and that `seo` is "Google sees this, readers don't".

### Phase 1 verification

- `pnpm check`.
- **webwright** (this is a real UI change): screenshot `/` before and after; `Read` both; the homepage must look **identical** (same copy, same layout). Confirm marquee, both direction cards, newsletter, support buttons, blog carousel heading.
- Confirm the homepage route chunk did not regain a static dataset import (N/A here, but verify no console errors).

---

## Phase 2 — Blog page chrome → CMS

Blog **posts** stay on the WordPress API. Only the page chrome (titles, states, filter labels, SEO) moves to content.

### 2.1 New collection + schema (`content.config.ts`)

```ts
siteBlogs: defineCollection({
  type: "data",
  source: "site/blogs.yml",
  schema: z.object({
    listPage: z.object({
      title: z.string(),
      subtitle: z.string(),
      loadingErrorMessage: z.string(),
      loadingErrorRetryButton: z.string(),
      noResultsMessage: z.string(),
      seoTitle: z.string(),
      seoDescription: z.string(),
    }),
    detailPage: z.object({
      backLink: z.string(),
      loadingMessage: z.string(),
      notFoundMessage: z.string(),
      seoTitleTemplate: z.string(),   // uses {{title}}
    }),
    search: z.object({
      placeholder: z.string(),
      categoryLabel: z.string(),
      tagLabel: z.string(),
    }),
    postCard: z.object({
      newBadgeText: z.string(),
      newPostDaysThreshold: z.number(),
    }),
  }),
}),
```

> Note: the `site` collection is currently a single-file data collection (`source: "site/header.yml"`). Add `siteBlogs` as a **separate** collection (distinct shape) rather than globbing `site/*.yml` into one mismatched schema.

### 2.2 `content/site/blogs.yml` — filled with current values

From the blogs survey (file:line evidence there): list title `Notes From The Notebook.`, subtitle `Collected one day, one thought, one note at a time.`, error `載入失敗，請稍後再試` / retry `重新載入`, no-results `沒有找到相關文章`, SEO `Blog — Jen Lab` / `Long-form posts about what I learned the hard way.`, back `返回部落格`, loading `載入中...`, not-found `找不到文章`, detail SEO template `{{title}} | Jen Liu`, search placeholder `Type for blog search`, category `分類`, tag `標籤`, new badge `New!`, threshold `7`.

### 2.3 Component edits

Replace hard-coded strings with values from `queryCollection("siteBlogs")`:

- `pages/blogs/index.vue` (title, subtitle, error/retry/no-results, list SEO)
- `pages/blogs/[...slug].vue` (back link, loading, not-found, detail SEO template)
- `components/blog/SearchModal.vue` (placeholder, category/tag labels)
- `components/blog/PostCard.vue` (new badge text + days threshold)

### 2.4 Non-tech doc

- Add `content/site/blogs.tmpl` (plain 繁中) with the haiku-validated structure: split "讀者會看到的文字" vs "搜尋引擎才看到的 (SEO)", explain `{{title}}` placeholder with an example, and `newPostDaysThreshold`.

### Phase 2 verification

- `pnpm check`.
- **webwright**: screenshot `/blogs` (and one `/blogs/<slug>`), `Read`, confirm heading/subtitle/filter labels/empty-state render unchanged; trigger search modal to confirm placeholder + 分類/標籤 labels.

---

## Implementation order & shippability

Phases are independent and each is individually shippable. Recommended order: **0 → 1 → 2** (smallest/safest first; Phase 0 also fixes real content bugs).

Each phase: edit → `pnpm check` → webwright visual verification → commit. Implementation will start with `pnpm install` in this worktree and a clean baseline check.

## Risks

- **Phase 1 is the only visually risky change** (5 components refactored to props). Mitigation: copy current values verbatim; before/after screenshot comparison must be identical.
- `sectionSupport.ts` may become orphaned by Phase 1 → remove only if this change orphans it.
- Draft copy (`# DRAFT`) is Claude-authored; user replaces with final brand wording at any time (non-blocking).

## Non-tech understandability (haiku review takeaways, baked into all docs)

- Use human-readable values, not internal codes.
- For "copy-a-block-to-add" fields: state `id` must be unique and indentation must line up.
- Mark SEO fields as invisible to readers.
- Distinguish separate fields that look mergeable (e.g. `headline` vs `headlineEmphasis`).
