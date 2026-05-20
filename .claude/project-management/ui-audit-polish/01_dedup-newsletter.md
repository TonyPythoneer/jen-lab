# 01 — Deduplicate Newsletter Form

## Problem

`subscribeEmail` ref + `onSubscribe()` defined identically in three components:

- `app/components/home/SectionCommunity.vue`
- `app/components/home/SectionContact.vue`
- `app/components/home/SectionNewsletter.vue`

The page also shows newsletter CTAs three times (Community → Contact → Newsletter in sequence),
which is a UX dead-end — users see the same ask three times before the footer.

## Plan

1. Extract shared subscribe logic into `app/composables/useNewsletterSubscribe.ts`
   → verify: each component compiles and calls the same toast behavior
2. Remove `SectionNewsletter` from `app/pages/index.vue` (it is redundant; SectionContact
   already ends the page with a newsletter form)
   → verify: `vp check` passes, page still renders Contact + Footer

## Success criteria

- `subscribeEmail` + `onSubscribe` defined in exactly one place
- `<HomeSectionNewsletter />` removed from index.vue
- `vp check` passes
