# Design: Design-System Consistency & Structure Cleanup

**Date:** 2026-06-03
**Branch:** `refactor/design-system-cleanup`
**Author:** Claude (Opus 4.8), solo planning session while Tony is away
**Status:** DRAFT — awaiting Tony's review on the flagged decisions before formal work

---

## 給 Tony 的白話摘要（30 秒看懂）

我們今天已經把「部落格卡片 + 首頁區塊標題 + home/ 資料夾重組」做完並 commit 了。剩下的工作我盤點清楚了，主要就一件大事：**把全站零散的「非品牌顏色」換成品牌 token**——範圍很明確，只有 **13 個檔案**（大多是機械式替換），外加 2 個圓角小修。

我建議用你想的「**工人隊**」來做：一個工人負責一個檔，平行跑，每個都附 before/after。`food-map` 完全不碰。

**只有 3 件事需要你回來拍板**（都在最後一節），其他我都有合理預設、可以直接執行。

---

## 1. Goal

Make the site visually consistent and structurally legible ("fairy book"), so any contributor — human or AI — can land a change that already matches the brand without guessing.

**Definition of done:** every `app/**` Vue file outside `food-map/` uses brand tokens (colors, radius, typography) instead of raw Tailwind palette utilities; CLAUDE.md carries a Design-System Quick Reference that future agents read before styling.

## 2. Non-Goals (out of scope)

- **`food-map/`** — explicitly excluded this cycle (`app/components/food-map/**`, `app/assets/css/food-map.css`).
- **Dark mode** — banned (light-mode only). We are removing residue, never adding.
- **New features / new components** — this is consistency + structure only.
- **Visual redesign** — we re-map colors to existing brand tokens; we do not change the design language.

## 3. What's already done (committed on this branch)

| Commit    | Change                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `27a0518` | `PostCard` + `PostCardSkeleton` → brand tokens, dark-mode dropped                                                                                                   |
| `463d791` | `home/` split into `sections/art/motion/parts/_unused` + `components:dirs` hook keeps names flat (`<HomeSectionHero>`); section heading `leading` unified to `0.94` |
| `8887129` | `.planning/BOARD.md` cockpit board                                                                                                                                  |

Verified: 0 phantom component names; `/blogs` + homepage render correctly in browser.

## 4. Grounded scope (real inventory, not guesses)

Source: `grep` across `app/**` excluding `food-map/`.

**4a. `dark:` residue:** `0` files. Already clean. ✅

**4b. Raw color utilities — 13 files:**

| File                                             | Notes                                                    |
| ------------------------------------------------ | -------------------------------------------------------- |
| `app/pages/blogs/index.vue`                      | blog list page                                           |
| `app/pages/blogs/[...slug].vue`                  | blog detail page (also has non-brand radius)             |
| `app/components/blog/FilterButton.vue`           |                                                          |
| `app/components/blog/FilterGroup.vue`            |                                                          |
| `app/components/blog/FilterItem.vue`             | active-state uses **teal** (decision) + non-brand radius |
| `app/components/shared/ContactLinks.vue`         |                                                          |
| `app/components/shared/ScrollToTopButton.vue`    |                                                          |
| `app/components/shared/CollapsibleSeparator.vue` |                                                          |
| `app/components/restaurants/MapView.vue`         | Leaflet map UI                                           |
| `app/components/home/parts/YoutubeCarousel.vue`  | play button uses **red-600** (decision)                  |
| `app/components/home/parts/ImageCarousel.vue`    |                                                          |
| `app/components/home/_unused/Toc.vue`            | orphan (see §8)                                          |
| `app/components/home/_unused/ContentBody.vue`    | orphan (see §8)                                          |

Most frequent offenders: `text-neutral-400` (5), `text-gray-500/400` (3 each), `bg-gray-100` (3), `border-neutral-200` / `border-gray-300` (2 each).

**4c. Non-brand radius — 2 files:** `blog/FilterItem.vue`, `pages/blogs/[...slug].vue` (`rounded-md|lg|xl…`).

**4d. `primary-NNN` raw usage:** `0`. ✅

## 5. Token mapping (the heart of the sweep)

**Mechanical — workers apply these directly** (raw → brand):

| Raw utility                                          | Brand replacement              | Meaning         |
| ---------------------------------------------------- | ------------------------------ | --------------- |
| `text-neutral-400`, `text-gray-400`, `text-gray-500` | `text-abyssal-ink/50`          | muted text      |
| `text-gray-700`                                      | `text-abyssal-ink/70`          | secondary text  |
| `bg-gray-50`, `bg-gray-100`                          | `bg-ash-white`                 | raised surface  |
| `bg-gray-200`                                        | `bg-basalt-canvas`             | page-level fill |
| `border-neutral-200/300`, `border-gray-200/300/400`  | `border-abyssal-ink/10`        | hairline border |
| `bg-gray-900`, `border-gray-900`, `text-gray-900`    | `bg-/border-/text-abyssal-ink` | strong/dark     |
| `rounded-md/lg/xl` on cards                          | `rounded-card`                 | card radius     |
| `rounded-md/lg/xl` on pills/buttons/badges           | `rounded-button`               | pill radius     |

**Rule for `color="neutral"` Nuxt UI props:** LEAVE THEM. `<UButton color="neutral">` / `<UBadge variant="outline">` are component contract (per CLAUDE.md Code Style), not raw utilities. Only raw `class="…"` palette utilities get swapped.

**Flagged — need Tony's call (see §8):** `red-600` (YouTube play button), `teal-500/600` (blog active-filter accent).

## 6. Approaches considered

**A. Worker-team Workflow (RECOMMENDED).** One worker agent per file (≈13), each: reads the file, applies the §5 mapping, leaves flagged colors untouched with a note, returns a before/after diff. A final pass greps for leftover raw utilities to confirm zero. _Why:_ matches Tony's "team of workers" vision; the work is genuinely independent per file; bounded and fast; each diff is reviewable.

**B. Solo sequential.** I edit all 13 files one by one. _Why not:_ no parallelism benefit; slower; Tony explicitly wants the team model.

**C. Regex codemod (sed).** A scripted find-replace for the mechanical swaps. _Why not:_ class strings need judgment (is `bg-gray-100` a card or page fill? is this `neutral` a raw utility or a UI prop?). A blind codemod over-matches and strips the judgment that makes the result correct. Rejected — violates the project's "no fake fixes / root-cause" ethic.

**Decision:** A. Workers carry judgment; the mapping table keeps them consistent; the final grep proves completeness.

## 7. Chunk breakdown (what the plan will detail)

Ordered by dependency:

1. **CLAUDE.md Design-System Quick Reference** (solo, small). Write the §5 mapping + token cheatsheet into CLAUDE.md FIRST — it becomes the contract every worker references. Draft already exists (in conversation; reproduced in the plan).
2. **Brand-token sweep** (worker team, 13 files). Apply §5. Leave flagged colors per §8. Final grep = 0 raw utilities (excluding flagged + UI-prop `neutral`).
3. **Story-title alignment** (batch, 22 files). `home/` stories still say `title: "home/X"`; update to `"home/<role>/X"` so Storybook's tree matches the new folders. Pure cosmetic; no component change.
4. **(Optional) Typography semantic tokens** (flagged optional). `theme.css` defines `--text-heading/display` etc. that are barely used; headings hardcode `text-3xl/5xl`. Adopting semantic tokens is a deeper consistency win but larger surface. Recommend deferring to its own cycle unless Tony wants it now.
5. **Orphan resolution** (needs Tony, §8). `_unused/` = `ContentBody`, `SectionNewProduct`, `Toc`.

**Parallel track (meta tooling, not blocking the cleanup):** `gsd-cockpit` skill v2 — formalize the worker-team execution model inside the skill, and add a SessionStart hook for always-on. Spec'd separately; does not gate the cleanup.

## 8. Open decisions for Tony (the only things I need you for)

1. **YouTube play-button red** (`YoutubeCarousel.vue`, `group-hover:bg-red-600`).
   - **(a) Keep red** — red is the universal "play" affordance for YouTube. Defensible.
   - **(b) → `bg-digital-orange`** — fully on-brand. _My lean: (b)_, since the rest of the site has no red and digital-orange is the brand hover color everywhere else.

2. **Blog active-filter accent** (`FilterItem.vue`, teal).
   - Teal isn't a brand color. Map the selected-state to a brand accent.
   - **(a) `digital-orange`** (primary accent) — _my lean_, consistent with links/CTAs.
   - **(b) `cyber-violet`** (secondary accent) — if you want filters to feel distinct from CTAs.

3. **Orphans in `_unused/`** (`ContentBody`, `SectionNewProduct`, `Toc`).
   - **(a) Delete them** — not wired to any page; git history keeps them recoverable. _My lean_, cleanest for "fairy book."
   - **(b) Keep parked** — if you think one might come back soon.
   - (Note: if (a), they drop out of the §4 sweep entirely.)

4. **Typography semantic tokens (§7.4)** — do now, or defer to its own cycle? _My lean: defer_ (keep this cycle focused on color/structure).

## 9. Verification strategy

- **Per file:** after edit, `grep` that file for raw utilities → expect 0 (minus flagged + UI-prop `neutral`).
- **Whole sweep:** repo-wide grep (the §4 command) → expect only flagged + UI-prop matches remain.
- **Visual:** drive the browser to each affected route (`/blogs`, `/blogs/<slug>`, homepage carousels, `/sydney-...`? no — food-map excluded) and `Read` the screenshot. Headings' `leading` change is sub-perceptible (calculable) — visual focus is "did any card/filter/button break."
- **Commit cadence:** one atomic commit per verified chunk (Tony's standing rule). Never commit broken state.

## 10. Risks & mitigations

- **Over-swapping a UI-prop `neutral`** → workers are instructed: only `class="…"` raw utilities, never `color=` props.
- **Wrong surface token** (`ash-white` vs `basalt-canvas`) → worker picks by surface role (raised vs page); reviewable in the diff.
- **Leaflet map (`MapView.vue`)** colors may be functional (markers/controls) not decorative → worker flags any non-obvious one rather than guessing.
- **Dev server config cache** → component/config changes verified via `nuxt prepare` (build-time truth), not the live dev server alone.
