# 04 — Make Hero "New Post" Badge Dynamic

## Problem

`SectionHero.vue` line 31: hardcoded `"New post · 18 May 2026"`.
This date will go stale immediately and requires manual updates.

## Plan

1. Fetch the latest WP post date using the existing `fetchPosts` utility
   (`useLazyAsyncData`, `server: false` — consistent with CLAUDE.md data-fetching rules).
2. Format as "New post · DD MMM YYYY" using existing `formatDate` from `~/utils/wpApi`.
3. Hide the badge until data resolves (no skeleton needed — just `v-if="latestPost"`).
   → verify: badge shows real date when WP API returns; badge absent if API fails

## Success criteria

- Badge date comes from live WP API, not hardcoded string
- No layout shift (badge is `hidden md:flex` — off-screen on mobile)
- `vp check` passes
