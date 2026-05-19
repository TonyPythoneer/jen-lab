# Handoff — caldera-layout.html → jen-lab

> A standalone HTML/CSS/JS prototype of the jen-lab landing page. This doc is
> for whichever AI agent picks it up next (Claude Code / Opus CLI). It tells
> you what's here, what to keep, what to throw away, and how to port it back
> into the user's Nuxt 4 codebase.

---

## 1 · Quick orientation

| File                  | What it is                                                                |
| --------------------- | ------------------------------------------------------------------------- |
| `caldera-layout.html` | Page markup. 8 sections, all hand-written semantic HTML.                  |
| `caldera-layout.css`  | Page styles. Token-driven, no Tailwind. ~900 lines.                       |
| `caldera-layout.js`   | Canvas dot-field renderers + carousel/accordion wiring. Vanilla JS.       |
| `assets/opera-house.svg` | Sydney Opera House silhouette, used as CSS mask on the hero canvas.    |
| `style-guide.html` + `.css` | Companion: full visual catalogue of tokens, components, archetypes. |

Every file's head comment carries a longer brief — read those first if you
need to dig into a specific concern.

---

## 2 · Design system contract

This page must obey `jen-lab/DESIGN.md` and `jen-lab/tokens.json`. The same
tokens are wired into the Nuxt app via Tailwind v4's `@theme {}` block, so
when you port a section, every utility class you reach for (`bg-ash-white`,
`rounded-cards`, `font-display`, etc.) should already exist.

### Colour (NEVER introduce new ones)

| Token                    | Hex       | Role                                    |
| ------------------------ | --------- | --------------------------------------- |
| `--color-basalt-canvas`  | `#e2e2df` | Page background                         |
| `--color-ash-white`      | `#f7f6f2` | Card surfaces                           |
| `--color-abyssal-ink`    | `#070607` | Text, strong borders                    |
| `--color-pure-white`     | `#ffffff` | Text on dark surfaces **only**          |
| `--color-digital-orange` | `#fc5000` | Primary CTAs, feature cards             |
| `--color-cyber-violet`   | `#524ae9` | Decorative surfaces **(never text)**    |
| `--color-pixel-glare`    | `#f5f28e` | Highlights, tag chips                   |

For greys, use alpha on `--color-abyssal-ink` — there is no grey scale.

### Type

- **Display:** `PP Neue Corp Compact Ultrabold` (fallback `Bebas Neue`),
  uppercase, `letter-spacing: 0.02em`, line-height `0.94–0.95`. Sizes
  `32 / 40 / 56 / 64 / 80 / 96 / 189px`.
- **Body:** `DM Sans` (fallback `Inter`), weight `500`, sizes
  `14 / 16 / 18 / 30px`.

### Radius (3 named values cover 95% of components)

- `--radius-cards` `40px`
- `--radius-inputs` `100px`
- `--radius-buttons` `800px` ← brand signature, do not lower

### Hard "don'ts" (lifted from DESIGN.md)

- No `#ffffff` as a solid surface.
- No `--color-cyber-violet` as text/icon stroke.
- No gradients or shadows for elevation.
- No generic sans (Inter/Roboto/Arial) for headlines.
- No browser-default link blue.
- No spacing tighter than `10px` between interactive elements.

---

## 3 · Page anatomy

```
<.page>
 ├─ .hero                ← Ash card + topbar + Opera House halftone + overlapping title/panel
 ├─ .stats               ← H2 + ghost CTA + 4-col orange stat cards + 5-col partner strip
 ├─ .bento-section       ← "More Is More. Stack Sideways." 5fr/7fr bento, 2 rows
 ├─ .bring               ← Accordion (Food/Code/Writing) + violet long-form card
 ├─ .news                ← Snap-scroll carousel, arrow controls, orange media tiles
 ├─ .community           ← Radial dotfield + 3 social pills + violet newsletter card
 ├─ .backed              ← 4×2 logo grid ("Built On The Best")
 └─ .foot                ← 5fr/7fr split:
                            left  — dark brand card (mark + tagline + CTA,
                                    dot canvas in top-right corner)
                            right — orange social icons row + ash nav card
                                    (7 nav links + dotted divider + copyright)
                            mobile: stacks dark → socials → ash card
```

### Bento (5fr/7fr) rhythm

```
┌────── 5 ──────┬────────── 7 ──────────┐
│   text (a)    │     illustration (b)  │
├────── 5 ──────┼────────── 7 ──────────┤
│ illus (c)     │    text (d)           │
└───────────────┴───────────────────────┘
```

The 5/7 then 5/7 split with text/illus swapping creates a diagonal. **Do not
normalise to equal columns.**

---

## 4 · Dot-field strategy

The hero canvas is a **trig-modulated greyscale dot field** clipped to the
Opera House silhouette via CSS `mask-image`. Four total canvas renderers:

| Renderer          | Location                  | Colour         | Math notes                              |
| ----------------- | ------------------------- | -------------- | --------------------------------------- |
| `drawHero`        | `.hero__canvas`           | `rgba(7,6,7)`  | Two cos focal points + diagonal carrier |
| `drawWave`        | `.bento-section .dotfield`| ink alpha      | Two-frequency cos superposition         |
| `drawRadial`      | `.community .dotfield`    | violet alpha   | `cos²` halo                             |
| `drawDarkRadial`  | `.foot__brand-card .dotfield` | glare alpha    | `cos²` halo + ring ripple               |

**Why canvas and not CSS:** CSS `radial-gradient` tiled patterns can't vary
dot size per cell. The user explicitly asked for trig-controlled size
variation, so the dot fields are drawn imperatively.

**Why static, not animated:** the brief is a layout reference. If you want
to animate, pass a `time` arg into each `Math.cos()` and start a `rAF`
loop — but **only when visible**. There's a `WANT-ANIMATION` marker in the
JS comments for where to hook in.

---

## 5 · Porting plan (to jen-lab Nuxt 4)

Suggested 1-section-per-component split:

```
app/components/home/
  HomeHero.vue          ← .hero + the masked canvas
  HomeStats.vue         ← .stats
  HomeBento.vue         ← .bento-section (uses existing
                          HomeHarbourBridgeSvg, OperaHouseSvg etc.)
  HomeBring.vue         ← .bring (accordion + violet card)
  HomeNews.vue          ← .news (wire to fetchPosts() from utils/wpApi.ts;
                          reuse SnapCarousel)
  HomeCommunity.vue     ← .community
  HomeBacked.vue        ← .backed
  HomeFoot.vue          ← .foot (two-card split — keep the 5fr/7fr grid; the
                          dark card is its own component candidate, the ash
                          nav card maps cleanly onto layouts/default.vue's
                          existing footer if you'd rather put it there)
app/assets/masks/
  opera-house.svg       ← move from this project's assets/
```

When porting:

1. Replace all raw `class="..."` strings with Tailwind utilities. The custom
   class names (`bento__cell`, `hero__panel`, etc.) are for the standalone
   preview only and don't survive the move.
2. Replace placeholder data (stats values, partner names, news items) with
   real content from the existing `app/pages/index.vue` data blocks.
3. The Opera House dot canvas should become its own composable
   (`useDotfield(canvasRef, drawFn)`) that handles mount + resize.
4. The newsletter form should wire to the existing `useToast()` pattern.
5. Drop the inline SVG marks in `.logo-mark--a/b/c/d/e` and `.bm--*` in
   favour of real icons (Iconify via `@nuxt/icon` is already installed).

---

## 6 · Things that are placeholders (replace before any real publish)

- **Stats values** (120+ restaurants etc.) — copy from
  `app/pages/index.vue`'s existing `stats` array.
- **Partner strip names** (FORESHORE / PIER8 / BIVOUAC / MERIDIAN / ALCOVE)
  — fictional. Drop or replace with categories.
- **News items** — invented. Wire to WordPress feed via `fetchPosts()`.
- **Pixel-blob illustrations** in the bento — crude CSS gradient stand-ins.
  Replace with `HomeOperaHouseSvg` / `HomeHarbourBridgeSvg` / custom SVG.
- **"Investor" cells** (NUXT/VUE/TAILWIND…) — repurposed tech stack. Decide
  whether you want a tech-stack section or to drop it entirely.
- **Social counts** (3.6K / 2.7K / 1.1K) — invented.

---

## 7 · Example Opus CLI prompts

Drop these into the Claude Code CLI to continue the work:

```
Port caldera-layout.html's .hero section into
app/components/home/HomeHero.vue. Replace custom CSS with Tailwind
utilities from the existing @theme. Keep the masked dot canvas; move
opera-house.svg to app/assets/masks/. Wire the canvas drawing into a
new composable app/composables/useDotfield.ts that handles onMounted
+ resize.
```

```
Port caldera-layout.html's .news section into
app/components/home/HomeNews.vue. Replace the dummy article cards with
real data from fetchPosts() in app/utils/wpApi.ts. Reuse SnapCarousel
for the scroller. Keep the orange media tile aesthetic — display-font
label + small uppercase sub. Featured image (when present) replaces
the label.
```

```
Audit jen-lab/app/pages/index.vue against caldera-layout.html. List
which sections already exist in some form, which sections would be
new, and which sections in index.vue should be retired because
caldera-layout has a stronger version.
```

```
Open caldera-layout.css. Verify every colour value is either a
--color-* CSS var or an rgba() on Abyssal Ink. Flag any raw hex.
```

---

## 8 · Out of scope for this prototype

- Real responsive QA below 380px width
- Reduced-motion handling
- Accessibility audit (focus rings, ARIA roles on accordion + carousel)
- Real i18n (page is English-only)
- Print styles

Add these before shipping to production.
