# Prerender Content Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pre-render the four Nuxt Content–backed routes (`/`, `/jen-liu`, `/jen-knows`, `/blogs`) so they are served as static HTML by Cloudflare Pages CDN — eliminating the D1 database dependency and improving TTFB for these pages.

**Architecture:** Add `routeRules` with `prerender: true` in `nuxt.config.ts`. At build time, Nuxt Content uses in-memory SQLite to resolve `queryCollection` calls and bakes the results into static HTML + payload JSON files. At runtime, Cloudflare Pages serves those files directly; no Worker function or D1 is invoked for these routes.

**Tech Stack:** Nuxt 4 `routeRules`, Cloudflare Pages static file serving, Nuxt Content in-memory SQLite (build-time only)

---

### Task 0: Branch + Project Management Structure

**Files:**

- Create: `.claude/project-management/prerender-content/00_overview.md`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/prerender-content-routes
```

- [ ] **Step 2: Create PM structure**

```bash
mkdir -p .claude/project-management/prerender-content
```

Create `.claude/project-management/prerender-content/00_overview.md`:

```markdown
# Prerender Content Routes

Pre-render /, /jen-liu, /jen-knows, /blogs to eliminate D1 dependency.

## Tasks

- [ ] 01 — Update nuxt.config.ts: add routeRules + remove D1 logic
- [ ] 02 — Update wrangler.jsonc: remove d1_databases block
- [ ] 03 — Build + verify prerendered output
- [ ] 04 — Preview verification (no D1)
```

- [ ] **Step 3: Commit**

```bash
git add .claude/project-management/prerender-content/
git commit -m "chore: add PM structure for prerender-content-routes"
```

---

### Task 1: Update `nuxt.config.ts`

**Files:**

- Modify: `nuxt.config.ts`

Two changes: (a) add `routeRules`, (b) remove `isD1` conditional and hardcode in-memory SQLite.

- [ ] **Step 1: Add `routeRules` to `cloudflareSettings`**

In `nuxt.config.ts`, find the `cloudflareSettings` block (around line 76) and add `routeRules`:

```ts
const cloudflareSettings: NuxtConfig = {
  compatibilityDate: "2025-07-15",
  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/jen-liu": { prerender: true },
    "/jen-knows": { prerender: true },
    "/blogs": { prerender: true },
  },
};
```

- [ ] **Step 2: Remove `isD1` logic and hardcode in-memory SQLite**

Remove line 8:

```ts
const isD1 = process.env.NUXT_CONTENT_DB === "d1";
```

In `moduleSettings.content.database`, replace:

```ts
database: isD1 ? { type: "d1", bindingName: "DB" } : { type: "sqlite", filename: ":memory:" },
```

with:

```ts
database: { type: "sqlite", filename: ":memory:" },
```

- [ ] **Step 3: Run type-check**

```bash
vp check
```

Expected: `pass: Found no warnings, lint errors, or type errors`

- [ ] **Step 4: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat(prerender): add routeRules prerender for content routes, remove D1 config"
```

Update `00_overview.md`: mark task 01 done.

---

### Task 2: Update `wrangler.jsonc`

**Files:**

- Modify: `wrangler.jsonc`

- [ ] **Step 1: Remove `d1_databases` block**

In `wrangler.jsonc`, remove the entire `d1_databases` array (lines 15–21):

```jsonc
// REMOVE this block:
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "jen-lab",
    "database_id": "af8dfdd2-e4c7-42a6-85f7-628eab64cad3",
  },
],
```

The file after removal should go from `"compatibility_flags"` directly to the comment block.

- [ ] **Step 2: Commit**

```bash
git add wrangler.jsonc
git commit -m "chore: remove D1 database binding from wrangler config"
```

Update `00_overview.md`: mark task 02 done.

---

### Task 3: Build + Verify Prerendered Output

**Files:** none (verification only)

- [ ] **Step 1: Run production build**

```bash
pnpm build
```

Expected: build completes without errors. Nuxt Content uses in-memory SQLite at build time.

- [ ] **Step 2: Verify static HTML files were generated**

```bash
ls dist/ | grep -E "^index\.html$|^jen-liu|^jen-knows|^blogs"
```

Expected output (files exist):

```
blogs
index.html
jen-knows.html
jen-liu.html
```

If any file is missing, the `prerender: true` rule didn't fire — double-check the `routeRules` keys match the exact route paths.

- [ ] **Step 3: Commit**

Update `00_overview.md`: mark task 03 done.

```bash
git add .claude/project-management/prerender-content/00_overview.md
git commit -m "chore: mark build verification complete"
```

---

### Task 4: Preview Verification (No D1)

**Files:** none (verification only)

- [ ] **Step 1: Start local preview**

```bash
pnpm preview
```

This runs `wrangler pages dev` against the `dist/` output. Since `wrangler.jsonc` no longer has `d1_databases`, there is no D1 binding available.

- [ ] **Step 2: Screenshot and verify all four routes**

```bash
rtk playwright screenshot http://localhost:3000 /tmp/prerender-home.png --full-page
rtk playwright screenshot http://localhost:3000/jen-liu /tmp/prerender-jen-liu.png --full-page
rtk playwright screenshot http://localhost:3000/jen-knows /tmp/prerender-jen-knows.png --full-page
rtk playwright screenshot http://localhost:3000/blogs /tmp/prerender-blogs.png --full-page
```

Read each screenshot and confirm the pages render correctly (content visible, no blank sections, no error messages).

- [ ] **Step 3: Confirm no D1 errors in wrangler output**

Check the `pnpm preview` terminal — there should be no errors like `"DB" is not defined` or `D1 binding not found`.

- [ ] **Step 4: Remove Cloudflare Dashboard env var (manual)**

In the Cloudflare Pages dashboard for `jen-lab`, go to **Settings → Environment variables** and remove `NUXT_CONTENT_DB=d1` if it exists. This is a manual step outside of code.

- [ ] **Step 5: Final cleanup commit**

```bash
rm -rf .claude/project-management/prerender-content/
git add .claude/project-management/
git commit -m "chore: remove prerender-content-routes project management files"
```

---

## Self-Review

**Spec coverage:**

- ✅ `routeRules` prerender for 4 routes → Task 1
- ✅ Remove `isD1` / D1 database config → Task 1 + Task 2
- ✅ Verify static HTML generated at build → Task 3
- ✅ Verify preview works without D1 → Task 4
- ✅ Cloudflare dashboard env var removal noted → Task 4 Step 4

**Placeholder scan:** No TBD, no "handle edge cases", all steps have exact code or commands.

**Type consistency:** `routeRules` key names (`"/"`, `"/jen-liu"`, `"/jen-knows"`, `"/blogs"`) match the actual `app/pages/` route filenames — consistent.

**Note on preview port:** `pnpm preview` via wrangler may start on port `3000` or `8788` depending on wrangler version. If `localhost:3000` doesn't respond, try `localhost:8788`.
