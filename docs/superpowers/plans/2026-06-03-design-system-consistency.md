# Design-System Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This plan is also packaged as a ready-to-run worker-team Workflow in Appendix A.

**Goal:** Replace every raw Tailwind palette utility across `app/**` (excluding `food-map/`) with brand tokens, and give CLAUDE.md a Design-System Quick Reference so future agents style on-brand by default.

**Architecture:** A small contract-first refactor. First write the token contract into CLAUDE.md, then sweep 13 files applying a fixed raw→brand mapping, leaving 2 flagged colors for Tony's decision. No logic changes, no new components, light-mode only.

**Tech Stack:** Nuxt 4, Tailwind v4, `@nuxt/ui`, brand tokens in `app/assets/css/theme.css` + `main.css`.

**Companion spec:** `docs/superpowers/specs/2026-06-03-design-system-consistency-design.md` (read §5 mapping + §8 decisions first).

---

## Decision gate (resolve before Task 3 touches flagged files)

Defaults are pre-filled with my recommendation; Tony flips if he disagrees.

| #   | Decision                   | Default                                              | Affects                  |
| --- | -------------------------- | ---------------------------------------------------- | ------------------------ |
| D1  | YouTube play-button red    | `group-hover:bg-digital-orange`                      | `YoutubeCarousel.vue:21` |
| D2  | Blog active-filter accent  | `digital-orange` (text/border/dot)                   | `FilterItem.vue:4,10,12` |
| D3  | Orphans in `_unused/`      | **Delete** `ContentBody`, `SectionNewProduct`, `Toc` | removes Task 3.12–3.13   |
| D4  | Typography semantic tokens | **Defer** to its own cycle                           | not in this plan         |

If D3 = Delete, do **Task 0** and skip Tasks 3.12–3.13.

---

## File structure

No new files in the sweep. Touched:

- `CLAUDE.md` — add one section (Task 1)
- 11–13 `.vue` files — class-string swaps only (Task 3)
- 22 `home/**/*.stories.ts` — `title` string only (Task 4)

---

## Task 0 (only if D3 = Delete): remove orphans

**Files:** delete `app/components/home/_unused/**` (ContentBody, SectionNewProduct, Toc — `.vue` + `.stories.ts`)

- [ ] **Step 1: Confirm nothing imports them**

Run: `grep -rnE "HomeContentBody|HomeSectionNewProduct|HomeToc\b" app/ --include=*.vue`
Expected: no matches (orphans are unreferenced).

- [ ] **Step 2: Delete the folder**

```bash
git rm -r app/components/home/_unused
```

- [ ] **Step 3: Verify components still resolve**

Run: `pnpm exec nuxt prepare 2>&1 | tail -2`
Expected: "Types generated" with no errors.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(home): remove unused orphan components

ContentBody, SectionNewProduct, Toc were wired to no page. Recoverable
from git history if ever needed.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 1: CLAUDE.md Design-System Quick Reference

**Files:** Modify `CLAUDE.md` (add a new `## Design System Quick Reference` section after `## Code Style`).

- [ ] **Step 1: Confirm the section does not yet exist**

Run: `grep -n "Design System Quick Reference" CLAUDE.md`
Expected: no match.

- [ ] **Step 2: Insert the section** (after the `## Code Style` block, before `## Working Preferences`)

```markdown
## Design System Quick Reference

Token source of truth: `app/assets/css/theme.css` (raw) + `main.css` (semantic aliases).
Never hardcode a hex/px a token already covers. Light-mode only — never write `dark:*`.

**Colors** — brand tokens as `bg-*` / `text-*` / `border-*`, opacity via `/NN`:

| Token            | Use                          |
| ---------------- | ---------------------------- |
| `basalt-canvas`  | page background              |
| `ash-white`      | card / raised surface        |
| `abyssal-ink`    | primary text + dark surfaces |
| `pure-white`     | text on dark surfaces        |
| `digital-orange` | primary accent, CTA, hover   |
| `cyber-violet`   | secondary accent (Jen Knows) |
| `pixel-glare`    | highlight dots               |
| `sydney-sky`     | hero background              |

**Raw → brand mapping** (use these, never the raw palette):

| Raw                                                                 | Brand                             |
| ------------------------------------------------------------------- | --------------------------------- |
| `text-neutral-400` / `text-gray-400/500`                            | `text-abyssal-ink/50`             |
| `text-gray-700`                                                     | `text-abyssal-ink/70`             |
| `bg-gray-50/100`                                                    | `bg-ash-white`                    |
| `bg-gray-200`                                                       | `bg-basalt-canvas`                |
| `border-neutral/gray-200/300/400`                                   | `border-abyssal-ink/10`           |
| `bg/border/text-gray-900`, `text-black`, `bg-white`, `border-black` | `…-abyssal-ink` / `bg-pure-white` |

**Radius** — semantic aliases, never raw `rounded-xl/2xl` on cards/pills:
`rounded-card` (40px, cards/panels) · `rounded-button` (800px pill, buttons+badges) · `rounded-input` (100px) · `rounded-full` (true circles only). Small radii on non-card/pill elements (e.g. inline images, list rows) may stay.

**Typography:** `font-display` (Bebas Neue) for all h1/h2 — already heavy, never add `font-bold`. `font-sans` (DM Sans) for body. Section heading standard: `font-display tracking-[0.02em] leading-[0.94]`.

**Never:** `dark:*`, raw `text-neutral-*`/`bg-rose-*`/`text-primary-500` utilities, `rounded-xl` on cards, `font-bold` on `font-display`.
Note: Nuxt UI `color="neutral"` / `variant="outline"` props are component contract — keep them (they are not raw utilities).
```

- [ ] **Step 3: Verify it reads cleanly**

Run: `grep -n "Raw → brand mapping" CLAUDE.md`
Expected: one match.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): add design-system quick reference

Token cheatsheet + raw→brand mapping so agents style on-brand by default.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Brand-token sweep (one sub-task per file)

For each file: open it, apply the exact swaps below, run the per-file grep (expect 0 raw left, minus flagged), then it gets committed as part of the batch commit in Task 3.99. **Only swap raw `class`/class-string utilities. Never touch `color="neutral"` props.**

### Task 3.1: `app/pages/blogs/index.vue`

- `:18` `text-neutral-400` → `text-abyssal-ink/50`
- `:40` `text-neutral-400` → `text-abyssal-ink/50`
- `:46` `border-neutral-200` → `border-abyssal-ink/10`
- `:69` `text-neutral-400` → `text-abyssal-ink/50`

### Task 3.2: `app/pages/blogs/[...slug].vue`

- `:7` `text-neutral-400` → `text-abyssal-ink/50` (keep `hover:text-digital-orange`)
- `:13` `text-neutral-400` → `text-abyssal-ink/50`
- `:24` `border-neutral-200` → `border-abyssal-ink/10` (rest already brand)
- `:107` `rounded-xl` on a prose `<img>` (`@apply`) → **leave** (image radius, not a card/pill)

### Task 3.3: `app/components/blog/FilterButton.vue`

- `:39` `border-neutral-300` → `border-abyssal-ink/10`

### Task 3.4: `app/components/blog/FilterGroup.vue`

- `:3` `text-gray-400` → `text-abyssal-ink/50`

### Task 3.5: `app/components/blog/FilterItem.vue` (uses D2)

- `:3` `hover:bg-gray-50` → `hover:bg-ash-white`; `rounded-lg` on the row → **leave** (list row, not card/pill)
- `:4` `text-teal-600` → **D2** (`text-digital-orange`)
- `:10` `border-teal-500` → **D2** (`border-digital-orange`); `border-gray-300` → `border-abyssal-ink/10`
- `:12` `bg-teal-500` → **D2** (`bg-digital-orange`)

### Task 3.6: `app/components/shared/ContactLinks.vue`

- `:18` JS constant `linkClass: "text-gray-500"` → `"text-abyssal-ink/60"`

### Task 3.7: `app/components/shared/ScrollToTopButton.vue`

- `:5` `bg-white` → `bg-pure-white`; `text-black` → `text-abyssal-ink`; `border-black` → `border-abyssal-ink`; `hover:bg-gray-100` → `hover:bg-ash-white`

### Task 3.8: `app/components/shared/CollapsibleSeparator.vue`

- `:11` `bg-gray-200` → `bg-abyssal-ink/10`
- `:12` `text-gray-500` → `text-abyssal-ink/60`
- `:15` `text-gray-400` → `text-abyssal-ink/50`
- `:17` `bg-gray-200` → `bg-abyssal-ink/10`

### Task 3.9: `app/components/restaurants/MapView.vue` (preserve active/inactive contrast)

- `:60` (active) `bg-gray-900` → `bg-abyssal-ink`; `border-gray-900` → `border-abyssal-ink`; `text-white` → `text-pure-white`
- `:61` (inactive) `bg-white` → `bg-pure-white`; `border-gray-300` → `border-abyssal-ink/10`; `text-gray-400` → `text-abyssal-ink/50`; `hover:border-gray-400` → `hover:border-abyssal-ink/20`; `hover:text-gray-500` → `hover:text-abyssal-ink/70`

### Task 3.10: `app/components/home/parts/YoutubeCarousel.vue` (uses D1)

- `:12` `bg-gray-100` → `bg-ash-white`
- `:21` `group-hover:bg-red-600` → **D1** (`group-hover:bg-digital-orange`); `bg-black/60` scrim → **leave** (functional overlay)

### Task 3.11: `app/components/home/parts/ImageCarousel.vue`

- `:11` `bg-gray-100` → `bg-ash-white`

### Task 3.12: `app/components/home/_unused/Toc.vue` — SKIP if D3 = Delete

- `:11` `max-sm:bg-white` → `max-sm:bg-pure-white`; `max-sm:border-gray-200` → `max-sm:border-abyssal-ink/10`

### Task 3.13: `app/components/home/_unused/ContentBody.vue` — SKIP if D3 = Delete

- `:25` `text-gray-700` → `text-abyssal-ink/70`
- `:38` `text-gray-700` → `text-abyssal-ink/70`

### Task 3.99: Verify whole sweep + commit

- [ ] **Step 1: Repo-wide grep — expect only flagged/UI-prop matches**

Run:

```bash
grep -rnE "\b(text|bg|border|ring)-(neutral|zinc|slate|gray|stone|rose|red|teal|cyan|blue|indigo|violet|purple|pink)-[0-9]+" app/ --include=*.vue | grep -v "/food-map/"
```

Expected: no matches (D1/D2 already swapped to brand). If any remain, fix them.

- [ ] **Step 2: Types still resolve**

Run: `pnpm exec nuxt prepare 2>&1 | tail -2`
Expected: "Types generated", no errors.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "style: replace raw palette utilities with brand tokens

Sweep 11 files (blog, shared, restaurants, home/parts) to brand colors
per the design-system quick reference. food-map untouched.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 4: Visual check** — drive the browser to `/blogs`, `/blogs/<a real slug>`, and the homepage (carousels). `Read` each screenshot. Confirm nothing lost contrast or broke. (Leaflet `/sydney...` route is food-map-adjacent but MapView is a `restaurants/` component on `/my-best-restaurants-search-in-sydney` — check that route too.)

---

## Task 4: Story-title alignment (cosmetic, batch)

`home/**` stories still declare `title: "home/<Name>"` but live in sub-folders now. Align titles so Storybook's tree mirrors the folders.

**Files:** all `app/components/home/**/*.stories.ts`.

- [ ] **Step 1: See current titles**

Run: `grep -rn "title:" app/components/home --include=*.stories.ts`

- [ ] **Step 2: Update each title** to `"home/<role>/<Name>"` matching its folder (e.g. `sections/SectionHero.stories.ts` → `title: "home/sections/SectionHero"`).

- [ ] **Step 3: Commit**

```bash
git add app/components/home
git commit -m "chore(storybook): align home story titles to new subfolders

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (done by author)

- **Spec coverage:** §5 mapping → Task 1 + Task 3 swaps ✓. §4 13 files → Tasks 3.1–3.13 ✓. §7 chunks: CLAUDE.md (T1), sweep (T3), story titles (T4), orphans (T0/D3), typography (D4 deferred) ✓. §8 decisions → Decision gate (D1–D4) ✓.
- **Placeholder scan:** every swap has exact line + exact before→after. No TBD. ✓
- **Consistency:** token names match `theme.css` (`abyssal-ink`, `ash-white`, `basalt-canvas`, `digital-orange`, `pure-white`). Radius leaves non-card/pill `rounded-*` (stated in T3.2/T3.5 + CLAUDE.md). ✓
- **Gap:** `text-black`/`bg-white`/`border-black` (un-numbered) only swept where clearly a brand surface (T3.7, T3.9); CLAUDE.md mapping documents them. ✓

---

## Appendix A: ready-to-run worker-team Workflow

When Tony is back and decisions D1–D3 are set, the sweep (Task 3) can run as a parallel worker team instead of solo. Launch with the Workflow tool. Each worker owns one file, applies its task block above, returns a diff; a final grep proves completeness. Pipeline keeps each file independent.

```js
export const meta = {
  name: "brand-token-sweep",
  description: "Replace raw palette utilities with brand tokens, one worker per file",
  phases: [{ title: "Sweep" }, { title: "Verify" }],
};

// D1/D2/D3 resolved values injected via args; default to recommendations.
const D = args || { d1: "digital-orange", d2: "digital-orange", includeOrphans: false };

const FILES = [
  "app/pages/blogs/index.vue",
  "app/pages/blogs/[...slug].vue",
  "app/components/blog/FilterButton.vue",
  "app/components/blog/FilterGroup.vue",
  "app/components/blog/FilterItem.vue",
  "app/components/shared/ContactLinks.vue",
  "app/components/shared/ScrollToTopButton.vue",
  "app/components/shared/CollapsibleSeparator.vue",
  "app/components/restaurants/MapView.vue",
  "app/components/home/parts/YoutubeCarousel.vue",
  "app/components/home/parts/ImageCarousel.vue",
  ...(D.includeOrphans
    ? ["app/components/home/_unused/Toc.vue", "app/components/home/_unused/ContentBody.vue"]
    : []),
];

const CONTRACT = `Apply the raw→brand mapping from CLAUDE.md "Design System Quick Reference".
Only swap raw class-string utilities; never touch color="neutral" / variant props.
Leave rounded-* on non-card/pill elements. Active-filter accent = ${D.d2};
YouTube hover = ${D.d1}. Return a unified diff of your file only. Do not commit.`;

const results = await pipeline(
  FILES,
  (file) =>
    agent(
      `${CONTRACT}\n\nFile to edit: ${file}\nSee the task block for ${file} in docs/superpowers/plans/2026-06-03-design-system-consistency.md for the exact lines.`,
      { label: `sweep:${file}`, phase: "Sweep" },
    ),
  (diff, file) =>
    agent(
      `Verify ${file} has zero raw palette utilities left (grep) and the diff only changed colors/radius, no logic. Report PASS/FAIL with reason.`,
      { label: `verify:${file}`, phase: "Verify" },
    ),
);
return results;
```

> Note: workers edit files in the shared tree; run this with care (or `isolation: 'worktree'` per worker if parallel edits to _different_ files still race on `.nuxt`). Since each worker owns a distinct file, conflicts are unlikely; the final `git diff` is the review surface before the single Task 3.99 commit.
