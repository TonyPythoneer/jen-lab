# 06 — Two Feature Blocks (UPageFeature ×2)

Caldera ref: two large feature panels with text + abstract pixel graphic side-by-side.

## Goals

- Two `<UPageFeature>` instances in `app/pages/index.vue`. No `Feature.vue` wrapper.
- Two new SVG files: `app/components/home/HarbourBridgeSvg.vue`, `app/components/home/WaveSvg.vue`.

## Composition

```vue
<!-- Feature 1 — Workshop -->
<UPageFeature
  orientation="horizontal"
  :ui="{
    root: 'bg-ash-white rounded-card p-10 md:p-14',
    title: 'font-display tracking-[0.02em] leading-[0.95] text-4xl md:text-5xl text-abyssal-ink',
    description: 'text-abyssal-ink/80 mt-4 max-w-prose',
  }"
>
  <template #leading>
    <span class="text-cyber-violet text-sm uppercase tracking-widest">Workshop</span>
  </template>
  <template #title>The Workshop Where Ideas Get Forged.</template>
  <template #description>
    Quiet bench, sharp tools, lots of half-finished prototypes. The point isn't the artefact,
    it's the muscle memory of shipping small things.
  </template>
  <template #default>
    <HomeHarbourBridgeSvg class="w-full aspect-square" aria-hidden="true" />
  </template>
</UPageFeature>

<!-- Feature 2 — Reef -->
<UPageFeature orientation="horizontal" reverse :ui="{ ...sameAsAbove }">
  <template #leading>
    <span class="text-cyber-violet text-sm uppercase tracking-widest">Reef</span>
  </template>
  <template #title>Stitched To The Wider Reef.</template>
  <template #description>
    Everything links to everything: blog references restaurants, restaurants reference walks,
    walks reference notes. One site, lots of currents.
  </template>
  <template #default>
    <HomeWaveSvg class="w-full aspect-square" aria-hidden="true" />
  </template>
</UPageFeature>
```

If `UPageFeature` slot names differ (`leading` vs `eyebrow`, `default` vs `figure`), correct after reading `node_modules/@nuxt/ui/dist/runtime/components/PageFeature.vue`.

## SVGs

- `HarbourBridgeSvg.vue`: single span arc (Cyber Violet stroke), two pylons (Abyssal Ink rectangles, slightly rounded), Pixel Glare suspension dots along the arc.
- `WaveSvg.vue`: three stacked rounded wave bands — Cyber Violet, Digital Orange, Pure White (outlined Abyssal Ink). Like overlapping eyebrows.

Both accept `class` prop; root `<svg>` spreads `$attrs`.

## Files touched

- New: `app/components/home/HarbourBridgeSvg.vue`, `app/components/home/WaveSvg.vue`.
- Edit: `app/pages/index.vue`.
- Edit: `app/pages/styleguide.vue` — replace `HarbourBridgeSvg` and `WaveSvg` placeholder cells with real components.

## Verification

- Two cards stacked, 40px gap.
- Desktop ≥1024px: text/svg side-by-side; second block reversed (svg left).
- Mobile: stacked, text first.
- SVGs preserve aspect ratio (`aspect-square` keeps box).

## Out of scope

- Scroll animation — task 14.
