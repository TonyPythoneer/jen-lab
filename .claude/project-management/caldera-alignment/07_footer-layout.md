# 07 — footer-layout

## What

Rewrite `app/components/site/Footer.vue` to match caldera `.foot` 5fr/7fr split:

Left card (`bg-abyssal-ink`, min-h-[360px], rounded-card, p-10):

- Brand mark + "jen-lab" wordmark (pure-white)
- Large display tagline: "Fastest-Growing Personal Site / On The Harbour."
- Primary CTA button: "Book A Hello →" (links to mailto or newsletter)

Right column (flex-col, gap-2.5):

- Socials row (task 08 handles the icon style)
- Ash-white nav card (task 09 handles the nav links)

Mobile (≤ md): single column — dark card, then socials, then nav card.

Reference: caldera `.foot`, `.foot__brand-card`, `.foot__right`.

## Verify

Footer shows 5fr/7fr split on desktop, stacks on mobile. Dark brand card on left with tagline and CTA.
