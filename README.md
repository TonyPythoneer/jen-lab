# jen-lab

A Vue 3 + Vite personal content platform on Cloudflare Pages — a frontend engineering practice ground for AI-assisted development, performance work, and headless CMS integration.

## Features

- CMS-driven homepage content, validated at build time (Velite)
- WordPress-powered blog via the headless REST API
- Interactive Sydney restaurant map (Leaflet) with canvas-rendered pins and a live ferry simulation
- Accessible UI on reka-ui headless primitives + Tailwind CSS v4
- Five routes prerendered with vite-ssg

---

# Technical Highlights

## Performance

- Every route prerenders via vite-ssg; the landing page ships ~85 KB (brotli).
- Heavy assets load lazily — Leaflet and the restaurant dataset stay out of route chunks.
- Build-time pipelines do the work once: markdown rendering, AVIF generation (each kept only when it beats its .webp), per-pack icon subsets for offline iconify, self-hosted brand fonts.
- The map draws all markers onto one canvas — a single compositor layer instead of 100+ DOM markers, so weak phone GPUs pan smoothly.

## Headless CMS

WordPress serves purely as a content API; the frontend is fully custom.

- Clear separation between content management and frontend engineering
- Homepage sections are editable without touching code
- Taxonomies sync into typed content collections (`pnpm sync:wp`)

## Dual SFC Compilers

The build runs on `@vitejs/plugin-vue`; the Rust compiler **vize** is wired behind a `VIZE` flag. A CI gate builds both and fails unless every route renders identical, real content — the flag cannot regress silently.

---

# Stack

| Layer          | Tech                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| Frontend       | Vue 3 · TypeScript · Vite+ (`vp`) · vite-ssg · Velite · reka-ui · Tailwind CSS v4 |
| Infrastructure | Cloudflare Pages                                                                  |
| Content / CMS  | WordPress REST API · Velite content collections                                   |
| Map            | Leaflet                                                                           |

---

# Development

```bash
pnpm install      # via Vite+ (vp)
pnpm dev          # http://localhost:3500
pnpm storybook    # component preview at :6006

pnpm check        # lint + format + typecheck
pnpm test         # Vitest

pnpm build        # production build
pnpm deploy       # build + deploy to Cloudflare Pages
```
