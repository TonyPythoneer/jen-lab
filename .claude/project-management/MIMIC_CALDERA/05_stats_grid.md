# 05 — Stats Grid (UPageGrid + UPageCard)

Caldera ref: 4 cards in a row with big numbers, alternating Digital Orange / Ash White backgrounds.

## Goals

- Compose `<UPageGrid>` + 4× `<UPageCard>` inline in `app/pages/index.vue`. No custom wrapper.

## Composition

```vue
<!-- Stats -->
<UPageGrid :ui="{ root: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5' }">
  <UPageCard
    v-for="(stat, i) in stats"
    :key="stat.label"
    :variant="i % 2 === 0 ? 'solid' : 'subtle'"
    :color="i % 2 === 0 ? 'primary' : 'neutral'"
    :ui="{
      root: 'rounded-card p-10',
      title: 'font-display tracking-[0.02em] leading-[0.94] text-6xl md:text-7xl tabular-nums',
      description: 'text-base mt-2',
    }"
  >
    <template #title>{{ stat.value }}</template>
    <template #description>{{ stat.label }}</template>
  </UPageCard>
</UPageGrid>
```

```ts
const stats = [
  { value: "5y", label: "Years tinkering" },
  { value: "120+", label: "Restaurants logged" },
  { value: "30+", label: "Blog posts drafted" },
  { value: "1", label: "Harbour called home" },
];
```

## Color variant choice

- `variant="solid" color="primary"` → Digital Orange card, Pure White text (Nuxt UI inverts text on solid).
- `variant="subtle" color="neutral"` → Ash White-ish card, Abyssal Ink text. If `subtle/neutral` produces wrong shade, override via `:ui="{ root: 'bg-ash-white text-abyssal-ink rounded-card p-10' }"`.

Inspect `node_modules/@nuxt/ui/dist/runtime/components/PageCard.vue` for the exact variant→class map before coding; adjust if mismatch.

## Files touched

- Edit: `app/pages/index.vue`. No new files.

## Verification

- 4 cards visible, alternating colors.
- Numbers in Bebas Neue, tabular numerals (`120+` and `30+` align cleanly).
- Breakpoints: 4 → 2 → 1 columns.
- DevTools: `border-radius: 40px`, `padding: 40px`.

## Out of scope

- Count-up animation — task 14.
