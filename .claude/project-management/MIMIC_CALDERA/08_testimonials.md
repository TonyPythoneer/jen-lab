# 08 — Testimonials (UPageColumns + UPageCard)

Caldera ref: row of testimonial cards — logo + quote + attribution.

## Goals

- Compose `<UPageColumns>` + 3× `<UPageCard>` inline in `app/pages/index.vue`. No wrapper.
- Reuse `<HomeGlyphSvg>` (built in task 07) with kinds `coffee | surf | ferris`.

## Composition

```vue
<section class="space-y-10">
  <h2 class="font-display tracking-[0.02em] leading-[0.95] text-center text-4xl md:text-5xl text-abyssal-ink">
    Echoes From The Harbour.
  </h2>

  <UPageColumns :ui="{ root: 'columns-1 md:columns-3 gap-2.5' }">
    <UPageCard
      v-for="(t, i) in testimonials"
      :key="t.name"
      :variant="i === 1 ? 'solid' : 'subtle'"
      :color="i === 1 ? 'secondary' : 'neutral'"
      :ui="{ root: 'rounded-card p-10 break-inside-avoid mb-2.5' }"
    >
      <template #leading>
        <HomeGlyphSvg :kind="t.glyph" class="w-10 h-10" aria-hidden="true" />
      </template>
      <template #description>
        <p class="italic text-base">"{{ t.quote }}"</p>
        <p class="mt-4 text-sm font-medium">— {{ t.name }}, {{ t.org }}</p>
      </template>
    </UPageCard>
  </UPageColumns>
</section>
```

```ts
// NOTE: All testimonials below are fictional placeholders. Replace with real quotes before any public deploy.
const testimonials = [
  {
    name: "Skye Harbour",
    org: "Beachside Studio",
    quote: "Felt like a stroll along the foreshore — knew exactly where I was going.",
    glyph: "coffee" as const,
  },
  {
    name: "Mateo Bondi",
    org: "Night Owl Café",
    quote: "Stumbled across this site at 2am and bookmarked half of it.",
    glyph: "surf" as const,
  },
  {
    name: "Inga Pylon",
    org: "Local Cyclist",
    quote: "Reminds me of the harbour bridge: bold, useful, hard to miss.",
    glyph: "ferris" as const,
  },
];
```

Middle card uses `solid + secondary` → Cyber Violet background, Pure White text, matching Caldera's accent-in-a-row pattern.

## Files touched

- Edit: `app/pages/index.vue`. No new files (GlyphSvg already exists from task 07).

## Verification

- 3 cards in a row at ≥768px.
- Middle card violet, outer cards Ash White-ish.
- Italic quote, weight-500 attribution.
- Mobile: single column stack.

## Out of scope

- Carousel — grid is enough for landing parity.
