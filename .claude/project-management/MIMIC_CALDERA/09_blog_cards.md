# 09 — Blog Cards (UBlogPosts + UBlogPost)

Caldera ref: horizontal row of 5 blog preview cards (image + date + title + read-more).

## Goals

- Compose `<UBlogPosts>` + 5× `<UBlogPost>` inline in `app/pages/index.vue`. No wrapper.
- Use `<HomeGlyphSvg>` (built task 07) as the "image" tile per card — no real photography.

## Composition

```vue
<section id="blog" class="space-y-6">
  <div class="flex items-end justify-between">
    <h2 class="font-display tracking-[0.02em] leading-[0.95] text-4xl md:text-5xl text-abyssal-ink">
      Latest From The Notebook.
    </h2>
    <UButton color="neutral" variant="ghost" :ui="{ base: 'rounded-button' }" to="#blog">
      See all →
    </UButton>
  </div>

  <UBlogPosts :ui="{ root: 'grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2.5' }">
    <UBlogPost
      v-for="post in posts"
      :key="post.title"
      :title="post.title"
      :date="post.date"
      orientation="vertical"
      :ui="{
        root: 'bg-ash-white rounded-card overflow-hidden p-6',
        title: 'text-base font-bold line-clamp-2 mt-3',
        date: 'inline-block bg-pixel-glare text-abyssal-ink text-xs px-3 py-1 rounded-button',
      }"
    >
      <template #image>
        <div class="aspect-video w-full bg-cyber-violet/10 rounded-card flex items-center justify-center">
          <HomeGlyphSvg :kind="post.glyph" class="w-1/2 h-1/2" aria-hidden="true" />
        </div>
      </template>
    </UBlogPost>
  </UBlogPosts>
</section>
```

If `UBlogPost` does not expose `#image` slot or `date`/`title` props differ, read `node_modules/@nuxt/ui/dist/runtime/components/BlogPost.vue` and adjust.

```ts
// TODO: replace with real @nuxt/content blog collection once /blogs route is restored on this branch.
const posts = [
  {
    date: "2026-05-18",
    title: "What I learned from logging 100 Sydney restaurants.",
    glyph: "gum-leaf" as const,
  },
  {
    date: "2026-05-04",
    title: "Tinkering with Nuxt content collections in production.",
    glyph: "terminal" as const,
  },
  { date: "2026-04-19", title: "A weekend walk from Bondi to Coogee.", glyph: "compass" as const },
  {
    date: "2026-04-02",
    title: "Tabs, not stacks: a small UI rule that pays off.",
    glyph: "book" as const,
  },
  {
    date: "2026-03-21",
    title: "Why I rewrote my personal site for the fifth time.",
    glyph: "sail" as const,
  },
];
```

## Files touched

- Edit: `app/pages/index.vue`. No new files.

## Verification

- 5 cards at ≥1280px, 3 at tablet, 1 at mobile.
- Date pill renders Pixel Glare yellow.
- Title clamps to 2 lines.
- Tile glyph centered in 16:9 area.

## Out of scope

- Wiring to live `@nuxt/content` blog collection — schema absent in this branch; inline TODO comment in component.
