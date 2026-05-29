# Inner Pages → Production-Level Design (Direction A: Bold Poster)

> **Status: ready for user review.** Design direction is LOCKED (Bold Poster). Profile + blog mockups approved, and the blog-search interaction is designed and verified in a real browser. Awaiting the user's sign-off on this spec before `writing-plans`. Brainstorming HARD-GATE still applies: no implementation until approved.

## Goal

Raise three page areas of the jen-lab site to a polished, shipped, production-level look — matching the bar already set by the homepage. **The restaurant page is explicitly out of scope.**

In scope:

- `app/pages/jen-liu.vue` and `app/pages/jen-knows.vue` — both render the shared **`app/components/profile/Page.vue`** (`ProfilePage`). Restyle that one component and both pages benefit.
- `app/pages/blogs/index.vue` (list + search/filter) and `app/pages/blogs/[...slug].vue` (post detail).

## Locked decision — Direction "A: Bold Poster"

Chosen by the user from a 3-way visual comparison (A Bold Poster vs B Masthead Grid vs C Collaged Canvas). A scored highest (brandFit 9 / productionBar 9 / distinctiveness 8).

A high-fidelity, approved mockup of the **profile page** in this direction is saved at:
`docs/superpowers/specs/assets/2026-05-29-bold-poster-profile-mockup.html` (open in a browser — it is a standalone doc using the real palette + fonts). Treat it as the visual source of truth for the profile page.

### Design language (must stay inside the existing "Caldera" system)

Use ONLY existing tokens — no new colors/fonts. Tokens live in `app/assets/css/theme.css`:
`--color-basalt-canvas #e2e2df` (page bg) · `--color-ash-white #f7f6f2` (cards) · `--color-abyssal-ink #070607` (ink) · `--color-pure-white #ffffff` · `--color-digital-orange #fc5000` (primary) · `--color-cyber-violet #524ae9` (secondary) · `--color-pixel-glare #f5f28e` · `--color-sydney-sky #87ceeb`. Display font `font-display` = Bebas Neue (ALL-CAPS); body `font-sans` = DM Sans. Shapes: `rounded-button` (800px pill), `rounded-card` (40px), `rounded-input` (100px).

**Bold Poster — concrete design moves:**

- **Headline scale:** Bebas Neue ALL-CAPS, 80–120px on desktop (64px mobile), `leading-[0.9]`, `tracking-[0.03em]`. Profile name dominates its container; crop the right edge on desktop (overflow clip) for intentional poster tension. Section headings (PRODUCTS, LINKS) at 48–56px in the same tight style.
- **Asymmetric grid:** staggered columns — narrower left, wider right. Cards shift left/right by 2–3 spacing units. Section heading bleeds left, content indented (deliberate friction). Single column on mobile.
- **Colored blocks:** product cards get a hard full-height left-border stripe (8–12px) in digital-orange or cyber-violet, or a 10–15% background tint. Links/portal cells get a subtle cyber-violet tint + 2px border on hover.
- **No soft shadows:** use hard inset/offset shadows only (sticker energy). Sharp 0° corners on framed images.
- **Pill buttons as punctuation:** the 800px pills are the only soft-rounded elements; stack vertically when 2+, orange primary absorbs weight, neutral-outline recedes; full-width pills on mobile.
- **Poster image treatment:** product images mounted with a hard ash-white 12–16px frame, 0 radius corners, and a 6px offset shadow (right+down, abyssal-ink ~0.8).
- **Spacing rhythm:** 40px between major sections, 24px card padding, 16px grid gaps; micro 8–12px for inline text+icons.

## User refinements to apply (REQUIRED)

1. **Profile hero: remove BOTH CTA buttons** currently in `ProfilePage.vue` — `訂閱電子報` (subscribe) and `請我喝奶茶` (support). The hero no longer carries CTAs.
2. **Reuse the existing support section for 請我喝奶茶.** `app/components/home/SectionSupport.vue` (auto-imported as `HomeSectionSupport`) already renders the bubble-tea support block. Render it **inside `ProfilePage.vue`, after the last section, just before the page footer.** Do not rebuild it.
3. **Do NOT modify the header or footer styles** — `app/components/site/Header.vue` and `app/components/site/Footer.vue` are off-limits.
4. **Use Nuxt UI (`@nuxt/ui` v4) components** to build the UI wherever a component fits (see the `nuxt-ui` skill). Don't hand-roll what Nuxt UI already provides.

### Resolved decisions (confirmed by user 2026-05-29)

- **Newsletter:** the removed `訂閱電子報` CTA is NOT re-placed anywhere. `HomeSectionNewsletter` is not used on these pages.
- **Support button per brand:** `HomeSectionSupport` must show ONLY the matching brand's button — `支持 Jen Liu` on `/jen-liu`, `支持 Jen Knows` on `/jen-knows`. `SectionSupport.vue` currently hard-codes both; add a prop (e.g. `brand: 'jen-liu' | 'jen-knows'`) so each page renders only its own button. The homepage usage (if any) keeps both — make the prop optional, defaulting to "both".

## Blog search — final design (supersedes any earlier in-page search-bar notes)

Search is triggered from the GLOBAL header, not an in-page bar.

- **Header trigger:** a plain magnifier icon button in the header's right group, BEFORE "Get in Touch" (order `[search] [Get in Touch] [burger]`). Shown on ALL pages. `aria-label="搜尋文章"`.
- **Slide-down modal overlay:** clicking it opens a white sheet that slides down from the top (translateY(-100%)→0, ~340ms) covering the header; the rest of the page dims behind a scrim (modal). Close via "Close ✕", Esc, or clicking the scrim. Auto-focus the input on open; lock body scroll while open.
- **Overlay contents — vertical stack:**
  1. Text input, placeholder exactly `Type for blog search`, with an underline + magnifier icon at the right.
  2. **分類 (categories) filter** — directly below the input.
  3. **標籤 (tags) filter** — below 分類.
     These live INSIDE the overlay, stacked under the input — NOT on the blog page body. (This supersedes the earlier "filters stay on page body" decision.)
- **Submit → URL:** applying search/filters does `navigateTo('/blogs?q=<term>&cat=<ids>&tag=<ids>')` and closes the overlay. The blog index already reads `q`/`cat`/`tag`/`page` from the URL via `useBlogList(route.query)` and syncs state↔URL — so the data layer is essentially unchanged; the URL is the hand-off channel (no shared `useState` needed).
- **Taxonomies for the overlay:** load category/tag lists via `queryCollection('wpCategories' / 'wpTags')` (client-only, lazy on first open) in a small composable e.g. `useBlogTaxonomies()`. Cheap (local content collections).
- **Blog list page body:** `UPageHeader` masthead + post grid + pagination only; no in-page search/filter bar. The masthead scrolls away normally.

### Header change is authorized

This OVERRIDES the earlier "do not touch header styles" constraint, but ONLY to add the search icon + overlay trigger. Keep the header's existing pill + scroll-collapse styling otherwise. Footer stays untouched.

### Implementation notes (carry into the plan)

- Build the overlay with Nuxt UI **`UModal`** (or a top slideover). UModal handles focus trap, Esc, scroll-lock, and backdrop pointer-events correctly.
- **Pointer-events trap (verified bug):** if hand-rolling instead of UModal, the closed scrim MUST be `pointer-events: none` — `opacity:0` alone is NOT enough; a transparent `inset:0; pointer-events:auto` scrim silently eats clicks on the whole page (including the trigger). UModal avoids this.
- Visual reference (verified working): `docs/superpowers/specs/assets/2026-05-29-header-search-overlay-mockup.html`. Open it via a plain static server (`python3 -m http.server` in that dir) — the brainstorm companion cannot run interactive full-document mockups.

## Scope guardrails

- **Blog data flow preserved.** Keep WP API (`~/utils/wpApi`), `useBlogList`, taxonomies (`queryCollection` wpCategories/wpTags), pagination, URL sync, caching. The search/filter UI MOVES to the header overlay (see "Blog search"), but still drives the existing URL params — so the data flow is unchanged. Do not refactor it.
- Respect repo constraints in `CLAUDE.md`: light mode only; `SitePageContainer` on all non-home pages; `useLazyAsyncData` (not `useAsyncData`); plain-English comments; no hardcoded domain strings in templates (use `<script setup>` constants); verify visual changes with webwright (dev server runs at :3500, user-managed — never start/kill).

## Where things are

- Approved profile mockup (durable): `docs/superpowers/specs/assets/2026-05-29-bold-poster-profile-mockup.html`
- Ephemeral brainstorm artifacts (gitignored, may be cleaned): `.superpowers/brainstorm/54738-1780015748/` — `content/directions-gallery.html` (the 3-way gallery), `mockups/{A,B,C}-*-profile.html`.
- Visual companion server was at `http://localhost:50348` (auto-exits after 30 min idle; restart with `superpowers/.../brainstorming/scripts/start-server.sh --project-dir <repo>` if needed).
- Target files: `app/components/profile/Page.vue`, `app/pages/blogs/index.vue`, `app/pages/blogs/[...slug].vue`, reuse `app/components/home/SectionSupport.vue`.

## Next Steps (resume here)

1. **User reviews this spec** (current step). Resolve the remaining open question (per-brand support button) + confirm newsletter placement.
2. Invoke the **writing-plans** skill: ProfilePage.vue restyle (Bold Poster) + remove hero CTAs + append `HomeSectionSupport` before footer; header search icon + `UModal` overlay (text input + 分類/標籤) routing to `/blogs?q=`; blog index + detail restyle with Nuxt UI; data flow untouched; webwright visual verification.
3. Implement (TDD where it applies), verify each route in webwright, then `requesting-code-review` / finish-branch.

## Brainstorming process state

Checklist progress: (1) explore ✅ (2) visual companion ✅ (3) clarify ✅ (4) propose approaches ✅ (5) present design ✅ (profile + blog + blog-search all shown; blog-search verified in-browser) (6) write spec ✅ (this doc) (7) **user reviews spec — IN PROGRESS** (8) writing-plans — next. **Do NOT start implementation until the spec is approved (brainstorming HARD-GATE).**
