---
name: dual-identity-site-reference
description: Shared context every task in this folder relies on. Read this first.
---

# Shared Reference — Dual-Identity Site Integration

> Not a task. This is the shared knowledge base. Every numbered task assumes you have read this.
> It exists so any AI (or human) can pick up a single task file and execute it without re-deriving context.

## 0. The big picture (why this project exists)

The owner ("榛知 / Jen") is **one person with two public identities**:

- **Jen Knows** — career / workplace expertise in Australia (求職、職場文化、職涯諮詢).
- **Jen Liu** — travel writing (澳洲旅遊作家、雪梨美食).

The site already has TWO disconnected things that we are merging:

1. **The new visual layer ("new layout")** — a polished, Caldera-styled landing built from
   `app/components/home/Section*.vue` + `app/pages/index.vue`. BUT its copy is placeholder English
   ("The Living Lab Of Jen", fake testimonials/community/stats). Good design, fake content.
2. **The real content ("source")** — `content/home/jen-knows.md` + `content/home/jen-liu.md`,
   rendered by the now-dormant `app/pages_backup/index.vue` using an OLD teal/brutalist style
   (`rounded-4xl shadow-[6px_6px_0px_...]`, `bg-teal-*`). Real content, old look.

**Goal:** Pour the real content into the new visual language, split it into two destination pages
(Jen Knows / Jen Liu), and rebuild the homepage as a true front door to both. Drop the fake sections.
Remove `/about`.

## 1. Owner's confirmed decisions (do not re-litigate)

- **Language = 中英混搭 (mixed):** big display headings in English (Bebas Neue), body copy + CTAs in
  繁體中文 (台灣用語). The brand and audience are Chinese; the English is for visual punch only.
- **Subscription = external link only:** replace the fake email `<form>` with a button/link to the
  existing Kit page. Do NOT build a backend or an internal /subscribe page.
- **Direction pages keep ALL content blocks** (portals, videos, products, galleries) — only the
  styling is redesigned into Caldera.
- **Donate = ONE soft support section on the homepage.** Warm, low-pressure ("如果這些內容幫到你,
  可以請我喝杯奶茶"). Not a guilt trip, not a paywall.
- **No /about page.**

## 2. Design tokens (the "new layout" vocabulary — source of truth: `app/assets/css/`, `app/app.config.ts`)

Colors (Tailwind v4 custom tokens, light mode only):

- `digital-orange` = primary (accent, CTAs)
- `cyber-violet` = secondary (illustration cards)
- `abyssal-ink` = neutral (text, dark bands)
- `ash-white` = soft card surface
- `basalt-canvas` = page background (`app/layouts/default.vue`)
- `pure-white`, `pixel-glare` = supporting

Radii (semantic aliases in `main.css`): `rounded-card`, `rounded-button`, `rounded-input`.

Fonts (`@nuxt/fonts`, self-hosted): `font-display` = Bebas Neue, `font-sans` = Inter.

Heading pattern used everywhere:
`class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl ..."`

Nuxt UI color slots (`app/app.config.ts`): primary=digital-orange, secondary=cyber-violet,
neutral=abyssal-ink. `UButton color="neutral" variant="outline"` has a Caldera fill-on-hover override.

## 3. Content source (the data we are re-skinning)

- Collection `home`, schema in `content.config.ts`. Query via:
  `queryCollection("home").path("/home/jen-knows").first()` (and `/home/jen-liu`).
- Section discriminator is `section.component`, one of:
  `portal-list | youtube-carousel | image-carousel | product-list`.
- Product `description` is markdown; `descriptionHtml` is pre-rendered at build (markdown-it hook in
  `nuxt.config.ts`) — render it with `v-html`, ship no parser to client.
- `profile.tabs[]` = `{ label, bio }`; `profile.avatar`, `profile.name`.

## 4. Key assets & external links

- Hero illustration: `public/home/jen-on-home-page.origin.png` (1024×676). **Left** girl = raised hand
  = **Jen Knows**. **Right** girl = camera = **Jen Liu**. (Also a `.h168.png` thumbnail exists.)
- Avatars: `public/home/jen-knows/avatar.webp` (256²), `public/home/jen-liu/avatar.webp` (256×187).
- Product banners under `public/home/jen-knows/products/` and `public/home/jen-liu/products/`.
- Galleries under `public/home/jen-liu/galleries/`.
- **Subscribe (Kit):** `https://jen-nextsteps.kit.com/60463af80d`
- **Support / 奶茶 (Portaly):** Jen Knows `https://portaly.cc/jenknowsau/support`;
  Jen Liu `https://portaly.cc/jenliuau/support`
- The "new product" to spotlight on home = the Australia travel books in `content/home/jen-liu.md`
  (《雪梨 ...》 `sydney.webp`, and 《開始在澳洲自助旅行》).

## 5. Project coding rules that bite here (source: `CLAUDE.md`)

- **Data fetching: use `useLazyAsyncData` — NEVER `useAsyncData`** (it blocks the shell on slow nets).
- 2-space indent. No hardcoded domain strings in templates — define consts in `<script setup>`, bind
  via `:to`/`:label`. (Variant literals like `color="neutral"` stay inline.)
- Default to NO comments; only explain a non-obvious WHY. In templates, a one-word section comment
  (`<!-- Banner -->`) is allowed to mark distinct visual regions. Prefix breakpoint-specific blocks
  with `Mobile:` / `Desktop:`.
- Long `<script setup>` (>~80 lines, single concern) → group with `// #region` blocks, do NOT extract
  a composable just for tidiness. Extract a composable only on real reuse / testability / >250 lines.
- Homepage uses `<SitePageContainer breakout>`; full-bleed children add `class="full-bleed"`.
  `/about`,`/blogs`,`/jen-knows`,`/jen-liu` should use `<SitePageContainer>` (no breakout) unless a
  section needs to bleed.

## 6. Components inventory (what to reuse vs. retire)

Reusable content renderers to **Caldera-ize in place** (only live consumer is the dormant backup page,
so editing them is safe): `app/components/home/{Portal,Product,ImageCarousel,YoutubeCarousel,ContentBody,Profile}.vue`.

Homepage section components to **retire** (placeholder/fake content): `SectionStats`, `SectionProductDots`,
`SectionFeatures` (generic copy — but its 2-col grid markup is the template for the new directions section),
`SectionBringing`, `SectionUseCases`, `SectionBuiltOn`, `SectionTestimonials`, `SectionCommunity`,
`SectionContact`. Keep `SectionHero`, `SectionNewsletter` (both rewritten), `SectionBlog` (optional).

## 7. Definition of done (whole project)

`pnpm dev` runs; homepage shows the 5 specified sections; `/jen-knows` and `/jen-liu` render all their
content in Caldera style; nav links work; `/about` is gone; mobile layout holds; `vp check` passes.
