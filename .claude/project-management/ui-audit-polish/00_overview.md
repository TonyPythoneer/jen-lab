# UI Audit Polish

jen-lab is modelled on caldera.xyz. Tasks fix real UX/content problems found via:
(1) full-site code review, (2) Playwright visual audit, (3) caldera.xyz design comparison.
Done on 2026-05-20.

## Validation command

`vp check` = runs `pnpm lint` + `pnpm typecheck` in one pass (defined in viteplus.dev toolchain).
Every task lists this as the final verify step.

## Tasks (sequential, no cross-task deps unless noted)

- [ ] 01 — Deduplicate newsletter: 3 forms → 1; extract `useNewsletterSubscribe`
- [ ] 02 — Remove fake data: communityPills counts + "312 readers" in 3 files
- [ ] 03 — Fix SectionBringing right card: static → reactive to active accordion item [BUG]
- [ ] 04 — Fix "More is more" text collision: ProductDots badge vs Features heading
- [ ] 05 — Rewrite SectionProductDots copy (dev jargon → personal site voice); see candidate text in task file
- [ ] 06 — Make Hero "New post" badge dynamic via WP API (needs custom EN date formatter)
- [ ] 07 — Minor fixes: marquee v-if bug (line 103) + SectionBuiltOn `highlight` field rename
- [ ] 08 — [Caldera gap] VOID — outline buttons already use UButton default 1px border; SectionBlog border-2 is intentional card image styling, not a button. No action needed.
- [ ] 09 — [Caldera gap] Newsletter focus ring: SectionCommunity `ring-4` → `ring-2`
- [ ] 10 — [Caldera gap] Mobile hero: hide "About Jen" ghost button on mobile (`hidden sm:inline-flex`)
- [ ] 11 — [Caldera gap] Stats cards: gap-2.5 → connected band with responsive dividers

## Verified facts (do not re-derive)

- `border-2` in codebase: ONLY `SectionBlog.vue:93` (blog card image border — intentional). NOT on any outline button.
- SectionBuiltOn highlight: uses `:class` (dynamic) correctly — Opus initially misread as static `class`.
- `vp check` is the single validation command for all tasks.
