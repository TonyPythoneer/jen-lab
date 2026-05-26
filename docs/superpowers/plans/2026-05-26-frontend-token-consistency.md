# Frontend Token Consistency Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all off-system color values in `Profile.vue` and `SectionHero.vue` with design token references, and fix two viewport/responsive issues in `SectionHero.vue`.

**Architecture:** Pure class/token replacement — no logic changes, no new components. All changes stay within three files. Validation is visual (screenshot) plus `pnpm check`.

**Tech Stack:** Nuxt 4, Tailwind v4 (`@theme` in `theme.css`), Nuxt UI

---

## Files

- Modify: `app/assets/css/theme.css` — add `--color-sydney-sky` token
- Modify: `app/components/home/Profile.vue` — replace generic gray classes
- Modify: `app/components/home/SectionHero.vue` — replace skyblue, fix 100vh, fix portrait sizing, fix font-black

---

### Task 1: Add `--color-sydney-sky` token to theme

**Files:**

- Modify: `app/assets/css/theme.css`

- [ ] **Step 1: Add the token after the existing color block (line 9)**

In `app/assets/css/theme.css`, add one line after `--color-pixel-glare`:

```css
@theme {
  /* Colors */
  --color-basalt-canvas: #e2e2df;
  --color-ash-white: #f7f6f2;
  --color-abyssal-ink: #070607;
  --color-pure-white: #ffffff;
  --color-digital-orange: #fc5000;
  --color-cyber-violet: #524ae9;
  --color-pixel-glare: #f5f28e;
  --color-sydney-sky: #87ceeb;
```

- [ ] **Step 2: Run lint/type check**

```bash
pnpm check
```

Expected: no errors (this is a CSS-only change).

- [ ] **Step 3: Commit**

```bash
git add app/assets/css/theme.css
git commit -m "feat(theme): add sydney-sky color token"
```

---

### Task 2: Fix `SectionHero.vue`

**Files:**

- Modify: `app/components/home/SectionHero.vue`

Four changes on line 38, 56, 66, 71.

- [ ] **Step 1: Replace `bg-[skyblue]` with `bg-sydney-sky` (line 38)**

```html
class="sticky top-[var(--site-header-h)] h-[calc(100dvh_-_var(--site-header-h))] bg-sydney-sky
rounded-card overflow-hidden flex flex-col"
```

Note: also change `100vh` → `100dvh` in this same class string.

- [ ] **Step 2: Replace `font-black` with `font-semibold` on the subtext paragraph (line 56)**

```html
class="text-base md:text-xl font-semibold text-abyssal-ink/85 max-w-2xl mx-auto leading-relaxed"
```

- [ ] **Step 3: Add responsive height to both portrait `<img>` elements (lines 66 and 71)**

```html
class="h-[180px] md:h-[252px] w-auto will-change-transform"
```

Apply to both `jen-knows.png` and `jen-liu.png` images.

- [ ] **Step 4: Screenshot and verify**

```bash
pnpm ai:screenshot /
```

Check: hero background still sky blue, portraits scale on narrow viewport, subtext visually lighter.

- [ ] **Step 5: Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/components/home/SectionHero.vue
git commit -m "fix(hero): use sydney-sky token, 100dvh, responsive portraits, lighter subtext weight"
```

---

### Task 3: Fix `Profile.vue` gray colors

**Files:**

- Modify: `app/components/home/Profile.vue`

- [ ] **Step 1: Replace card background (line 13)**

```html
class="flex flex-col gap-3 rounded-4xl shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden pb-4
bg-ash-white"
```

- [ ] **Step 2: Replace name heading color (line 34)**

```html
<h1 class="text-xl font-bold text-abyssal-ink">{{ profile.name }}</h1>
```

- [ ] **Step 3: Replace button classes on both `UButton` elements (lines 42 and 55)**

Both buttons get:

```html
class="border-abyssal-ink/20 text-abyssal-ink/70 hover:bg-basalt-canvas"
```

- [ ] **Step 4: Replace bio paragraph color (line 73)**

```html
<p class="text-sm text-abyssal-ink/60 leading-relaxed text-left whitespace-pre-line px-6"></p>
```

- [ ] **Step 5: Screenshot Jen Knows and Jen Liu pages**

```bash
pnpm ai:screenshot /jen-knows
pnpm ai:screenshot /jen-liu
```

Check: Profile card uses ink-based colors, no generic grays visible.

- [ ] **Step 6: Run check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/components/home/Profile.vue
git commit -m "fix(profile): replace generic gray classes with design system tokens"
```
