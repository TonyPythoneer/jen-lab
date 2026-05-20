# 05 — Minor Bug Fixes

## Problems

### A. Marquee dot always shows on last item

`SectionHero.vue` line 103:

```vue
<span class="size-1.5 rounded-full bg-cyber-violet" v-if="i < marqueeStrings.length" />
```

`i < marqueeStrings.length` is always true (indices 0…n-1 are all < n).
Last item should have no trailing dot.
Fix: `v-if="i < marqueeStrings.length - 1"`

### B. SectionBuiltOn hardcoded highlight index

`SectionBuiltOn.vue`: accent cards selected by `i === 0 || i === 5`.
This breaks silently if the `builtOn` array order changes.
Fix: add an `accent: true` field to the two items that should be highlighted,
and use `t.accent` in the class binding.

## Plan

1. Fix marquee v-if condition → verify: last marquee item has no trailing dot
2. Add `highlight` boolean to builtOn items; replace index check with `t.highlight`
   → verify: same two cards are still violet; array reorder won't break it

## Success criteria

- Both bugs fixed
- No visual change from the user's perspective
- `vp check` passes
