# jen-lab

A modern Nuxt/Vue web application deployed on Cloudflare Pages.

"Jen Lab" is a personal content platform built as a frontend engineering practice project focused on AI-assisted development workflows, frontend performance optimization, and headless CMS integration.

## Features

- CMS-driven homepage content
- Interactive restaurant map browsing
- WordPress-powered blog platform
- Responsive UI with Nuxt UI + Tailwind CSS
- Cloudflare Pages deployment

---

# Technical Highlights

## Performance Optimization

Implemented several frontend optimizations to reduce unnecessary client-side overhead:

- Dynamic import splitting for heavy third-party libraries such as Leaflet
- Shifted markdown rendering from runtime to build-time processing
- Reduced frontend bundle size from ~4MB to ~1MB
- Simplified DOM structure and CSS usage to improve maintainability and rendering efficiency

## Headless CMS Architecture

The project uses WordPress purely as a content API source instead of relying on WordPress themes or frontend rendering.

Benefits include:

- Fully customized frontend UI
- Consistent styling with Tailwind CSS and Nuxt UI
- Clear separation between content management and frontend engineering

## CMS-driven Content Management

Homepage content is structured to allow non-technical users to:

- update layouts
- manage homepage sections
- edit content without writing code

This helps reduce long-term engineering maintenance overhead.

---

# Stack

## Frontend

- Nuxt 4
- Vue 3
- TypeScript
- @nuxt/ui v4
- Tailwind CSS v4

## Infrastructure

- Cloudflare Pages

## Content / CMS

- WordPress REST API
- Markdown-based configuration

## Map

- Leaflet

---

# Development

## Run locally

```bash
pnpm install
pnpm dev
```

Local server:

```txt
http://localhost:3000
```

## Production Build

```bash
pnpm build
```

## Deploy

```bash
pnpm deploy
```
