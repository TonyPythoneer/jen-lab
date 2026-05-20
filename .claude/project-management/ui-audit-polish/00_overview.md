# UI Audit Polish

Quick brief: fix real UX/content problems found in full-site code review + Playwright visual
audit on 2026-05-20. All tasks are sequential and independent (no cross-task deps).

## Tasks

- [ ] 01 — Deduplicate newsletter (3 forms → 1); remove Community subscribe card
- [ ] 02 — Remove fake community follower counts (3.6K / 2.7K / 1.1K + "312 readers")
- [ ] 03 — Fix SectionBringing right card: content must react to active accordion item [NEW BUG]
- [ ] 04 — Fix "More is more" text collision (ProductDots badge vs Features heading)
- [ ] 05 — Rewrite SectionProductDots copy for personal site (or remove section)
- [ ] 06 — Make Hero "New post" badge dynamic (WP API, needs custom EN formatter)
- [ ] 07 — Minor fixes: marquee v-if bug + SectionBuiltOn highlight → `highlight` field
