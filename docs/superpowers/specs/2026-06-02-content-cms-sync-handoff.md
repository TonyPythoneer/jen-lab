# Content CMS-sync — Handoff

Companion to `2026-06-02-content-cms-sync-design.md`. Records what still needs a
human to verify, and the context the next session needs to pick this up.

Branch: `feat/content-cms-sync` (worktree `.claude/worktrees/content-cms-sync`).
Open PR: **#35** → base `feat/food-map`. Contains Phase 0 + 1 + 2.

---

## A. Needs human verification

Code-level + SSR-HTML checks all passed (`pnpm check` green; `/blogs` and
`/blogs/1` render their wording from content). These items still want a real
pair of eyes / a released browser:

1. **PostCard "New!" badge** — NOT browser-verified. The blog list fetches
   WordPress posts client-side only (`useLazyAsyncData(..., { server: false })`),
   so the cards are absent from SSR HTML and from `curl`. The badge text and age
   cutoff now flow as props from `content/site/blogs.yml`.
   - Steps: `NUXT_PORT=3520 PORT=3520 pnpm dev` in the worktree → open
     `http://localhost:3520/blogs` → a post younger than 7 days should show the
     badge reading `New!`. To prove it is content-driven, change
     `postCard.newBadgeText` in `content/site/blogs.yml`, save, and confirm the
     badge text changes.

2. **Search modal, full visual** — open the search slide-over (trigger in the
   site header) and confirm: input placeholder `Type for blog search`, and the
   two filter buttons read `分類` / `標籤`. (Placeholder + labels confirmed
   present in `/blogs` SSR HTML, but the open/interaction state was not driven.)

3. **Byte-identical confirmation (optional)** — values were copied verbatim, so
   the render is identical by construction. If you want belt-and-suspenders,
   screenshot `/blogs` and one real `/blogs/<id>` and diff against `main`.

## B. Decisions for the human (not code)

4. **Publishing `feat/food-map`** — to give PR #35 a clean content-only base I
   pushed your `feat/food-map` branch to origin (it was local-only). If you do
   not want it public, options: retarget PR #35 to `main` (diff then includes
   the storybook + ferry work, ~85 files) or delete the remote `feat/food-map`.

5. **`feat/food-map` ferry work** — `feat/content-cms-sync` was rebased onto
   `feat/food-map`'s tip `cf07eef` so the PR diff is content-only (no false
   ferry deletions). No action needed unless food-map's history changes again.

## C. Known issues (pre-existing, NOT caused by this work)

6. **Header nav empty in dev** — `app/components/site/Header.vue` uses
   `queryCollection("site").path("/site/header")`; `.path()` throws on a
   single-file `data` collection in dev SQLite, so the nav is empty in
   `pnpm dev`. Predates this work. Likely fix: query with `.first()` (the same
   pattern this PR uses for `siteBlogs`). Open question: is prod prerender
   affected? Worth a separate task.

7. **`pnpm build-storybook` fails** on `shared/SnapCarousel.vue` (Vue generic
   SFC + rolldown). Dev Storybook (`pnpm storybook`) is fine. Unrelated.

---

## D. Next-session context

**What shipped (PR #35):**

- Phase 0 — removed dead `product.brief` / `product.purchaseLabel`.
- Phase 1 — homepage copy + SEO in `content/pages-layout/home.md`; section
  components read props.
- Phase 2 — blog page chrome in `content/site/blogs.yml` (`siteBlogs`
  collection); `blogConfig` retired.

**Load-bearing patterns (keep these):**

- **CMS read pattern:** the _page_ or _layout_ calls
  `queryCollection(...).first()`; _components_ take props with `withDefaults`.
  Components must NEVER call `queryCollection` — Storybook has no Nuxt Content,
  so a component-level query breaks its story. This is why `PostCard` /
  `SearchModal` got props and the global `default.vue` layout does the query for
  the modal.
- **Data collections use `.first()` / `.all()`, never `.path()`** (see issue 6).
- **Single source for config:** `app/config/site.ts` is imported by both Nuxt
  (`app.config.ts`) and Storybook (`.storybook/mocks/nuxt.ts`). Any export you
  remove there must be removed from both consumers (that is how `blogConfig`
  was retired).
- Verbatim-copy rule for these phases: extraction must not change rendered text.

**Out of scope (do not touch):** all restaurant context (`restaurants.ts`,
`/my-best-restaurants-search-in-sydney`, `/sydney-food-map`), and the
site-global footer/contacts layer.

**Process lesson from this session:** parallel haiku verifier agents
hallucinated (reported the OLD pre-change file state — likely relative paths
resolving to the main checkout, not the worktree). Always confirm agent
findings with a native `Read` on an absolute worktree path before acting.
Visual verification here used SSR-HTML inspection via `curl` on a worktree dev
server (`:3520`) because the Playwright browser profile was locked by another
instance; do not kill the user's `:3500` server or their browser.
