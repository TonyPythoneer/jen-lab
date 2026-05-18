# 01 — Tokens & Fonts

Foundation layer. No visual page yet — sets vocabulary used by every later task.

## Input artifacts (already in repo root)

- `theme.css` — extracted Tailwind v4 `@theme` block, drop-in.
- `DESIGN (1).md` — full spec (palette, type scale, full spacing scale, radius scale, component recipes).
- `tokens.json` — DTCG token export. **Not consumed by this build** (no Style Dictionary). Keep as reference; delete in task 15 unless Jen wants to keep it.

Do NOT hand-translate values. Import `theme.css` verbatim.

## Pre-flight — Read before edit

Required reads (no edits) at start of this task:

```bash
cat app/assets/css/main.css
cat nuxt.config.ts
cat app.config.ts        # may or may not exist
cat package.json | jq '.dependencies, .devDependencies'
```

Goals of pre-flight:

- Confirm current Tailwind v4 `@import "tailwindcss"` line location in `main.css`.
- Confirm Cloudflare Pages preset + content config in `nuxt.config.ts` — do NOT touch them.
- Confirm `app.config.ts` shape; preserve existing `contacts[]`.
- Confirm `@nuxt/fonts` not yet installed (will add); if already present, skip install step.
- Disable Nuxt UI color mode (light-only per project decision). Add `colorMode: { preference: 'light', fallback: 'light' }` in `app.config.ts` `ui` block, OR `@nuxtjs/color-mode` config in `nuxt.config.ts` (whichever Nuxt UI v4 expects — verify via module source).

## Goals

- Install `@nuxt/fonts`. Register Bebas Neue (display) + Inter (body).
- Wire Caldera tokens via `theme.css` import into `app/assets/css/main.css`.
- Add 3 semantic radius aliases for Nuxt UI mapping.
- Fix 3 letter-spacing unit bugs from the extraction (`px` → `em`).
- Map Caldera palette into Nuxt UI's `app.config.ts → ui.colors`.
- Disable dark mode at config level.

## Implementation

### Step 1 — move `theme.css` into the build

Pick one (Jen confirms preference):

- **A (recommended):** move `theme.css` → `app/assets/css/theme.css`. In `app/assets/css/main.css` add `@import './theme.css';` at the top.
- **B:** leave at repo root, import via `@import '../../../theme.css';`. Brittle path. Avoid.

Whichever path, the existing `main.css` (already wired by `nuxt.config.ts` per CLAUDE.md "main CSS entry point") becomes the host file.

### Step 2 — fix extraction bug in `theme.css`

Lines 25 / 28 / 31 of `theme.css` declare `0.02px` which is effectively zero tracking. Override to `0.02em`:

```diff
-  --tracking-heading-sm: 0.02px;
+  --tracking-heading-sm: 0.02em;
-  --tracking-heading: 0.02px;
+  --tracking-heading: 0.02em;
-  --tracking-display: 0.02px;
+  --tracking-display: 0.02em;
```

(Edit the file in place. Reasoning: DESIGN (1).md text body specifies `0.0200em`; the `px` unit is an extraction error.)

### Step 3 — append semantic aliases + font substitutes to `main.css`

```css
@import "./theme.css";

@theme {
  /* Semantic radius aliases — map Caldera roles onto Tailwind utilities */
  --radius-card: var(--radius-3xl-3); /* 40px  → rounded-card  */
  --radius-input: var(--radius-full); /* 100px → rounded-input */
  --radius-button: var(--radius-full-2); /* 800px → rounded-button (pill) */

  /* Font substitutes — Caldera uses proprietary PP Neue Corp Compact; Bebas Neue is the documented stand-in */
  --font-display: "Bebas Neue", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  html {
    background: var(--color-basalt-canvas);
    color: var(--color-abyssal-ink);
  }
  body {
    font-family: var(--font-sans);
  }
}
```

The extracted `--font-pp-neue-corp-compact-ultrabold` and `--font-dm-sans` declarations in `theme.css` stay — they will gracefully fall back to system sans-serif if the real fonts are absent. Components use `font-display` / `font-sans` (the substitutes), not the original Caldera names.

### Step 4 — Nuxt UI color mapping in `app.config.ts`

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: "digital-orange", // CTAs
      secondary: "cyber-violet", // accent
      neutral: "abyssal-ink", // text / borders
    },
  },
  // existing contacts[] stays untouched
});
```

If `app.config.ts` does not exist, create it. Verify resolution by reading `node_modules/@nuxt/ui/dist/runtime/module.mjs` if needed.

### Step 5 — `@nuxt/fonts` self-host

```bash
pnpm add -D @nuxt/fonts
```

Append to `nuxt.config.ts → modules`:

```ts
modules: [
  // ...existing modules
  '@nuxt/fonts',
],
fonts: {
  families: [
    { name: 'Bebas Neue', provider: 'google', weights: [400] },
    { name: 'Inter',      provider: 'google', weights: [400, 500, 700] },
  ],
}
```

`@nuxt/fonts` downloads woff2 files at build time, self-hosts them, and emits `@font-face` declarations with correct `font-display: swap`. No external request from user browser. Friendlier to Cloudflare Pages cache.

## Files touched

- Move: `theme.css` → `app/assets/css/theme.css`.
- Edit: `app/assets/css/theme.css` (3-line `px → em` fix).
- Edit: `app/assets/css/main.css` (import + alias `@theme` + base layer).
- Edit/create: `app.config.ts` (`ui.colors`, disable dark mode).
- Edit: `nuxt.config.ts` (add `@nuxt/fonts` module + families).
- Edit: `package.json` (`@nuxt/fonts` added via `pnpm add -D`).

## Verification

- `pnpm dev` boots, no console error.
- DevTools: `<body>` `font-family` resolves to Inter; background is `#e2e2df`.
- Console: `getComputedStyle(document.documentElement).getPropertyValue('--color-digital-orange').trim()` returns `#fc5000`.
- Console: `getComputedStyle(document.documentElement).getPropertyValue('--radius-button').trim()` returns `800px`.
- Console: `getComputedStyle(document.documentElement).getPropertyValue('--tracking-display').trim()` returns `0.02em` (not `0.02px`).

## Out of scope

- Components. Pages. SVGs. Pure foundation.
