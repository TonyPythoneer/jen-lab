# 14 — Responsive Polish & Micro-interactions

Final visual pass before cleanup. Everything functional after task 11 — this is the "make it feel better" sweep.

## Goals

- Walk the page at 4 breakpoints in DevTools (375 / 768 / 1024 / 1440 px) and fix obvious issues.
- Add tasteful micro-interactions.
- Run `vp check` (lint + format + typecheck) and `vp test`.

## Checklist

### Responsive

- [ ] Nav burger drawer animates open/close.
- [ ] Hero SVG hides or shrinks at <640px so it never collides with headline.
- [ ] Stats grid: 4→2→1 column transitions clean.
- [ ] Features: text/svg stack order correct on mobile (svg below text on both blocks).
- [ ] Use-case tabs scroll horizontally if labels overflow.
- [ ] Blog cards: 5→3→1, last cards do not stretch.
- [ ] Newsletter form stacks at <768px.
- [ ] Footer columns collapse to 2.
- [ ] No horizontal scroll at 375px (check `document.documentElement.scrollWidth`).

### Micro-interactions

- [ ] All buttons: 150ms ease-out background transition.
- [ ] All cards: 200ms `scale-[1.005]` on hover.
- [ ] Hero CTAs: arrow icon `translate-x-1` on hover.
- [ ] Stat numbers: optional count-up on intersection (only if budget allows — `useIntersectionObserver` from VueUse, 800ms ease-out).
- [ ] Tab switch: 200ms fade between panels.
- [ ] Reduced motion: wrap motion in `@media (prefers-reduced-motion: no-preference)`.

### Type/visual hygiene

- [ ] Tabular numerals on every numeric display (`font-variant-numeric: tabular-nums`).
- [ ] Display headings: `font-feature-settings: "ss06", "ss10"` per DESIGN.md (substitute font ignores these but keep the declaration documented).
- [ ] Optical alignment: pull stat numbers up by 0.05em via `line-height: 0.94`.
- [ ] Image-area placeholders in blog cards have a 1px `Abyssal Ink/10` inset border.

### Accessibility

- [ ] All decorative SVGs `aria-hidden="true"`.
- [ ] Newsletter input has visible focus ring (Pure White, 2px offset).
- [ ] Nav skip-link to `#main`.
- [ ] Color contrast checked for Pure White on Cyber Violet (passes AA at body sizes).

### Verification commands

```bash
vp check
vp test
pnpm dev   # smoke at all breakpoints
```

## Out of scope

- Lighthouse / perf budget tuning.
- E2E tests for the new components.
