# jen-lab Simplification Strategy

> READ-ONLY audit of branch `chore/refactor`. Goal: simplify as much as possible
> with **zero behavioral side effects**, maximizing readability. Every "dead" /
> "duplicate" claim below is backed by a search that is named inline.
> Scope: `app/` + build/config (`vite.config.ts`, `velite.config.ts`, `scripts/`).
> Load-bearing packages (reka-ui, cva, clsx, tailwind-merge, vite-ssg, velite) are
> never proposed for removal.

## Method note (why some seeds were wrong)

Two audit seeds turned out to be **false leads** — recorded here so the roadmap
does not chase them:

- **`${marker} ${checkbox} ${format(firstLine)}${firstLineSuffix}` duplication
  does NOT exist in source.** A repo-wide search (`firstLineSuffix|format(firstLine)`)
  returns 0 hits. The prior "find" was inside a bundled `agent-*.js` artifact, not
  jen-lab code. The only `marker`/`checkbox` hits here are Leaflet map markers.
- **`home/ContentBody`, `SectionNewProduct`, `Toc` are already gone.** No such files
  exist; the only trace is one stale comment (see C1). They were removed already.

Also note: `codegraph_callers` does **not** track Vue auto-imported template tags as
edges, and `ctx_search` is line-based (an `<Tag\n` opening tag with attributes on the
next line is missed by a `<Tag[\s/>]` anchor). Every dead/used claim below was
therefore confirmed with **anchorless ripgrep across all files**, not codegraph or
anchored search alone. This caught 4 would-be false positives (AppBadge, AppSlideover,
AppPagination, AppPageHeader all looked unused under an anchored `.vue` search but are
in fact used via multi-line tags).

---

## A. Executive summary — top 5 wins (highest value × safety)

1. **Delete 4 provably-orphaned components** — `home/art/GlyphSvg`, `home/art/HarbourBridgeSvg`,
   `home/art/WaveSvg`, and `shared/ContactLinks` (+ their `.stories.ts`). Each is referenced
   only by its own story; zero usage across all 6 prerendered routes (verified by anchorless
   repo-wide rg + a per-component usage sweep). **Tier 1.**
2. **Remove the dead `uiConfig` → Storybook `useAppConfig` Nuxt-vestige chain** — `uiConfig`
   (`app/config/site.ts:12-29`) is imported only by `.storybook/mocks/nuxt.ts`'s `useAppConfig`,
   which **nothing in `app/` ever calls** (Nuxt removed). The whole chain is dead. **Tier 1.**
3. **Fix 4 stale/misleading comments** that name deleted components/framework parts
   (`HomeContentBody`, `UTabs`, "Footer imports ContactLinks", `UButton/UInput/UBadge`).
   These actively mislead a reader. **Tier 1.**
4. **Trim dead surface in the data + WP layers** — `useAsyncData`'s `transform` and `default`
   options (passed by zero callers) plus the duplicate `execute` return, and the WP cruft
   `yoast_head_json` (never in any field whitelist) + the unused `export { WP_BASE }` re-export.
   **Tier 1.**
5. **Collapse the near-identical profile pages** `jen-knows.vue` / `jen-liu.vue` (only 6 string
   values differ across 24 byte-identical lines) into one shared SEO/data unit + thin route files.
   **Tier 2** (lock prerendered `<head>` first).

---

## B. Themes (ranked by value × safety)

| Rank | Theme                                    | Goal                                                     | Candidates    | Effort | Dominant tier |
| ---- | ---------------------------------------- | -------------------------------------------------------- | ------------- | ------ | ------------- |
| 1    | **T1 Dead-code removal**                 | Delete provably-unreferenced code, exports, options      | D1–D6 (6)     | M      | Tier 1        |
| 2    | **T2 Stale comment / reference cleanup** | Delete comments naming removed code/framework            | C1–C5 (5)     | S      | Tier 1        |
| 3    | **T3 Route-page & data dedup**           | One source for duplicated page SEO/data wiring           | R1–R2, V1 (3) | M      | Tier 1/2      |
| 4    | **T4 App\* dedup & vestigial props**     | Collapse repeated attr/overlay logic; drop ignored props | A1–A3 (3)     | M      | mixed         |
| 5    | **T5 Pagination contract slimming**      | Drop unreachable default-slot markup                     | P1 (1)        | S      | Tier 3        |

**Candidate count by tier:** Tier 1 = 14 · Tier 2 = 2 · Tier 3 = 2 · **Total = 18.**

Global verification baseline for every candidate: `pnpm check` (vp lint+format + `vue-tsc --noEmit`)
and `pnpm test` (Vitest) must stay green. Tier-1 code/structure changes additionally verified by
`pnpm build` (velite + vite-ssg prerender succeeds). Story removals verified by `pnpm storybook`
(dev) since `pnpm build-storybook` has an unrelated known failure. Tier-3 changes require a
Playwright before/after screenshot match.

---

## C. Candidates by theme

### T1 — Dead-code removal (Tier 1)

**D1 · Orphaned art SVG components**
`app/components/home/art/GlyphSvg.vue`, `HarbourBridgeSvg.vue`, `WaveSvg.vue` (+ matching `.stories.ts`).

- _Now:_ three SVG art components. Only `OperaHouseSvg` (the 4th art file) is actually rendered
  (`SectionHero.vue:62`, `SectionNewsletter.vue:39`).
- _Proof:_ `rg 'WaveSvg|HarbourBridgeSvg|GlyphSvg'` across all `.vue/.ts/.md/.yml/.tmpl` excluding
  their own def + stories → **0 hits**; per-component usage sweep → 0; `codegraph_callers` → stories only.
- _Change:_ delete the 3 components and their stories.
- _Readability gain:_ −6 files; removes a "looks load-bearing, isn't" trap from `home/art/`.
- _Verify:_ `pnpm check && pnpm test && pnpm build`; `pnpm storybook` still boots.
- _Caveat (owner sign-off):_ they carry Storybook stories, so deletion is a **library decision** —
  confirm `home/art/` is not a deliberately-retained asset library before removing.

**D2 · Orphaned `shared/ContactLinks.vue` (+ story)**

- _Now:_ a "single source for the social-contact row" component reading `contacts` from config/site.
- _Proof:_ `rg 'ContactLinks|SharedContactLinks' app/` (anchorless) → the **only** non-story hit is a
  _wrong_ comment in `app/config/site.ts:2`. `Footer.vue` does **not** use it — it re-implements the
  social row inline (`Footer.vue:50-60`). Usage sweep → 0.
- _Change:_ delete `ContactLinks.vue` + `ContactLinks.stories.ts`; fold the comment fix into C3.
- _Readability gain:_ −2 files; kills a misleading "single source" that nothing consumes.
- _Verify:_ `pnpm check && pnpm test && pnpm build`.
- _Caveat:_ has a story (same library-decision note as D1). Note: the live social-row markup is the
  one in `Footer.vue`; do **not** try to "rescue" ContactLinks by wiring it into Footer — their styles
  differ (orange filled circles vs. text-tint), so that would be a visual change, not a dedup.

**D3 · Dead `uiConfig` + Storybook `useAppConfig` Nuxt vestige**
`app/config/site.ts:12-29` (`uiConfig`), `.storybook/mocks/nuxt.ts:22`, `.storybook/main.ts:38`.

- _Now:_ `uiConfig` (colors + a button compound-variant) exists; the only importer is the Storybook
  mock `useAppConfig = () => ({ ui: uiConfig, contacts })`.
- _Proof:_ `rg 'useAppConfig' app/ .storybook/` → defined/registered only in `.storybook/`; **zero**
  callers in `app/` (Nuxt's `useAppConfig` no longer exists at runtime). `rg 'uiConfig'` → only its
  own def + the mock. Its button variant also duplicates `AppButton.vue:88-93`.
- _Change:_ remove `uiConfig` export; remove the mock's `useAppConfig` and its `main.ts` registration.
  Keep `contacts` (used live by `Footer.vue`).
- _Readability gain:_ −~18 lines from site.ts; deletes a dead Nuxt-era config surface.
- _Verify:_ `pnpm check && pnpm test`; `pnpm storybook` boots.

**D4 · Dead `yoast_head_json` type field** — `app/utils/blog/wpApi.ts:22-25`.

- _Now:_ `WpPost.yoast_head_json?` is declared on the interface.
- _Proof:_ `rg 'yoast'` → the field appears only in its own declaration. It is **not** in
  `POST_LIST_FIELDS`/`POST_DETAIL_FIELDS`, so the API never returns it, and no component reads it
  (`meta` in `[...slug].vue:71` uses `jetpack_featured_media_url`).
- _Change:_ delete the field.
- _Readability gain:_ −4 lines of type cruft.
- _Verify:_ `pnpm check` (typecheck proves no reader).

**D5 · Dead `export { WP_BASE }` re-export** — `app/utils/blog/wpApi.ts:3`.

- _Now:_ `wpApi.ts` imports `WP_BASE` from config/site (line 1) then re-exports it (line 3).
- _Proof:_ `rg "from '~/utils/blog/wpApi'"` → consumers import `fetchPost/fetchPosts/stripHtml/formatDate/WpPost/WpPostsPage`; **none** import `WP_BASE` from wpApi. `sync-wp.ts` imports `WP_BASE` from config/site directly.
- _Change:_ delete line 3.
- _Readability gain:_ −1 line; removes a confusing pass-through.
- _Verify:_ `pnpm check`.

**D6 · Dead `useAsyncData` options + duplicate return** — `app/composables/useAsyncData.ts`.

- _Now:_ `AsyncDataOptions` declares `transform` and `default`; `create()` wires an `apply()`
  transform-indirection (line 37) and a `default`-based initial value (line 32). The return exposes
  both `refresh` and `execute` pointing at the same function (lines 58, 66, 113).
- _Proof:_ `rg 'transform:|default:'` across composables/pages/layouts → **zero** are `useAsyncData`
  options (all hits are CSS transforms, a cva `default` variant, and a `defineModel` default). Only
  `immediate`, `server`, `watch`, `getCachedData` are ever passed. `rg '\.execute\('` → no caller;
  only `refresh` is destructured (`blogs/index.vue:122`).
- _Change:_ drop `transform` + `default` from the interface and their dead branches (so `apply` becomes
  identity and disappears; the ref initializer becomes `ref(null)`); drop `execute` from the returned
  object + `AsyncData<T>` type (keep `refresh`).
- _Readability gain:_ −~10 lines; removes the `apply` indirection hop and a duplicate public method.
- _Verify:_ `pnpm check && pnpm test` (typecheck proves no caller passes the removed options or calls `.execute`).
- _Caveat:_ this trims the deliberate "Nuxt `useAsyncData` look-alike" API surface. It is provably
  unused today; if the team wants to keep parity with Nuxt's signature on purpose, skip — but that is a
  preference, not a correctness constraint.

### T2 — Stale comment / reference cleanup (Tier 1)

All five are comments that violate the Constitution (restate WHAT and/or name **removed** code), so a
reader is actively misled. Verification for the whole theme: `pnpm check` (comments cannot change render).

**C1 · `app/components/profile/Page.vue:2`** — comment says "Uses inline section dispatch (not
HomeContentBody)". `HomeContentBody` was deleted. Drop the dead-reference clause.

**C2 · `app/components/profile/Page.vue:35`** — `<!-- Multiple tabs: UTabs navigation ... -->`.
`UTabs` is the old @nuxt/ui name; the component is `AppTabs`. Rename or delete (it restates WHAT).

**C3 · `app/config/site.ts:2`** — "Imported directly by the app's components (Footer, ContactLinks)".
After D2, ContactLinks is gone, and even today Footer is the only live importer. Fix to "Footer + the
Storybook theme config" (Storybook still reads `contacts`).

**C4 · `app/assets/css/food-map.css:91`** — comment describes "parchment tokens inside this scope so
UButton / UInput / UBadge adopt the atlas …". Those @nuxt/ui components no longer exist. Update the note
to the actual styled targets (or remove if the bridge it describes is now inert — confirm the rule block
below it still applies before deleting).

**C5 · `app/composables/shared/useScrollProgress.ts:1-43`** — a 43-line JSDoc for a 25-line function.
The "Required DOM shape" + "Caveats" (sticky/overflow/SSR-0) are legitimate **WHY** constraints — keep
them. The `## Usage` block and prose intro restate WHAT and can be trimmed. _Low priority; trim only the
WHAT, never the constraint caveats._

### T3 — Route-page & data dedup (Tier 1/2)

**R1 · Collapse `jen-knows.vue` + `jen-liu.vue`** — `app/pages/jen-knows.vue`, `app/pages/jen-liu.vue`.

- _Now:_ two 24-line pages that are **byte-identical** except 6 values: display name, head title,
  `useAsyncData` key, collection path, `brand` prop, and `ogImage` path.
- _Change:_ move the shared data+SEO wiring into one helper (e.g. a `useProfileRoute({ slug, displayName,
headTitle })` composable, or a shared `ProfileRoute.vue` the two pages render). Keep both `.vue` files
  (file-based routing + the `ssgOptions.includedRoutes` entries depend on them) but reduce each to the
  6 distinct values + a one-line delegation.
- _Readability gain:_ −~18 duplicated lines; one source for profile SEO logic.
- _Safety tier:_ **Tier 2** — it touches SEO `<head>` output (data flow). Lock first: `pnpm build`, then
  diff the prerendered `dist` HTML `<head>` + body for `/jen-knows` and `/jen-liu` before vs. after;
  they must be byte-identical.
- _Do NOT_ convert to a dynamic `[profile].vue` route — that changes route matching and the prerender
  list (not side-effect-free).

**R2 · Extract the triple `site:blogs` fetch** — `app/layouts/default.vue:23`,
`app/pages/blogs/index.vue:88`, `app/pages/blogs/[...slug].vue:55`.

- _Now:_ the exact line `useAsyncData("site:blogs", () => queryCollection("siteBlogs").first())` is
  copy-pasted in 3 places (the shared key means the dedup cache already runs it once — this is a DRY/
  readability issue, not a perf one).
- _Change:_ one `useSiteBlogsChrome()` composable returning `{ chrome }`; the 3 sites call it.
- _Readability gain:_ −2 duplicated fetch lines; single definition of the chrome key/query.
- _Safety tier:_ **Tier 1** (same key + same query → identical behavior; typecheck + tests verify).

**V1 · Velite path-prefix transform dedup** — `velite.config.ts:84` and `:150`.

- _Now:_ `.transform((data) => ({ ...data, path: "/" + data.path }))` is identical on the `home` and
  `pagesLayout` collections.
- _Change:_ hoist to a shared `const prefixPath = (d) => ({ ...d, path: "/" + d.path })`.
- _Readability gain:_ −1 duplicated closure; names the intent once.
- _Safety tier:_ **Tier 1** (`pnpm build` → generated `generated/velite` output identical).

### T4 — App\* dedup & vestigial props (Tier 1/2/3)

**A1 · Shared attr/class split helper** — `AppButton.vue:36-42`, `AppBadge.vue:23-27`.

- _Now:_ both components repeat the identical block:
  `const attrs = useAttrs(); parentClass = computed(() => attrs.class ?? ""); restAttrs = computed(() =>
Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class")))`. Three more components
  (`AppSkeleton`, `AppTabs`, `AppPageHeader`) inline `$attrs.class`.
- _Change:_ one tiny helper (e.g. `useSplitClassAttrs()` in `app/composables/shared/` or `app/lib/`)
  returning `{ parentClass, restAttrs }`; AppButton + AppBadge consume it.
- _Readability gain:_ removes one copy of a 7-line block; one definition of the pattern.
- _Safety tier:_ **Tier 1** (pure logic; typecheck + tests + identical render).
- _Caveat:_ borderline under the repo's "inline unless shared" rule — it **is** shared across 2 (arguably 5) components, so extraction is justified, but the net line saving is small. Low priority within T4.

**A2 · Dedupe AppModal / AppSlideover overlay** — `AppModal.vue` vs `AppSlideover.vue`.

- _Now:_ both wrap a `Teleport to="body"`, both define a **byte-identical** `app-overlay` transition
  (`AppModal.vue:43-50` ≡ `AppSlideover.vue:53-60`) and an identical `close()` that emits
  `update:open=false`.
- _Change:_ share the overlay (a small `<AppOverlay>` sub-component, or a shared scoped-CSS import) and
  the close emit.
- _Readability gain:_ removes one copy of the overlay transition + close handler.
- _Safety tier:_ **Tier 3** — touches rendered markup/animation across two overlay components. Requires
  Playwright before/after on an open AppModal (e.g. `/` image gallery) **and** the AppSlideover
  (`/blogs` search drawer) confirming identical fade/slide.

**A3 · Drop vestigial @nuxt/ui-compat props** — `AppBadge.vue:17-18` (`color`, `ui`),
`AppTabs.vue:32-33` (`variant`, `size`), and the unused part of `AppButton`'s `ui`.

- _Now:_ these props are declared "accepted for API compatibility, ignored".
- _Change:_ remove the genuinely-ignored props **after** proving no caller relies on the current
  "swallow it" behavior. Note: `AppButton`'s `ui` is partly live (`ui.base` is applied) — keep `ui.base`;
  but `blogs/index.vue:61` passes `ui.label`, which AppButton silently ignores (a latent no-op — see
  uncertain list, treat as a bug surfaced to the owner, not a refactor).
- _Readability gain:_ removes "I accept this and do nothing" noise from 2-3 component contracts.
- _Safety tier:_ **Tier 2** — removing a declared prop changes `$attrs` fallthrough if a caller passes it.
  Verify with `rg` that no caller passes `color`/`ui` to AppBadge or `variant`/`size` to AppTabs, then
  `pnpm check && pnpm test`. If any caller does pass one, leave it (don't change render).

### T5 — Pagination contract slimming (Tier 3)

**P1 · Remove AppPagination's unreachable default-slot body** — `AppPagination.vue:14-33`.

- _Now:_ `AppPagination` provides a default page-button + ellipsis inside its `#item` slot
  (lines 17-32). Its **only** caller, `blogs/index.vue:54-70`, always supplies `#item`, so the default
  body never renders — and the caller even re-duplicates the ellipsis `<span>…</span>`
  (`blogs/index.vue:69` ≡ `AppPagination.vue:31`).
- _Change:_ either drop the dead default body (simpler component) or push the caller's override down into
  the component as the new default (de-duplicates the ellipsis span). Pick one direction with the owner.
- _Readability gain:_ removes ~16 lines of never-rendered markup or a duplicated span.
- _Safety tier:_ **Tier 3** — markup + component-contract change. Verify pagination on `/blogs` renders
  pixel-identically before/after (Playwright), at page 1, a middle page, and last page (ellipsis states).
- _Caveat:_ this narrows AppPagination's reusability (a future second caller would lose the default).
  Currently single-caller, so safe today; confirm intent.

---

## D. DO-NOT-TOUCH / uncertain (guardrails)

**Intentional non-idioms — do not "simplify":**

- `app/composables/food-map/useRestaurants.ts` — the dynamic `import()` is deliberate (keeps the dataset
  out of the route chunk). Do **not** inline to a static import.
- Leaflet is SSR-unsafe — `FoodMapApp.vue` / `FoodMapCanvas.vue` must stay inside `<ClientOnly>`
  (`app/components/common/ClientOnly.vue`). Do not hoist Leaflet rendering out.
- Food-map perf composables — `useRiverBoats.ts` (451L), `useCanvasLayer.ts` (209L), `usePinCanvas.ts`
  (156L) are hand-tuned canvas/zoom-projection code with extensive WHY comments. Leave them; they are
  shared and perf-critical, not over-abstraction.
- `useFoodMapStore.ts`, `useBlogSearch.ts`, `useBlogLastQuery.ts` — module-level shared reactive state,
  genuinely shared across components. Correct per the repo rule; keep.
- Home page `COMPONENT_MAP` + `resolveComponent("Home…")` string dispatch (`pages/index.vue`) and the
  per-content-type `v-if`/`v-else-if` dispatch in `profile/Page.vue` are deliberate content-driven
  rendering. Do not merge into one mechanism.
- `vite.config.ts` `homeComponents` map / `as PluginOption[]` / `as Parameters<…>` assertions — each has
  an inline WHY (rolldown generic-SFC, vite-plus vs vite Plugin typing, `ssgOptions` not in the type).
  These are load-bearing workarounds; keep.
- Light-mode only — never propose `dark:*`.

**Uncertain — surface to owner, do NOT auto-change:**

- **`useBlogList.ts`** — single caller (`blogs/index.vue` only) and **no test exists** despite its
  docstring claiming "Keeps this unit-testable". By the repo's own "inline unless shared/tested" rule it
  is a candidate to inline, but it is ~85 lines of state logic and inlining would bloat the page. Resolve
  by **either** inlining it **or** adding the promised `useBlogList.test.ts` — a judgment call, not a
  clear win. Left out of the action list.
- **Hardcoded orange-hover hex `#e34800`** appears in `Header.vue` (×2), `Footer.vue:57`, `AppButton.vue:79`.
  It is the digital-orange hover shade and is **not** covered by an existing token, so collapsing it means
  _introducing_ a new token — a design-system decision, not a pure refactor. Flag, don't auto-change.
- **`AppButton` `ui.label` no-op** — `blogs/index.vue:61` passes `:ui="{ label: 'min-w-5 text-center' }"`
  but AppButton only applies `ui.base`, so this silently does nothing. This is a latent behavior gap, not a
  simplification; surface to the owner (per "no fake fixes") rather than papering over it.
- **`SectionBlog3D` data key `"blog3dv2-posts"`** (`SectionBlog3D.vue:72`) carries a `v2` in a string key.
  Cosmetic naming smell only (the filename has no suffix, so the repo's no-`V2` rule isn't violated).
  Optional rename; verify the key isn't referenced elsewhere first.

**Doc drift observed (not a code change):**

- `CLAUDE.md` still documents a `shared/SnapCarousel.vue` "build-storybook known limitation", but that file
  **no longer exists** (`shared/` contains only `ContactLinks` + `ScrollToTopButton`). The note is stale.
  Since `SnapCarousel` is gone, `pnpm build-storybook` may now succeed — re-test before relying on the
  documented failure. (Out of code scope; noted for the roadmap.)
