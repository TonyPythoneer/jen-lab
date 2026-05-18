# 07 — Use-Case Tabs (UTabs)

Caldera ref: tabbed section with one large visual per tab.

## Goals

- Compose `<UTabs>` inline in `app/pages/index.vue`. No wrapper.
- One shared SVG file with `kind` prop: `app/components/home/GlyphSvg.vue` (kinds: `gum-leaf | terminal | book | compass`).

## Adapted categories

| Tab value | Label   | Headline                                | Body                                                        | Glyph    |
| --------- | ------- | --------------------------------------- | ----------------------------------------------------------- | -------- |
| `food`    | Food    | "Sydney's best plates, mapped."         | placeholder + CTA → `/my-best-restaurants-search-in-sydney` | gum-leaf |
| `code`    | Code    | "Side-projects, half-broken and proud." | placeholder + GitHub link                                   | terminal |
| `writing` | Writing | "Notes from the workbench."             | placeholder + scroll-to-blog                                | book     |
| `wander`  | Wander  | "Trails, harbours, weekend escapes."    | placeholder, no CTA                                         | compass  |

## Composition

```vue
<div class="bg-ash-white rounded-card p-10">
  <UTabs
    :items="useCaseItems"
    color="primary"
    variant="pill"
    :ui="{ list: 'rounded-button', trigger: 'rounded-button' }"
  >
    <template #content="{ item }">
      <div class="grid md:grid-cols-2 gap-10 items-center mt-10">
        <div>
          <h3 class="font-display tracking-[0.02em] leading-[0.95] text-4xl md:text-5xl text-abyssal-ink">
            {{ item.headline }}
          </h3>
          <p class="text-abyssal-ink/80 mt-4 max-w-prose">{{ item.body }}</p>
          <UButton
            v-if="item.cta"
            color="neutral"
            variant="outline"
            :ui="{ base: 'rounded-button mt-6' }"
            :to="item.cta.to"
          >
            {{ item.cta.label }}
          </UButton>
        </div>
        <HomeGlyphSvg :kind="item.glyph" class="w-full aspect-square" aria-hidden="true" />
      </div>
    </template>
  </UTabs>
</div>
```

```ts
const useCaseItems = [
  {
    label: "Food",
    value: "food",
    headline: "Sydney's best plates, mapped.",
    body: "...",
    glyph: "gum-leaf",
    cta: { label: "Open Map", to: "/my-best-restaurants-search-in-sydney" },
  },
  {
    label: "Code",
    value: "code",
    headline: "Side-projects, half-broken and proud.",
    body: "...",
    glyph: "terminal",
    cta: { label: "See GitHub", to: "https://github.com/tonypythoneer" },
  },
  {
    label: "Writing",
    value: "writing",
    headline: "Notes from the workbench.",
    body: "...",
    glyph: "book",
    cta: { label: "Read Blog", to: "#blog" },
  },
  {
    label: "Wander",
    value: "wander",
    headline: "Trails, harbours, weekend escapes.",
    body: "...",
    glyph: "compass",
  },
];
```

## SVG — `app/components/home/GlyphSvg.vue`

Single component, prop-driven:

```vue
<script setup lang="ts">
defineProps<{
  kind: "gum-leaf" | "terminal" | "book" | "compass" | "coffee" | "surf" | "ferris" | "sail";
}>();
// switch on kind, render different <path>/<g> inside a shared <svg viewBox="0 0 200 200">
</script>
```

Note: includes `coffee | surf | ferris | sail` upfront because tasks 08 (testimonials) and 11 (footer) will need them. One file > four files.

## Files touched

- New: `app/components/home/GlyphSvg.vue`.
- Edit: `app/pages/index.vue`.
- Edit: `app/pages/styleguide.vue` — replace 8 `GlyphSvg` placeholder cells (one per `kind`) with real component.

## Verification

- Tabs switch on click; only one panel visible.
- Keyboard arrow-left/right cycles tabs.
- Active tab visually highlighted (Digital Orange).
- Mobile: tabs scroll horizontally if overflow.

## Out of scope

- Custom panel transition — task 14.
