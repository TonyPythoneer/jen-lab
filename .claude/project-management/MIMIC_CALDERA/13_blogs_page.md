# 13 — Blogs Page (Caldera-styled `/blogs`)

Nav has a `Blogs` link. After this task it routes to a dedicated list page (`/blogs`) and, if Jen restores posts, a detail page (`/blogs/[...slug]`) — both Caldera-styled.

## Goals

- Restore `app/pages/blogs/index.vue` and `app/pages/blogs/[...slug].vue` from `app/pages_backup/blogs/` as starting skeleton, then restyle with Nuxt UI v4 primitives + Caldera tokens. Do not blindly copy — read the backup first, keep the data-fetching logic, replace the markup.
- `useSeoMeta({ title: 'Blog — Jen Lab', description: '...' })` on list, dynamic on slug.

## Step 1 — read backup

Before writing anything new:

```bash
cat app/pages_backup/blogs/index.vue
cat app/pages_backup/blogs/[...slug].vue
```

Identify:

- Which `@nuxt/content` collection the original queries (if any).
- Whether the schema needs reviving in `content.config.ts`.
- Any helpers / composables the backup depends on (likely none, but check).

If the blogs collection schema was also deleted, restore it from `app/pages_backup/` companion files OR define a minimal one (title, date, description, image) that matches the placeholder posts used in landing task 09.

## Step 2 — list page composition

```
Layout (default)
  └── container max-w-[1200px] space-y-10 px-4 py-10
      ├── UPageHeader title "Notes From The Notebook." description short tagline
      ├── (optional) UPageAside filter chips for tags
      └── UBlogPosts
           └── UBlogPost  (× N from collection)
                - title, date, description, image
                - card style: rounded-card Ash White, padding 6, hover scale-[1.01]
```

If collection is empty, render 5 placeholder posts identical to landing task 09, with a top banner `<UBanner color="warning">Blog collection not seeded — showing placeholders.</UBanner>` so Jen knows.

## Step 3 — detail page composition

```
Layout (default)
  └── container max-w-[800px] mx-auto space-y-10 px-4 py-10
      ├── UPageHeader
      │     - eyebrow date pill (Pixel Glare)
      │     - title (font-display)
      │     - description
      └── ContentRenderer (from @nuxt/content) inside a <article class="prose">
            - rounded-card Ash White wrapper, padding 10
```

## Files touched

- New (restore + restyle): `app/pages/blogs/index.vue`, `app/pages/blogs/[...slug].vue`.
- Possibly edit: `content.config.ts` (restore blog collection schema if absent).
- No new components — reuse `UBlogPosts`, `UBlogPost`, `UBanner`, `UPageHeader`, `HomeGlyphSvg`.

## Verification

- `pnpm dev` → `/blogs` renders, no console error.
- If collection seeded: real post titles. If empty: 5 placeholders + warning banner.
- Nav `Blogs` link routes correctly.
- A sample slug page renders prose content inside a rounded card.

## Out of scope

- Pagination — defer until post count > 12.
- Tag filtering UI — placeholder column shown but no real filter logic.
- RSS / Atom feed — separate concern.
