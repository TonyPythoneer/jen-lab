# 04 — Hero (UPageHero + OperaHouseSvg)

Most prominent section. Caldera ref: full-width hero card with massive headline + sub + 2 CTAs + background pixel graphic.

## Goals

- Compose `<UPageHero>` directly inside `app/pages/index.vue`.
- Build sole custom file: `app/components/home/OperaHouseSvg.vue` (decorative artwork — no library ships it).

## Composition (in `app/pages/index.vue`)

```vue
<UPageHero
  :ui="{
    root: 'bg-ash-white rounded-card overflow-hidden relative',
    container: 'p-10 md:p-16',
    title:
      'font-display tracking-[0.02em] leading-[0.94] text-5xl md:text-7xl xl:text-9xl text-abyssal-ink',
    description: 'text-base md:text-lg text-abyssal-ink/80 max-w-prose',
  }"
  orientation="horizontal"
>
  <template #headline>
    <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button' }">
      Sydney → World
    </UBadge>
  </template>
  <template #title>The Living Lab Of Jen.</template>
  <template #description>
    A personal sandbox where ideas, restaurants and writing share one harbour.
    Brewed in Sydney, served everywhere.
  </template>
  <template #links>
    <UButton color="primary" size="xl" :ui="{ base: 'rounded-button' }" to="/my-best-restaurants-search-in-sydney">
      Explore Restaurants
    </UButton>
    <UButton color="neutral" variant="outline" size="xl" :ui="{ base: 'rounded-button' }" to="#blog">
      Read Blog
    </UButton>
  </template>
  <template #default>
    <HomeOperaHouseSvg class="w-full h-auto md:max-w-[640px] md:absolute md:right-0 md:bottom-0" aria-hidden="true" />
  </template>
</UPageHero>
```

(Slot names verified against `node_modules/@nuxt/ui/dist/runtime/components/PageHero.vue` before coding — if slot names differ, adjust then.)

## Custom SVG — `app/components/home/OperaHouseSvg.vue`

Pure presentational. Single `<svg viewBox="0 0 800 500">`:

- Sail 1 (back, largest): `<path fill="var(--color-cyber-violet)" d="...">` — rounded curve.
- Sail 2 (mid): `<path fill="var(--color-digital-orange)" d="...">`.
- Sail 3 (front): `<path fill="var(--color-pure-white)" stroke="var(--color-abyssal-ink)" stroke-width="4" d="...">`.
- Water dots: 8× `<circle r="6" fill="var(--color-pixel-glare)">` along bottom edge.

Accepts `class` via `defineProps<{ class?: string }>()`; root `<svg>` spreads `$attrs`.

## Files touched

- New: `app/components/home/OperaHouseSvg.vue`.
- Edit: `app/pages/index.vue` — add hero block.
- Edit: `app/pages/styleguide.vue` — replace `OperaHouseSvg` placeholder cell in "Decorative SVGs" grid with real component.

## Verification

- Hero card visible at top of page, `Ash White` background, 40px radius.
- SVG visible behind/beside headline. Not clipped on desktop (≥1024px).
- Both CTAs render as pills (border-radius ≈ 800px).
- Mobile 375px: SVG either hidden (`md:` prefix removes from flow) or shrunk into header strip; headline does not overflow.

## Out of scope

- Stats / features / animations.
