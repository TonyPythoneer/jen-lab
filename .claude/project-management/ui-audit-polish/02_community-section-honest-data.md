# 02 — Remove Fake Community Follower Counts

## Problem

`SectionCommunity.vue` shows three stat pills: Threads 3.6K / RSS 2.7K / Email 1.1K.
These are placeholder numbers. On a real personal site they look dishonest to any visitor
who checks.

## Plan

1. Replace the three count pills with simple social-link buttons (no fake numbers).
   Pull the real contacts list from `appConfig.contacts` (same source as Footer / SectionContact).
   → verify: section renders real social links without any fabricated counts
2. Optionally keep the "312 readers · 0 spam" subscriber count in the email form only
   if it's a real number — otherwise remove it.
   → verify: no fabricated statistics remain on the page

## Success criteria

- No fake follower/subscriber numbers displayed
- Social links still present, styled consistently
- `vp check` passes
