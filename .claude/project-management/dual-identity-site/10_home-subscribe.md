---
name: 10-home-subscribe
description: Replace the fake email form with a link/button to the external Kit subscribe page.
---

# 10 — Homepage §4: Subscription (external link)

## Goal

Rewrite `app/components/home/SectionNewsletter.vue` so the dark newsletter band keeps its look but the fake
email `<form>` is replaced by a single button linking to the Kit subscribe page.

## Why (reasoning chain)

- Owner decided: external link only, no backend (REFERENCE §1). The current `useNewsletterSubscribe`
  composable just fires a placeholder toast — a dead end. A real link is honest and zero-maintenance.
- Keep the band's visual design (dark `bg-abyssal-ink`, dots, Opera House watermark, headline) — surgical
  swap of the form only.

## Inputs / references

- File: `app/components/home/SectionNewsletter.vue`. Kit URL: `https://jen-nextsteps.kit.com/60463af80d`.
- Composable to retire: `app/composables/useNewsletterSubscribe.ts` (removed in cleanup task 12/13).

## Steps

1. Remove the `<input>` + `<form>` + `useNewsletterSubscribe()` usage.
2. Replace with a primary `UButton` (or styled `<a>`) → Kit URL, `target="_blank" rel="noopener"`, label
   訂閱電子報 (define URL/label as consts). Keep the headline + supporting 繁中 copy (one calm line).
3. Adjust copy so it no longer promises an in-page signup ("一鍵訂閱，到 Kit 完成").

## Acceptance criteria

- No email input remains; the button opens the Kit page in a new tab.
- `useNewsletterSubscribe` is no longer imported anywhere (verify with grep; actual file deletion in 13).

## Gotchas

- Other places might import the composable — grep before assuming this is the only consumer.
