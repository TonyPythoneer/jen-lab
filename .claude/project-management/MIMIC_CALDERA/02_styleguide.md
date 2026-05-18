# 02 — Styleguide Page (`/styleguide`)

Standalone visual catalogue of every Nuxt UI primitive themed with Caldera tokens, plus every custom decorative SVG. Built right after foundation so Jen can validate the look before any landing-section composition begins.

## Goals

- New route `/styleguide` at `app/pages/styleguide.vue`.
- No default layout chrome — uses `definePageMeta({ layout: false })` so components render in isolation against `Basalt Canvas`. Minimal in-page sticky table-of-contents for navigation.
- Always shipped (production-accessible). Living spec, not a dev fixture.
- Renders every Nuxt UI primitive in every variant Caldera needs, plus a grid of all decorative SVGs built later in the project. Build SVG slots now as placeholders (empty `<div class="aspect-square bg-cyber-violet/10 rounded-card">`) — replace with real SVG imports as each gets authored in tasks 04 / 06 / 07.

## Sections (in order on the page)

```
H1  "Jen Lab — Styleguide"
H2  Tokens
      - Color swatches (7 chips) with name + hex + role
      - Spacing scale (4 / 8 / 9 / 10 / 12 / 16 / 18 / 20 / 24 / 32 / 40 / 48 / 56 / 64 / 80 / 92) as horizontal bars
      - Radius scale (16 / 20 / 24 / 32 / 40 / 100 / 800) as labelled rounded squares
      - Type scale (body-sm / body / subheading / heading-sm / heading / display) — each rendered at actual size
H2  Buttons
      - Primary pill (sm / md / lg / xl, default / loading / disabled)
      - Secondary (variant=outline, color=neutral)
      - Ghost (variant=ghost)
      - Soft (variant=soft, color=secondary)
      - Icon button (square, 40×40, rounded-card)
H2  Form
      - UInput (pill, with leading icon, with placeholder, with error)
      - UFormField (with label, with hint, with error)
      - UCheckbox, URadioGroup, USwitch — default styling
      - UTextarea, USelect — default styling
H2  Feedback
      - UBadge (solid / soft / outline × primary / secondary / neutral)
      - UBanner (warning, info, success — Caldera palette adapted)
      - UAlert (terse / verbose)
      - Toast trigger button → useToast().add({...}) → live demo
H2  Overlays
      - UTooltip on a button
      - UModal open trigger
      - UDrawer open trigger
H2  Navigation
      - UTabs (3 variants: pill, link, default)
      - UAccordion
      - UBreadcrumb
      - UPagination
H2  Page primitives
      - UPageHero (compact + full)
      - UPageCard (solid primary / subtle neutral / outline)
      - UPageFeature (horizontal + reverse)
      - UPageColumns (3-up)
      - UPageGrid (4-up)
      - UPageCTA (compact band)
      - UPageSection (centered)
      - UPageHeader (with eyebrow + description)
      - UPageLogos (placeholder logos = small SVG glyphs)
      - UPageList (vertical link list)
      - UPageAnchors (anchor list)
H2  Content
      - UBlogPosts grid of 3 UBlogPost cards (placeholder data)
      - UMarquee with 5 placeholder strings
      - UCarousel with 3 placeholder slides
H2  Decorative SVGs (placeholder grid until tasks fill them in)
      - 4-col grid, one cell per: OperaHouseSvg, HarbourBridgeSvg, WaveSvg, GlyphSvg×8 kinds (gum-leaf, terminal, book, compass, coffee, surf, ferris, sail), KoalaSvg.
      - Each cell: label + the SVG (or placeholder rectangle if not yet built).
```

## Implementation notes

- Wrap whole page in `<div class="bg-basalt-canvas min-h-screen px-4 py-10"><div class="container mx-auto max-w-[1200px] space-y-16">...`.
- Each H2 section: `<section :id="kebab-case-name" class="space-y-6">` so the TOC can anchor.
- Sticky in-page TOC: small fixed-position `<nav>` on left at xl breakpoint; collapses to top accordion on mobile. Use anchor links to section IDs.
- `useSeoMeta({ title: 'Styleguide — Jen Lab', robots: 'noindex' })`. Page is useful but should not appear in search.
- For Toast demo: place a `<UButton @click="toast.add({ title: 'Saved', description: 'Placeholder toast', color: 'primary' })">Trigger toast</UButton>`. Requires `<UApp>` ancestor — wrap page contents in `<UApp>` since default layout is off.

## Why `layout: false`?

Goal of this page = see components without the distraction of nav/footer. The landing pages (tasks 04–13) use the default layout. Once the styleguide validates the visual vocabulary, Jen knows what the composed pages will inherit.

## Files touched

- New: `app/pages/styleguide.vue`.
- No new components. No SVGs built yet — placeholder cells.

## Verification

- `pnpm dev` → http://localhost:3000/styleguide renders without console error.
- Page scrollable; sticky TOC works.
- Every section has visible content (no empty sections).
- Color swatch hex matches `theme.css` exactly (sanity check for task 01).
- Toast button triggers a toast that auto-dismisses.
- `robots` meta = `noindex` (View Source check).

## Out of scope

- Real SVG art — built in later tasks; placeholder rectangles now.
- Mobile-first polish — task 14 sweep covers it.
- Linking from main nav — `/styleguide` is intentionally only reachable by direct URL.
