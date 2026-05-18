# 15 — Cleanup, CLAUDE.md Refresh, Final Commit

Per CLAUDE.draft.md lifecycle step 4 — remove project-management artifacts and bring living docs back into sync before merging.

## Goals

### 1. Refresh `CLAUDE.md`

Living architecture doc. Currently describes profile tabs / `home` collection / `HomeProfile`, all of which no longer match `app/pages/index.vue` after this branch.

Rewrite the "## Architecture" section to reflect:

- `/` — Caldera-styled landing built from `UHeader`, `UPageHero`, `UPageGrid`, `UPageFeature`, `UTabs`, `UPageColumns`, `UBlogPosts`, `UPageCTA`, `UFooter` + custom decorative SVGs (`Home*Svg`).
- `/about` — single-page Caldera-styled bio (`app/pages/about.vue`).
- `/blogs` and `/blogs/[...slug]` — restored from `pages_backup/`, restyled.
- `/my-best-restaurants-search-in-sydney` — unchanged.
- Design tokens — imported from `app/assets/css/theme.css` (extracted from caldera.xyz, three `tracking-*` values patched from `px → em`). Semantic radius aliases + font substitutes added in `main.css`. Nuxt UI color slots mapped in `app.config.ts`.
- Fonts — `@nuxt/fonts` self-hosts Bebas Neue (display) + Inter (body).

Remove the now-stale sub-section about profile tabs / `home` collection / pre-rendered `descriptionHtml` if those features are gone.

Do this as part of this task, not a separate one — keeps CLAUDE.md and the working tree atomic in one commit.

### 2. Delete project-management folder

```bash
rm -rf .claude/project-management/MIMIC_CALDERA
```

### 3. Present optional-artifact deletion list to Jen

Confirm each (per item) before deleting:

| Path                   | Suggested fate                            | Why                                                                                                        |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DESIGN.md` (root)     | delete                                    | Superseded by `DESIGN (1).md`.                                                                             |
| `DESIGN (1).md` (root) | rename → `DESIGN.md`                      | Single canonical reference.                                                                                |
| `theme.css` (root)     | delete                                    | Moved to `app/assets/css/theme.css` in task 01. Root copy redundant.                                       |
| `tokens.json` (root)   | delete (or keep)                          | Not consumed by build. Keep only if Jen wants Style Dictionary later.                                      |
| `CLAUDE.draft.md`      | promote (append to `CLAUDE.md`) or delete | Work guide that drove this branch. Promote = preserve methodology. Delete = forget it. Jen decides.        |
| `app/pages_backup/`    | delete                                    | Original profile + blog pages. Blog pages were restored + restyled in task 13; profile pages won't return. |

Present as a checklist in the conversation, wait for explicit per-item response, then execute.

## Final commit

Single commit:

```
feat(site): mimic caldera.xyz across /, /about, /blogs

Replace profile-tab home with a Caldera-styled landing page (UHeader,
UPageHero + Opera House SVG, UPageGrid stats, two UPageFeature blocks
with Harbour Bridge / wave SVGs, UTabs use-cases, UPageColumns
testimonials, UBlogPosts preview row, UPageCTA newsletter, UFooter).
Add matching /about and /blogs pages in the same vocabulary; /blogs
restored from pages_backup and restyled.

Design tokens imported via app/assets/css/theme.css (extracted from
caldera.xyz). Semantic radius aliases (--radius-card/input/button)
and font substitutes (Bebas Neue display, Inter body) layered on top.
Three tracking values patched from 0.02px (extraction error) to 0.02em.
Fonts self-hosted via @nuxt/fonts. Nuxt UI color slots wired in
app.config.ts; dark mode disabled.

All decorative SVG authored locally with Sydney / Australia motif. No
Caldera proprietary assets copied. CLAUDE.md architecture section
rewritten to match the new structure.
```

## Verification

- `git status` clean after final commit (only intentional changes staged).
- `pnpm dev` boots; `/`, `/about`, `/blogs`, `/my-best-restaurants-search-in-sydney` all render.
- `vp check` + `vp test` pass.
- `CLAUDE.md` re-read: no references to `HomeProfile`, profile tabs, or `home` collection unless those still exist.

## Out of scope

- Pushing the branch / opening PR — Jen's call, do not push without explicit request.
- Merging to main — never on this branch.
