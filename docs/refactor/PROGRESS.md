# Refactor Progress — `chore/refactor` — FINAL

Autonomous simplification run. Detail per candidate: `SIMPLIFICATION-STRATEGY.md`.
**Committed** in 4 thematic commits on `chore/refactor` (see Commits below). Not pushed — open the PR into `develop` when ready.

## Result

- **17 of 18 candidates done.** 1 deferred (A2 — see below).
- **Net −563 lines** across 27 tracked files (+43 / −606), plus 3 new ~13-line composables.
- 8 files deleted, 3 created, 19 modified.

## ⚠️ Pre-existing blocker (NOT caused by this refactor) — needs your decision

**`pnpm build` is broken at HEAD.** Stashing ALL my changes and building pristine HEAD
fails with the identical error, so it predates this work:

> `[INVALID_ANNOTATION]` rolldown cannot interpret a `/* #__PURE__ */` comment position in
> `@vueuse/core@14.3.0/dist/index.js:3362`; vite-plus's warning handler then throws
> "The function returned `object`, but expected `undefined`" and the build aborts.

Impact: the prerender/deploy pipeline (`velite build && vite-ssg build`) cannot finish.
Likely fix = bump/patch `@vueuse/core`, or make vite-plus's `onLog` return `undefined` —
a dependency/config change with side-effect risk, so I did NOT touch it. **Top priority for you.**

## Verification (substitute gates, since `pnpm build` is broken)

- `pnpm check` (vp format+lint + `vue-tsc --noEmit`) — ✅ green after every phase
- `pnpm test` (Vitest) — ✅ 67/67 after every phase
- `velite build` — ✅ output byte-identical before/after V1 (`diff -r` clean)
- Playwright runtime smoke on a fresh dev server (:3600), all 5 routes — **0 console errors**:
  - `/` — hero + OperaHouseSvg + sections render (screenshot `docs/refactor/smoke-home.png`)
  - `/jen-knows` — title `榛知 | NextSteps Academy` ✓, h1 `JEN KNOWS` ✓ (R1)
  - `/jen-liu` — title `榛知 | 澳洲旅遊作家` ✓ (R1)
  - `/blogs` — chrome `NOTES FROM THE NOTEBOOK.` (R2), pagination `1 2 … 9` orange active (P1), 20 posts (screenshot `docs/refactor/smoke-blogs.png`)
  - `/sydney-food-map` — Leaflet map + 24 tiles render; `--ui-*` removal harmless (C4)
- Two pre-existing console warnings observed (not mine): a Vue Router `next()` deprecation,
  and `AppSlideover` (untouched) getting an extraneous `transition` attr from `SearchModal`.

## Phase 1 — Tier-1 dead code + stale comments ✅

- [x] D1 · deleted 3 art SVGs + stories **+ 3 `vite.config.ts` resolver-map lines** (audit missed the map)
- [x] D2 · deleted `shared/ContactLinks.vue` + story (Footer re-implements the row inline)
- [x] D3 · removed `uiConfig` + Storybook `useAppConfig` (mock + main.ts); kept `contacts`
- [x] D4 · removed `WpPost.yoast_head_json`
- [x] D5 · removed `export { WP_BASE }` re-export
- [x] D6 · trimmed `useAsyncData` `transform`+`default`+`apply` hop + duplicate `execute` (kept `refresh`)
- [x] C1 · `profile/Page.vue` dropped dead HomeContentBody ref
- [x] C2 · `profile/Page.vue` UTabs → AppTabs
- [x] C3 · `config/site.ts` importer comment now accurate
- [x] C4 · `food-map.css` — **removed the whole dead `--ui-*` bridge block** (proved 0 `var(--ui-*)` readers), not just the comment
- [x] C5 · `useScrollProgress.ts` trimmed WHAT/Usage prose; kept DOM-shape + Caveats

## Phase 2 — Tier-1 dedup ✅

- [x] R2 · `useSiteBlogsChrome()` replaces 3× copy-pasted `site:blogs` fetch
- [x] V1 · hoisted `prefixPath` in `velite.config.ts` (velite output byte-identical)
- [x] A1 · `useSplitClassAttrs()` — AppButton + AppBadge consume (blocks were identical)
- Note: nested composables here aren't auto-imported (matches `useBlogList`), so the new ones use explicit imports.

## Phase 3 — Tier-2 ✅

- [x] R1 · collapsed `jen-knows.vue`/`jen-liu.vue` into `useProfileRoute({ slug, headTitle })`; all 6 distinct values preserved (verified by construction + the live titles above)
- [x] A3 · removed `AppTabs` `variant`/`size` + `AppBadge` `ui` (no callers, unused internally). **Kept `AppBadge` `color`** — `PostCard` passes it and AppBadge renders fallthrough attrs, so removing it would put `color="neutral"` on the `<span>` (a real DOM change).

## Phase 4 — Tier-3 visual

- [x] P1 · removed `AppPagination`'s unreachable default `#item` body (sole caller always supplies `#item`; verified live: `1 2 … 9` renders unchanged)
- [ ] A2 · **DEFERRED — your call.** AppModal/AppSlideover share only the `app-overlay` fade CSS (8 lines) + a 1-line `close()`; their overlay `<div>` markup differs. Deduping it means moving overlay-animation CSS (scoped→global) on two interactive overlays, whose before/after **animation** can't be verified reliably with the build broken + screenshots only catching end-states. Modest value, Tier-3 risk → not shipped unverified. Do it interactively when you can watch the fade/slide.

## Surfaced — NOT touched (your call)

- **Pre-existing `pnpm build` break** (above) — top priority.
- `AppButton` `ui.label` no-op: `blogs/index.vue:61` passes `:ui="{ label: … }"` but AppButton only applies `ui.base` → silently ignored. **Latent bug, surfaced not patched** (per no-fake-fixes).
- `PostCard.vue:39` passes `color="neutral"` to AppBadge which ignores it — harmless vestige; left as-is (kept AppBadge `color` to preserve the swallow).
- `useBlogList.ts` — single-caller + untested; inline-or-test is a judgment call.
- `#e34800` orange-hover hex (Header/Footer/AppButton) — collapsing means introducing a token (design decision).
- `CLAUDE.md` documents `shared/SnapCarousel.vue` which no longer exists — doc drift; `build-storybook` may now pass.
- `components.d.ts` (gitignored) shows 3 stale deleted-SVG entries — your running `:3500` dev server keeps rewriting them; restart it (or any clean build) and they clear. `pnpm check` is green regardless.

## Commits (on `chore/refactor`, not pushed)

1. `refactor: remove dead code, exports, and stale comments` (Phase 1)
2. `refactor: dedup repeated data wiring into shared composables` (R2 / V1 / R1)
3. `refactor: slim App* component contracts` (A1 / A3 / P1)
4. `docs(refactor): add simplification audit, progress, and smoke evidence`

`pnpm check` + `pnpm test` green on HEAD. Open the PR into `develop` (never main) when ready.

## Log

- Baseline check ✅ + test 67/67 ✅. (build discovered broken — pre-existing, isolated via stash.)
- Phase 1: 8 deleted, 11 candidates. Phase 2: 3 dedups. Phase 3: R1 + A3. Phase 4: P1 done, A2 deferred.
- All gates green throughout. Playwright smoke on all 5 routes: 0 errors.
