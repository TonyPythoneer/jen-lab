# 07 — Minor Bug Fixes

## Bug A: Marquee trailing dot always shows

### WHY

`v-if="i < marqueeStrings.length"` is always true for every index (0…n-1 are all < n).
Every item gets a trailing dot, including the last — visually an orphan dot after the final string.

### WHAT was observed

`app/components/home/SectionHero.vue` line 103:

```vue
<span class="size-1.5 rounded-full bg-cyber-violet" v-if="i < marqueeStrings.length" />
```

### HOW

Change to: `v-if="i < marqueeStrings.length - 1"`

### VERIFY

Playwright screenshot of hero marquee strip: last item has no trailing dot.

---

## Bug B: SectionBuiltOn hardcoded highlight index

### WHY

`i === 0 || i === 5` silently breaks if the `builtOn` array is reordered. Fragile by design.

### PRE-VERIFIED FACT

`:class` bindings in SectionBuiltOn.vue ARE dynamic (colon prefix). The highlight works today.
This fix is purely defensive — making it resilient to reordering.

### NAMING CONFLICT (important)

Each `builtOn` item already has `accent: "text-emerald-500"` for icon colour.
Do NOT add `accent: true` — it would overwrite the string. Use `highlight: true` instead.

### WHAT was observed

`app/components/home/SectionBuiltOn.vue`:

- Items at index 0 (Nuxt 4) and index 5 (Vite) are highlighted violet
- Three `:class` bindings use `i === 0 || i === 5` condition

### HOW

1. Add `highlight: true` to Nuxt 4 and Vite entries in the `builtOn` array (others get no `highlight` field, treated as falsy).
2. Replace all three `:class="i === 0 || i === 5 ? ... : ..."` with `:class="t.highlight ? ... : ..."`.

### VERIFY

- `vp check` passes
- Visual: same two cards (Nuxt 4 + Vite) violet; all others unchanged
