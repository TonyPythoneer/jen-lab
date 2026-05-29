# Blog UI Refinements — Design Spec

> **Status: ready to implement (next session).** Supersedes the BLOG portions of
> `2026-05-29-inner-pages-production-design.md`. The profile work in that spec is DONE and unchanged.
> Written 2026-05-29 because the session ran out of tokens — no code yet.

## Context — what is already shipped on `feat/inner-pages-production`

Branch `feat/inner-pages-production` (based on `chore/cleanup`, NOT `main` — `main` is ~159 commits stale). Already implemented, reviewed, and **accepted by the user**:

- **Profile pages** (`/jen-liu`, `/jen-knows` via `app/components/profile/Page.vue`): Bold Poster restyle, hero CTAs removed, brand-specific `HomeSectionSupport` before the footer. `SectionSupport` got a `brand` prop (pure `app/components/home/sectionSupport.ts` helper + test). **No further changes wanted.**
- **Blog search** (Group B): header magnifier icon (before "Get in Touch", global) opens a `USlideover side="top"` modal (`app/components/blog/SearchModal.vue`) that routes to `/blogs?q=&cat=&tag=`. Composables `useBlogSearch`, `useBlogTaxonomies`; pure helper `app/utils/blogSearchQuery.ts`. Functionally verified (open → type → submit → `/blogs?q=`).
- **Blog list** (`app/pages/blogs/index.vue`): in-page search bar removed (`app/components/blog/TopBar.vue` deleted), masthead pushed to poster scale, taxonomy loading DRYed onto `useBlogTaxonomies`. Data flow (`useBlogList`, posts fetch, pagination, URL sync) untouched.
- **Blog detail** (`app/pages/blogs/[...slug].vue`): the Bold Poster restyle was **reverted** — this page is back to its ORIGINAL style and stays that way.

## Goal of THIS spec

Three user-requested refinements to the blog area. Profile pages and the blog detail page are explicitly out of scope (leave as they are now).

## Decisions (from the user, 2026-05-29)

1. **Profile pages** — accepted as-is. Do not touch `app/components/profile/Page.vue`, `app/pages/jen-liu.vue`, `app/pages/jen-knows.vue`, `app/components/home/SectionSupport.vue`.

2. **Search modal input → match the mockup, + horizontal filters.**
   - The text input must look like the approved mockup `docs/superpowers/specs/assets/2026-05-29-header-search-overlay-mockup.html`: a large (~28px) input, borderless except a **1px bottom underline** (abyssal-ink), a **magnifier icon at the right end** of the line, placeholder EXACTLY `Type for blog search`, autofocus on open. (Replace the current default Nuxt-UI-styled input look with this mockup look.)
   - **Below the input**, place the **分類 (category)** and **標籤 (tag)** selectors **arranged HORIZONTALLY** (side by side in one row, not stacked). They must be clearly identifiable as 分類 / 標籤 (show the text labels, not icon-only).
   - Keep the existing behaviour: `USlideover side="top"` slide-down + dimmed backdrop, Esc / backdrop / Close to dismiss, and submit → `buildBlogSearchRoute` → `navigateTo('/blogs?q=&cat=&tag=')` → close.

3. **Blog list single card → restore ORIGINAL style.**
   - Revert `app/components/blog/PostCard.vue` to its original (pre-"Bold Poster") style — i.e. the version on `chore/cleanup`. The framed-image / hard-offset-shadow / accent-left-border treatment is NOT wanted.
   - Keep the rest of the list page as currently shipped: poster-scale masthead, in-page search bar removed (search lives in the header modal), pagination + data flow intact.

## Scope guardrails

- Do NOT change the blog **data flow** (`useBlogList`, `~/utils/wpApi`, taxonomies, pagination, URL sync).
- Do NOT modify header/footer styling beyond what already exists.
- Light mode only; `useLazyAsyncData` not `useAsyncData`; plain-English comments; no hardcoded domain strings in templates; 2-space indent. Verify visuals with webwright against the user-run dev server at `:3500` (never start/kill it).

## Open question for the implementer (confirm only if it blocks)

- The blog **list masthead poster scale** and the **removed in-page search bar** are assumed KEPT (the user only asked to restore the card). If the user later wants the masthead back to its original size too, that's a separate one-line change.

## Verification targets

- `/blogs`: cards look like the ORIGINAL PostCard again; masthead + pagination still fine; no in-page search bar.
- Header magnifier → modal: input matches the mockup (big, underlined, magnifier right, `Type for blog search`); 分類 + 標籤 selectors sit in a horizontal row below the input; submit still routes to `/blogs?q=…`.
