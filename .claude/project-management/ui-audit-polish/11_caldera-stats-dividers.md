# 11 — [Caldera gap] Stats cards: gap → divider lines

## Problem

Caldera's 4 stat cards are separated by thin vertical divider lines, making the row feel like
one connected unit. jen-lab uses `gap-2.5` between individual cards — they feel like 4 separate
pills rather than one banded row.

## Plan

1. Remove `gap-2.5` from the stats grid.
2. Add a right border (`border-r border-pure-white/20`) to each card except the last.
   Use `v-for` index: `:class="i < stats.length - 1 ? 'border-r border-pure-white/20' : ''"`.
3. Adjust padding so cards don't feel squished edge-to-edge (keep `p-8 md:p-10`).
   → verify: 4 cards appear as one connected orange band with thin white separators

## Success criteria

- Stats row reads as a single connected unit, not 4 separate cards
- Divider lines visible between cards, none on the last card
- `vp check` passes
