---
name: 13-validation
description: Manually verify every page + run the toolchain checks before declaring done.
---

# 13 — Validation

## Goal

Confirm the whole integration works in a real browser and passes the toolchain, then clean up PM files.

## Why (reasoning chain)

- Type-checks prove code compiles, not that the feature is correct. This is a UI change → it must be SEEN
  working (CLAUDE.md UI rule). Goal-driven: define checks, loop until all pass (Karpathy §4).

## Steps

1. `pnpm dev`; open `http://localhost:3000`. Walk the homepage: Hero (dual identity, CTAs route),
   Directions (correct girl per card, links), New product (banner + buy), Subscribe (opens Kit),
   Support (warm tone, link works). Check mobile width (drawer nav, stacked cards, no clipped images).
2. Visit `/jen-knows`: header, portals, 4 videos (modal plays), 2 products (collapse + buy). Caldera styled.
3. Visit `/jen-liu`: header, 3 products, galleries (zoom modal). Single-tab header renders cleanly.
4. Nav: all 5 items resolve; header CTA → Kit; `/about` → 404; no console errors on any page.
5. Run `vp check` (lint + format + typecheck) and `vp test`; fix anything that fails.
6. Grep for orphans: deleted components, `useNewsletterSubscribe`, `/about` links — none should remain.

## Acceptance criteria

- All pages render correctly in browser (desktop + mobile), no console errors.
- `vp check` and `vp test` pass.

## Final step (per work guideline lifecycle)

- After all boxes in `00_overview.md` are ticked and validation passes, the FINAL commit deletes this whole
  `.claude/project-management/dual-identity-site/` folder (PM files are scaffolding, not shipped artifacts).
