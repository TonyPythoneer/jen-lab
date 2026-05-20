# 11 — [Caldera gap] Stats cards: gap → connected band with dividers

## WHY

Caldera's stat row reads as one unified orange band separated by thin white lines.
jen-lab uses `gap-2.5` between cards — they feel like 4 separate pills, less cohesive.
Playwright `04_stats.png` confirms.

## WHAT was observed

`app/components/home/SectionStats.vue`:

```vue
<div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
  <div v-for="s in stats" class="rounded-card p-8 md:p-10 flex flex-col gap-6 min-h-[240px] ...">
```

Grid is responsive: 1 col (mobile) → 2 col (sm) → 4 col (lg).

## HOW (exact steps)

1. Remove `gap-2.5` from the grid wrapper.
2. Add `border-r border-pure-white/20` to each card **except the last** on desktop.
   On 2-col and 1-col layouts, use `border-b` instead to avoid dangling right borders.
   Implementation using index:
   ```vue
   :class="{ 'lg:border-r lg:border-b-0 border-b border-pure-white/20': i < stats.length - 1 }"
   ```
   This gives right-border on lg (4 col), bottom-border on sm (2 col) and mobile (1 col)
   for all cards except the last, which gets no border.
3. Remove `rounded-card` from individual cards and apply it only to the grid wrapper so
   the band reads as one unit with rounded outer corners.
   Add `rounded-card overflow-hidden` to the `<div class="w-full grid ...">`.

### RESPONSIVE RISK (pre-identified)

Without careful breakpoint handling, `border-r` appears as a vertical line mid-row on 2-col layout.
The HOW above addresses this with `lg:border-r lg:border-b-0 border-b` pattern.

## VERIFY

- `vp check` passes
- Playwright `04_stats.png` re-run (1440px): 4 cards form one connected orange band
- Playwright mobile re-run (390px): cards stack with horizontal dividers, no stray borders
