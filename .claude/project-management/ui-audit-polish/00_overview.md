# UI Audit Polish

jen-lab is modelled on caldera.xyz. Tasks fix real UX/content problems found via:
(1) full-site code review, (2) Playwright visual audit, (3) caldera.xyz design comparison.
Done on 2026-05-20.

## Validation command

`vp check` = runs `pnpm lint` + `pnpm typecheck` in one pass (defined in viteplus.dev toolchain).
Every task lists this as the final verify step.

## Tasks (sequential, no cross-task deps unless noted)

- [x] 01 — Deduplicate newsletter: 3 forms → 1; extract `useNewsletterSubscribe`
- [x] 02 — Remove fake data: communityPills counts + "312 readers" in 3 files
- [x] 03 — Fix SectionBringing right card: static → reactive to active accordion item [BUG]
- [x] 04 — Fix "More is more" text collision: ProductDots badge changed to "A living experiment"
- [x] 05 — Rewrite SectionProductDots copy: "Always In Progress." + visitor-friendly body
- [x] 06 — Hero "New post" badge now dynamic via WP API with EN date formatter (`badgeDate`)
- [x] 07 — Minor fixes: marquee v-if `length - 1` + SectionBuiltOn `highlight: true` data field
- [x] 08 — [Caldera gap] VOID — outline buttons already use UButton default 1px border; no action needed
- [x] 09 — [Caldera gap] VOID — SectionCommunity email input removed in Task 01; no ring to fix
- [x] 10 — [Caldera gap] Mobile hero: "About Jen" hidden on mobile (`hidden sm:inline-flex`)
- [x] 11 — [Caldera gap] Stats cards: connected orange band with responsive white dividers

## Verified facts (do not re-derive)

- `border-2` in codebase: ONLY `SectionBlog.vue:93` (blog card image border — intentional). NOT on any outline button.
- SectionBuiltOn highlight: uses `:class` (dynamic) correctly — Opus initially misread as static `class`.
- `vp check` is the single validation command for all tasks.
