# reka-ui Migration & UI Reorg — Executable Plan

> **Status:** DESIGN ONLY. No code edited. All reka-ui primitive/prop/emit names
> below were verified against the **installed** `node_modules/reka-ui@2.9.9`
> type definitions and the namespace logic against `unplugin-vue-components@32.1.0`
> source (`dist/utils-BfjsfvcK.mjs:151-196`). Anything unconfirmed is flagged.
>
> **Goal (user):** (1) migrate interactive components to **reka-ui** headless
> primitives for built-in a11y (focus trap, keyboard nav, ARIA, scroll-lock);
> (2) reorganize every component into `app/components/ui/<category>/<Name>.vue`
> using the Nuxt UI left-sidebar taxonomy; (3) reference every component with
> **no prefix** (`<Button>`, `<Modal>`, …); (4) update all callers.
>
> **Build caveat:** `pnpm build` is pre-existing broken (rolldown + `@vueuse/core`
> `#__PURE__`). Verification uses `pnpm check` + `pnpm test` + dev server + Playwright.

---

## 0. Ground-truth audit (what is actually true today)

| Claim                                     | Verified reality                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Only `AppPopover` uses reka-ui            | TRUE. It imports `PopoverRoot/Trigger/Portal/Content` from `reka-ui`. The other 9 are hand-rolled HTML + Tailwind + `cn()`.                                                                                                                                                                                                                                                                                          |
| `class-variance-authority` installed      | FALSE — not in `package.json`. Variants are plain TS maps (`BASE`/`SIZE`/`COMBO`).                                                                                                                                                                                                                                                                                                                                   |
| `reka-ui` installed                       | TRUE — `^2.9.9`. `clsx`, `tailwind-merge`, `@iconify/vue@^5` present.                                                                                                                                                                                                                                                                                                                                                |
| App\* components have `.stories.ts`       | **FALSE.** `find app -name '*.stories.ts'` shows **zero** stories for any `App*` file. The 24 existing stories belong to _consumer_ components (e.g. `blog/SearchModal.stories.ts`, `blog/PostCard.stories.ts`) that render `App*` internally. **No story file references an `App*` name** — so the rename touches no story source, but Storybook auto-import MUST be reconfigured or those stories break at render. |
| `ClientOnly` used in `useFoodMapStore.ts` | **FALSE** — that is a _comment_ (line 7). The only runtime `<ClientOnly>` element is `food-map/FoodMapApp.vue:66`.                                                                                                                                                                                                                                                                                                   |
| Storybook config mirrors vite.config      | PARTIAL — `.storybook/main.ts` has `directoryAsNamespace + collapseSamePrefixes` but is **missing** `globalNamespaces:["common"]` AND the Home resolver that `vite.config.ts` has. Pre-existing drift; see §4.                                                                                                                                                                                                       |

---

## 1. Nuxt UI taxonomy + final `ui/` tree

### 1a. Nuxt UI left-sidebar taxonomy (fetched from https://ui.nuxt.com/docs/components)

Categories, in sidebar order, with the components we place in each shown in **bold**:

- **Layout** — App, Container, Error, Footer, Header, Main, Sidebar, Theme
- **Element** — Alert, Avatar, AvatarGroup, **Badge**, Banner, **Button**, Calendar, Card, Chip, Collapsible, FieldGroup, **Icon**, Kbd, Progress, Separator, **Skeleton**
- **Form** — Checkbox, CheckboxGroup, ColorPicker, FileUpload, Form, FormField, Input, InputDate, InputMenu, InputNumber, InputTags, InputTime, Listbox, PinInput, RadioGroup, Select, SelectMenu, Slider, Switch, Textarea
- **Data** — Accordion, Carousel, Empty, Marquee, ScrollArea, Table, Timeline, Tree, User
- **Navigation** — Breadcrumb, CommandPalette, FooterColumns, Link, NavigationMenu, **Pagination**, Stepper, **Tabs**
- **Overlay** — ContextMenu, Drawer, DropdownMenu, **Modal**, **Popover**, **Slideover**, Toast, Tooltip
- **Page** — AuthForm, BlogPost(s), ChangelogVersion(s), Page, PageAnchors, PageAside, PageBody, PageCard, PageColumns, PageCTA, PageFeature, PageGrid, **PageHeader**, PageHero, PageLinks, PageList, PageLogos, PageSection, PricingPlan(s), PricingTable
- **Dashboard** — DashboardGroup, DashboardNavbar, DashboardPanel, DashboardResizeHandle, DashboardSearch, DashboardSearchButton, DashboardSidebar, DashboardSidebarCollapse, DashboardSidebarToggle, DashboardToolbar
- **AI Chat** — ChatMessage(s), ChatPalette, ChatPrompt, ChatPromptSubmit, ChatReasoning, ChatShimmer, ChatTool
- **Editor** — Editor, EditorDragHandle, EditorEmojiMenu, EditorMentionMenu, EditorSuggestionMenu, EditorToolbar
- **Content** — ContentNavigation, ContentSearch, ContentSearchButton, ContentSurround, ContentToc
- **Color Mode** — ColorModeAvatar, ColorModeButton, ColorModeImage, ColorModeSelect, ColorModeSwitch
- **i18n** — LocaleSelect

### 1b. Final `app/components/ui/` tree

Folder slugs are lowercase-kebab. `ClientOnly` is a Vue utility (not in the Nuxt UI
taxonomy) → recommended home is a non-taxonomy `utility/` folder (KEY DECISION #2).

```
app/components/ui/
├── element/
│   ├── Button.vue          (was AppButton)
│   ├── Badge.vue           (was AppBadge)
│   ├── Icon.vue            (was AppIcon)   ← collision-fixed (§3)
│   └── Skeleton.vue        (was AppSkeleton)
├── navigation/
│   ├── Tabs.vue            (was AppTabs)        reka Tabs*
│   └── Pagination.vue      (was AppPagination)  reka Pagination*
├── overlay/
│   ├── Modal.vue           (was AppModal)       reka Dialog*
│   ├── Slideover.vue       (was AppSlideover)   reka Dialog*
│   └── Popover.vue         (was AppPopover)     reka Popover* (already)
├── page/
│   └── PageHeader.vue      (was AppPageHeader)
├── utility/
│   └── ClientOnly.vue      (was common/ClientOnly.vue)
│
│   # Empty Nuxt UI categories — scaffolded per instruction, each gets .gitkeep:
├── layout/.gitkeep
├── form/.gitkeep
├── data/.gitkeep
├── dashboard/.gitkeep
├── ai-chat/.gitkeep
├── editor/.gitkeep
├── content/.gitkeep
├── color-mode/.gitkeep
└── i18n/.gitkeep
```

**`.gitkeep` list (9 empty categories):** `layout`, `form`, `data`, `dashboard`,
`ai-chat`, `editor`, `content`, `color-mode`, `i18n`.
After the move, `app/components/common/` is **empty → delete it**.

---

## 2. Component map (old `App*` → category → bare name → primitive)

| Old file (`app/components/…`) | Nuxt UI category | New path                       | Bare tag       | Backing primitive                                                   |
| ----------------------------- | ---------------- | ------------------------------ | -------------- | ------------------------------------------------------------------- |
| `AppButton.vue`               | Element          | `ui/element/Button.vue`        | `<Button>`     | **native** `<button>` / `<a>` / `RouterLink` (no reka primitive)    |
| `AppBadge.vue`                | Element          | `ui/element/Badge.vue`         | `<Badge>`      | **native** `<span>` (no reka primitive)                             |
| `AppIcon.vue`                 | Element          | `ui/element/Icon.vue`          | `<Icon>`       | **native** wrapper over `@iconify/vue` (no reka primitive) — see §3 |
| `AppSkeleton.vue`             | Element          | `ui/element/Skeleton.vue`      | `<Skeleton>`   | **native** `<div>` (no reka primitive)                              |
| `AppTabs.vue`                 | Navigation       | `ui/navigation/Tabs.vue`       | `<Tabs>`       | reka `TabsRoot/List/Trigger`                                        |
| `AppPagination.vue`           | Navigation       | `ui/navigation/Pagination.vue` | `<Pagination>` | reka `PaginationRoot/List/ListItem/Prev/Next/Ellipsis`              |
| `AppModal.vue`                | Overlay          | `ui/overlay/Modal.vue`         | `<Modal>`      | reka `DialogRoot/Portal/Overlay/Content/Title`                      |
| `AppSlideover.vue`            | Overlay          | `ui/overlay/Slideover.vue`     | `<Slideover>`  | reka `DialogRoot/Portal/Overlay/Content/Title`                      |
| `AppPopover.vue`              | Overlay          | `ui/overlay/Popover.vue`       | `<Popover>`    | reka `PopoverRoot/Trigger/Portal/Content` (already)                 |
| `AppPageHeader.vue`           | Page             | `ui/page/PageHeader.vue`       | `<PageHeader>` | **native** `<div><h1><p>` (no reka primitive)                       |
| `common/ClientOnly.vue`       | — (Vue utility)  | `ui/utility/ClientOnly.vue`    | `<ClientOnly>` | **native** (`onMounted` flag; no reka primitive)                    |

**Honest note:** 5 of 11 are native (Button, Badge, Icon, Skeleton, PageHeader) + ClientOnly.
They still move under `ui/<category>/` because the _taxonomy_ places them there
(Element / Page) and the user asked for "every component" to be reorganized — but
the migration adds **no reka-ui** to them (KEY DECISION #3).

### reka-ui API confirmation (verified from `reka-ui@2.9.9` d.ts)

All names below are **top-level exports** of `"reka-ui"` (grep-confirmed in `dist/index.js`):

- **Dialog** — `DialogRoot` (props `open?`, `defaultOpen?`, `modal?`; emit `update:open:[boolean]`), `DialogTrigger`, `DialogPortal`, `DialogOverlay` (prop `forceMount?`; renders scroll-lock via `useBodyScrollLock` in `DialogOverlayImpl`), `DialogContent` (prop `forceMount?`; cancelable emits `openAutoFocus`, `escapeKeyDown`, `pointerDownOutside`, `focusOutside`, `interactOutside`, `closeAutoFocus`), `DialogClose`, `DialogTitle`, `DialogDescription`. `data-state="open|closed"` confirmed on `DialogContentImpl` & `DialogOverlayImpl`.
- **Tabs** — `TabsRoot` (props `modelValue?`/`defaultValue?`/`orientation?`/`dir?`/`activationMode?`; emit `update:modelValue:[T]`), `TabsList`, `TabsTrigger` (props `value: StringOrNumber`, `disabled?`; `data-state="active|inactive"`), `TabsContent`, `TabsIndicator`.
- **Pagination** — `PaginationRoot` (props `page?`, `defaultPage?`, `itemsPerPage` **(required)**, `total?`, `siblingCount?`, `disabled?`, `showEdges?`; emit `update:page:[number]`), `PaginationList` (slot exposes `items`), `PaginationListItem` (prop `value: number`), `PaginationFirst`, `PaginationPrev`, `PaginationNext`, `PaginationLast`, `PaginationEllipsis`.
- **Popover** — `PopoverRoot`, `PopoverTrigger`, `PopoverPortal`, `PopoverContent` (extends `PopperContentProps`: `side?`, `sideOffset?`, `align?`, `avoidCollisions?`, …). Already in use.
- **Helpers** — `VisuallyHidden`, `Primitive` (top-level exports, used for the a11y `DialogTitle`).

> **Transition mechanism (verified):** reka-ui uses an internal `Presence` component;
> a part stays mounted while closing and unmounts after `transitionend`/`animationend`.
> Setting `forceMount` disables reka's `Presence` so you can drive enter/leave with
> Vue's own `<Transition>` — this is the path that lets us **reuse the current
> `<style scoped>` blocks verbatim** (§5). Both `forceMount` and `data-[state]`
> are real, confirmed props/attributes.

---

## 3. Collision flags + fixes

| Bare name    | Collides with                                                                                                                                                                                                                                                                                          | Verdict / fix                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Icon`**   | **SELF-COLLISION (critical).** `ui/element/Icon.vue` auto-registers globally as `<Icon>`, but the SFC does `import { Icon } from "@iconify/vue"` and renders `<Icon>`. The global `<Icon>` and the local import share the name → ambiguous, and risks unplugin-vue-components injecting a self-import. | **FIX (KEY DECISION #1):** alias the iconify import — `import { Icon as IconifyIcon } from "@iconify/vue"` and render `<IconifyIcon :icon="iconifyId" />`. Guarantees the global `<Icon>` (our component) and the iconify primitive never clash. Do this in Phase 0 as part of the move. |
| `Button`     | HTML `<button>` (lowercase)                                                                                                                                                                                                                                                                            | No clash — Vue tags are case-sensitive; `<Button>` ≠ `<button>`. No reka `Button` export. OK.                                                                                                                                                                                            |
| `Badge`      | —                                                                                                                                                                                                                                                                                                      | No HTML/reka `Badge`. OK.                                                                                                                                                                                                                                                                |
| `Modal`      | —                                                                                                                                                                                                                                                                                                      | reka has `Dialog*`, no bare `Modal`. OK.                                                                                                                                                                                                                                                 |
| `Slideover`  | —                                                                                                                                                                                                                                                                                                      | None. OK.                                                                                                                                                                                                                                                                                |
| `Tabs`       | reka `Tabs*`                                                                                                                                                                                                                                                                                           | reka exports `TabsRoot` etc., **no bare `Tabs`**. Our `<Tabs>` is distinct. OK.                                                                                                                                                                                                          |
| `Pagination` | reka `Pagination*`                                                                                                                                                                                                                                                                                     | reka exports `PaginationRoot` etc., **no bare `Pagination`**. OK.                                                                                                                                                                                                                        |
| `Popover`    | reka `Popover*`                                                                                                                                                                                                                                                                                        | reka exports `PopoverRoot` etc., **no bare `Popover`**. OK.                                                                                                                                                                                                                              |
| `Skeleton`   | —                                                                                                                                                                                                                                                                                                      | None. OK.                                                                                                                                                                                                                                                                                |
| `PageHeader` | —                                                                                                                                                                                                                                                                                                      | None (Nuxt's own `PageHeader` is from Nuxt UI, not present). OK.                                                                                                                                                                                                                         |
| `ClientOnly` | Nuxt built-in `<ClientOnly>`                                                                                                                                                                                                                                                                           | This repo is **Vite, not Nuxt** → no built-in to clash with. OK.                                                                                                                                                                                                                         |

**Inside the reka-based SFCs there is NO clash:** the bare component name (`Modal`,
`Slideover`, `Tabs`, `Pagination`, `Popover`) differs from every reka primitive it
imports (`DialogRoot`, `TabsRoot`, …), so those imports need **no** aliasing. Only
`Icon` needs the alias.

**Folder-name safety (verified):** no existing component folder is named `ui`,
`element`, `form`, `data`, `navigation`, `overlay`, `layout`, `page`, or `utility`
(current dirs: `blog`, `common`, `food-map`, `home{/art,/motion,/parts,/sections}`,
`profile`, `shared`, `site`). So adding those to `globalNamespaces` strips **only**
the new `ui/*` segments — see §4.

---

## 4. Auto-import config — exact edits (no-prefix without breaking anything)

### Why `globalNamespaces` is the right lever (verified)

`unplugin-vue-components@32.1.0` builds the component name in `getNameFromFilePath`
(`dist/utils-BfjsfvcK.mjs:166-193`). The decisive line:

```js
// :167  with directoryAsNamespace:true
if (globalNamespaces.some(name => folders.includes(name)))
  folders = folders.filter(f => !globalNamespaces.includes(f));   // strips EVERY matching segment
...
// :170  if all folders were stripped, folders is empty →
if (!isEmpty(folders)) { /* namespacing */ }                     // skipped
return filename;                                                  // → the bare PascalCase filename
```

So for `app/components/ui/overlay/Modal.vue` → `folders = ["ui","overlay"]`. If both
`"ui"` and `"overlay"` are in `globalNamespaces`, both are filtered out, `folders`
becomes `[]`, namespacing is skipped, and the result is the raw filename **`Modal`**
→ `<Modal>`. This is exactly how `globalNamespaces:["common"]` already yields
`<ClientOnly>` from `common/ClientOnly.vue` today (confirmed in `components.d.ts:28`).
It strips **all** matching segments regardless of position, so nested `ui/<category>/`
collapses to a bare name. **No `directoryAsNamespace:false`, no custom resolver needed.**

Only categories that _contain_ components need listing: `element`, `navigation`,
`overlay`, `page`, `utility`, plus the `ui` parent. Empty `.gitkeep` categories
register no component, so they are irrelevant to resolution.

### Edit 1 — `vite.config.ts` (the `Components({…})` plugin)

```diff
   Components({
     dirs: ["app/components"],
     directoryAsNamespace: true,
-    globalNamespaces: ["common"],
+    // ui/<category>/<Name>.vue → bare <Name>. Every segment under ui/ that names
+    // a category (or "ui" itself, or the "utility" home for ClientOnly) is stripped,
+    // so e.g. ui/overlay/Modal.vue resolves to <Modal>. "common" dropped — common/
+    // is now empty (ClientOnly moved to ui/utility/).
+    globalNamespaces: ["ui", "element", "navigation", "overlay", "page", "utility"],
     collapseSamePrefixes: true,
     dts: "components.d.ts",
     resolvers: [ /* Home* resolver — UNCHANGED */ ],
   }),
```

- `<Home*>` resolver: **untouched** — still maps `HomeSectionHero` → `home/sections/SectionHero.vue`. (Home folders aren't in the new namespace list, so unaffected.)
- `<ClientOnly>`: still resolves bare — now via stripping `utility` instead of `common`.
- Flat resolution: there are no longer any flat `app/components/*.vue` (all moved into `ui/`), so nothing else changes.

### Edit 2 — `.storybook/main.ts` (the parallel `Components({…})`) — **MANDATORY**

Several existing stories render consumers of `App*` (`SearchModal`→Slideover+Button,
`PostCard`→Badge+Icon, `PostCardSkeleton`→Skeleton, `FilterButton`→Popover+Icon,
`profile/Page`→Tabs, `ImageGallery`/`YoutubeGallery`→Modal+Icon, …). After the rename
those tags must resolve in Storybook too, so the Storybook `Components()` config must
carry the **same** `globalNamespaces`:

```diff
   Components({
     dts: false,
     dirs: [`${appDir}/components`],
     directoryAsNamespace: true,
+    globalNamespaces: ["ui", "element", "navigation", "overlay", "page", "utility"],
     collapseSamePrefixes: true,
   }),
```

> **Pre-existing drift to note (not caused by us):** the Storybook config also lacks
> `globalNamespaces:["common"]` and the Home resolver that `vite.config.ts` has.
> Adding the line above is strictly additive (it only makes more names resolve) and
> safe. Recommend also syncing the Home resolver into Storybook for true parity, but
> that is optional and outside this migration's blast radius.

### `components.d.ts` regeneration

`components.d.ts` is generated. After the moves + config change, delete it and let
the dev server / `vp check` regenerate it (the gate runs `pnpm check`). Expect the
10 `App*`/`ClientOnly` lines to become `Badge`, `Button`, `Icon`, `Modal`, `Pagination`,
`PageHeader`, `Popover`, `Skeleton`, `Slideover`, `Tabs`, `ClientOnly` pointing at the
new `ui/**` paths. Commit the regenerated file.

---

## 5. Per-interactive-component reka-ui composition (API + visuals preserved)

General rule for all four: **public props/slots/emits stay identical; callers change
only the tag name.** Carry the _exact_ current Tailwind classes onto the reka parts.
For overlays, reuse the current `<Transition>`/`<style scoped>` **verbatim** via
`forceMount` (recommended) so the animation is pixel-identical by construction.

### 5a. `Modal` (was `AppModal`) — reka `Dialog`

**Preserve:** prop `open` (`v-model:open`), `fullscreen?`, `ui?: { content?: string }`;
slot `#content`; emit `update:open`. Callers: `home/parts/ImageGallery.vue`
(`:ui="{content:'max-w-4xl p-0 overflow-hidden'}"`), `home/parts/YoutubeGallery.vue`
(`fullscreen`, `:ui="{content:'p-0 overflow-hidden'}"`).

**Composition:**

```
DialogRoot :open="open" @update:open="emit('update:open',$event)" :modal="true"
  DialogPortal
    <Transition name="app-overlay">              ← existing block, verbatim
      DialogOverlay v-if="open" force-mount
        class="fixed inset-0 z-40 bg-black/50"    ← current overlay classes
    <Transition name="app-modal">                 ← existing block, verbatim
      DialogContent v-if="open" force-mount
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('update:open',false)"   ← preserves backdrop-click close
        VisuallyHidden > DialogTitle "Dialog"      ← a11y only, sr-only, zero visual
        <div :class="cn('relative bg-pure-white rounded-card overflow-hidden', contentClass)">
          <slot name="content" />
```

- `contentClass` computed kept verbatim (`fullscreen` → `w-screen h-screen max-w-none rounded-none`; else `ui.content ?? 'w-full max-w-lg'`).
- **Transition:** `force-mount` + reuse the existing `.app-overlay-*` / `.app-modal-*` `<style scoped>` (opacity 200ms; opacity+scale .96 200ms). Identical animation.
- **a11y gained (free from reka):** focus trap + focus return to trigger, `Esc` close, `aria-modal`, scroll-lock (`useBodyScrollLock`). `DialogTitle` (visually hidden) silences reka's missing-title warning without changing pixels.
- **Outside-click:** current behaviour = click backdrop/padding closes, click panel doesn't. DialogContent is full-screen so reka's `interactOutside` never fires; the preserved `@click.self` is the close driver — identical to today.

### 5b. `Slideover` (was `AppSlideover`) — reka `Dialog`

**Preserve:** `open` (`v-model:open`), `side?` (`top|right|bottom|left`, default `right`),
`overlay?`, `dismissible?`, `ui?: { overlay?: string }`; slot `#content="{ close }"`;
emit `update:open`. Caller: `blog/SearchModal.vue` (`side="top"`, `:overlay`,
`:transition`, `:dismissible`, `:ui="{overlay:OVERLAY_CLASS}"`).

> **`transition` prop:** currently **undeclared** → falls through `$attrs` onto the
> root, a no-op. To keep the caller byte-identical without a stray DOM attr, declare
> `transition?: boolean` and ignore it. (Flag: harmless, documents intent.)

**Composition:** same skeleton as Modal, but:

- `DialogOverlay` background = `ui?.overlay ?? 'bg-black/50'` (current logic); overlay click gated by `dismissible !== false`.
- `DialogContent` positioned by the existing `panelClass` side-switch (verbatim classes), wrapped in the existing per-side `<Transition name="app-slide-${side}">` + `force-mount`.
- Slot close: `<slot name="content" :close="() => emit('update:open', false)" />` — preserves the `{ close }` contract.
- **`dismissible:false`** → on `DialogContent` add `@escape-key-down.prevent`, `@pointer-down-outside.prevent`, `@interact-outside.prevent` (all confirmed cancelable emits) so Esc/outside don't close. (Today `dismissible` only gates the overlay click; reka extends it to Esc/outside too — a behavioural _improvement_ consistent with the prop's intent. Flag for sign-off if exact parity is required.)
- Reuse `.app-overlay-*` and `.app-slide-{top,right,bottom,left}-*` styles verbatim.
- a11y gained: focus trap, focus-to-input on open, `Esc`, scroll-lock.

### 5c. `Tabs` (was `AppTabs`) — reka `Tabs`

**Preserve:** `modelValue: string` (`v-model`), `items: {label,value}[]`; emit
`update:modelValue`. Caller: `profile/Page.vue` (`<Tabs v-model="activeTab" :items …/>`).
Today the component renders **only the trigger strip** (no panels — the page renders
the active bio itself).

**Composition:**

```
TabsRoot :model-value="modelValue" @update:model-value="emit('update:modelValue',$event)"
         :class="$attrs.class"                       ← passthrough (caller's w-full)
  TabsList class="flex justify-center border-b border-abyssal-ink/10"
    TabsTrigger v-for item :value="item.value"
      class="px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-px
             border-transparent text-abyssal-ink/50 hover:text-abyssal-ink
             data-[state=active]:border-digital-orange data-[state=active]:text-abyssal-ink"
      {{ item.label }}
```

- The active/inactive ternary becomes `data-[state=active]:…` utilities (reka sets `data-state="active|inactive"` on the trigger). Visual identical: active = orange bottom-border + ink text; inactive = transparent border + ink/50, hover ink.
- a11y gained: roving focus, Left/Right/Home/End arrow nav, `role="tab"`, `aria-selected`.
- **Flag / KEY DECISION #4:** because the caller renders content outside the component
  (no `TabsContent`), the triggers have no `aria-controls` panel linkage, and reka may
  warn about absent content. We get keyboard + `aria-selected` a11y but **not** full
  tab↔panel ARIA unless `profile/Page.vue` is refactored to use `TabsContent`
  (which would change the caller). Recommend triggers-only to honour "callers change
  only the tag name."

### 5d. `Pagination` (was `AppPagination`) — reka `Pagination`

**Preserve:** props `page`, `total`, `itemsPerPage`, `disabled?`; emit `update:page`;
slot `#item="{ item, page }"` where `item = { key, type:'page'|'ellipsis', value }`.
Caller: `pages/blogs/index.vue` (`:total="totalPages*PER_PAGE"`, `:items-per-page`,
`#item` renders an `<Button square outline>` per page).

**Composition (keep our windowing, gain reka a11y):**

```
PaginationRoot :page="page" @update:page="emit('update:page',$event)"
               :total="total" :items-per-page="itemsPerPage" :disabled="disabled"
  nav.flex.items-center.gap-1 (or PaginationList)
    PaginationPrev as-child
      <button …existing prev classes…><Icon name="i-lucide-chevron-left" .../></button>
    template v-for item in pageItems                 ← existing computed, UNCHANGED
      PaginationListItem v-if item.type==='page' :value="Number(item.value)" as-child
        <slot name="item" :item="item" :page="page" />
      else  <slot name="item" :item="item" :page="page" />   ← ellipsis, unchanged
    PaginationNext as-child
      <button …existing next classes…><Icon name="i-lucide-chevron-right" .../></button>
```

- **Keep the existing `pageItems` computed** (always first/last + ±1 window + ellipsis) and feed it to the same `#item` slot → windowing + slot contract are **byte-identical**. reka's `PaginationList` windowing is _not_ used, avoiding any off-by-one drift (KEY DECISION #5).
- `PaginationPrev/Next` as-child wrap the existing chevron buttons (identical classes incl. `disabled:opacity-30`); reka auto-disables them at bounds and adds `aria-label`. Our explicit `:disabled` still applies via `PaginationRoot`.
- a11y gained: roving focus across page buttons, `aria-current` on the active page, labelled prev/next.

### 5e. `Popover` (was `AppPopover`) — already reka

No behavioural change. Phase 0 only **moves** the file to `ui/overlay/Popover.vue` and
the caller (`blog/FilterButton.vue`) switches `<AppPopover>` → `<Popover>`. Internals
(`PopoverRoot/Trigger/Portal/Content`, `side`/`align`/`side-offset`) untouched.

---

## 6. Caller blast-radius (per component)

Counts are whole-repo opening-tag occurrences (`grep -ho '<App… '`). `.md`/doc
references in `CLAUDE.md` and `docs/superpowers/plans/…` are prose examples, **not**
runtime callers — optional to update.

| Old tag           | Occ. | Caller files (runtime)                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<AppButton>`     | 9    | `blog/SearchModal.vue`, `home/parts/DirectionPair.vue`, `home/sections/SectionNewsletter.vue`, `home/sections/SectionSupport.vue`, `site/Header.vue`, `pages/blogs/index.vue`                                                                                                                                                                                                                            |
| `<AppBadge>`      | 2    | `blog/PostCard.vue`, `food-map/FoodMapDetail.vue`                                                                                                                                                                                                                                                                                                                                                        |
| `<AppModal>`      | 2    | `home/parts/ImageGallery.vue`, `home/parts/YoutubeGallery.vue`                                                                                                                                                                                                                                                                                                                                           |
| `<AppSlideover>`  | 1    | `blog/SearchModal.vue`                                                                                                                                                                                                                                                                                                                                                                                   |
| `<AppTabs>`       | 1    | `profile/Page.vue`                                                                                                                                                                                                                                                                                                                                                                                       |
| `<AppPagination>` | 1    | `pages/blogs/index.vue`                                                                                                                                                                                                                                                                                                                                                                                  |
| `<AppPopover>`    | 1    | `blog/FilterButton.vue`                                                                                                                                                                                                                                                                                                                                                                                  |
| `<AppSkeleton>`   | 8    | `blog/PostCardSkeleton.vue` (8 tags in one file)                                                                                                                                                                                                                                                                                                                                                         |
| `<AppPageHeader>` | 2    | `pages/blogs/[...slug].vue`, `pages/blogs/index.vue`                                                                                                                                                                                                                                                                                                                                                     |
| `<AppIcon>`       | 25   | `blog/FilterButton.vue`, `blog/PostCard.vue`, `blog/SearchModal.vue`, `food-map/FoodMapTopBar.vue`, `home/motion/Portal.vue`, `home/parts/DirectionPair.vue`, `home/parts/ImageGallery.vue`, `home/parts/Product.vue`, `home/parts/YoutubeGallery.vue`, `shared/ScrollToTopButton.vue`, `site/Footer.vue`, `site/Header.vue`, `pages/blogs/[...slug].vue` **+ internal:** `Button.vue`, `Pagination.vue` |
| `<ClientOnly>`    | 1    | `food-map/FoodMapApp.vue` (only the comment in `useFoodMapStore.ts` mentions it — no change there)                                                                                                                                                                                                                                                                                                       |

**Unique caller files (excluding the 10 moved components):** 20 —
SearchModal, DirectionPair, SectionNewsletter, SectionSupport, Header, blogs/index,
PostCard, FoodMapDetail, ImageGallery, YoutubeGallery, profile/Page, FilterButton,
PostCardSkeleton, blogs/[...slug], FoodMapTopBar, Portal, Product, ScrollToTopButton,
Footer, FoodMapApp. Closing tags (`</AppModal>` etc.) must be renamed too.
**No `*.stories.ts` mentions an `App*` name** — story sources need no edits; Storybook
correctness comes from the §4 Edit 2 config change.

---

## 7. Phased execution plan (GSD, with gates)

**Visual-verification rule (from CLAUDE.md):** drive Playwright in the background and
`Read` the screenshot before declaring a phase done. Capture a baseline screenshot set
**before** Phase 0.

### Phase 0 — Reorg + rename + auto-import + caller updates (mechanical, ZERO behavior change)

**Scope**

1. `git mv` each `App*.vue` → `ui/<category>/<Bare>.vue` and `common/ClientOnly.vue` → `ui/utility/ClientOnly.vue` (per §2). Delete empty `common/`.
2. Create the 9 empty-category `.gitkeep` files (§1b).
3. **Icon collision fix** (§3): in `ui/element/Icon.vue`, `import { Icon as IconifyIcon }` and render `<IconifyIcon>`.
4. Rename internal `<AppIcon>` refs inside moved components: `Button.vue` and `Pagination.vue` → `<Icon>`.
5. Rename all 20 caller files' tags `<App*>`/`</App*>` → bare, incl. `<ClientOnly>` stays bare (now via `utility`).
6. `vite.config.ts` + `.storybook/main.ts` `globalNamespaces` edits (§4).
7. Delete + regenerate `components.d.ts`.
   - **No internal markup/behavior changes** — Modal is still Teleport+Transition, Tabs still hand-rolled buttons, etc. Only files move and tags rename. Visuals identical by construction.

**Files touched:** 10 moved components + 20 caller files + `vite.config.ts` + `.storybook/main.ts` + `components.d.ts` + 9 `.gitkeep`.

**Gate:**

- `pnpm check` (lint + format + typecheck) passes; `components.d.ts` shows bare names at `ui/**` paths.
- `pnpm test` (Vitest) green.
- Dev server boots; Playwright smoke of `/`, `/blogs`, `/jen-knows`, `/sydney-food-map` → screenshots **pixel-match** the pre-Phase-0 baseline (tag-only rename ⇒ identical render). Confirm the blog FilterButton **Popover** opens (only moved reka component).
- `pnpm storybook` boots; render `SearchModal`, `PostCard`, `PostCardSkeleton`, `FilterButton`, `profile/Page` stories without unresolved-component errors.

### Phase 1 — `Modal` → reka `Dialog` (Tier-3)

**Scope:** rewrite `ui/overlay/Modal.vue` internals per §5a (`DialogRoot/Portal/Overlay/Content` + `force-mount` + verbatim `<Transition>`/`<style>` + sr-only `DialogTitle`). Public API + callers unchanged.
**Files:** `ui/overlay/Modal.vue` only.
**Gate:** `pnpm check` + `pnpm test`. Playwright before/after on **both** triggers — home image-gallery lightbox (`/`) and YouTube fullscreen modal: screenshots pixel-identical at open + closed + a mid-transition frame. **a11y checks:** `Esc` closes; focus trapped inside; focus returns to trigger on close; `<body>` scroll locked while open; backdrop click closes (panel click does not).

### Phase 2 — `Slideover` → reka `Dialog` (Tier-3)

**Scope:** rewrite `ui/overlay/Slideover.vue` per §5b (side-positioned `DialogContent`, per-side `<Transition>` verbatim, `dismissible`→prevent-close wiring, `{ close }` slot, declare-and-ignore `transition`). Caller `SearchModal.vue` unchanged.
**Files:** `ui/overlay/Slideover.vue` only.
**Gate:** `pnpm check` + `pnpm test`. Playwright on `/blogs` → open search Slideover (slides from top, `OVERLAY_CLASS` backdrop): pixel-identical slide-in/out. **a11y:** `Esc` closes; focus trap; focus to search input on open; scroll lock; `dismissible` behaviour preserved.

### Phase 3 — `Tabs` → reka `Tabs` (Tier-3)

**Scope:** rewrite `ui/navigation/Tabs.vue` per §5c (`TabsRoot/List/Trigger`, `data-[state=active]` styling, triggers-only). Caller `profile/Page.vue` unchanged.
**Files:** `ui/navigation/Tabs.vue` only.
**Gate:** `pnpm check` + `pnpm test`. Playwright on `/jen-knows` **and** `/jen-liu`: active tab = orange underline + ink text, inactive = ink/50; clicking a tab swaps the bio (`v-model` still fires). **a11y:** Left/Right arrows move the active tab (roving focus); `aria-selected` present.

### Phase 4 — `Pagination` → reka `Pagination` (Tier-3)

**Scope:** rewrite `ui/navigation/Pagination.vue` per §5d (`PaginationRoot` + `PaginationPrev/Next` as-child + **existing `pageItems`** rendered via `PaginationListItem`; `#item` slot contract preserved). Caller `pages/blogs/index.vue` unchanged.
**Files:** `ui/navigation/Pagination.vue` only.
**Gate:** `pnpm check` + `pnpm test`. Playwright on `/blogs` pagination: prev/next chevrons, page pills, ellipsis, active orange-outline pill all pixel-identical; clicking a page navigates; prev/next disabled at bounds. **a11y:** roving focus across page buttons; `aria-current` on active page.

**Ordering rationale:** Phase 0 unblocks everything (largest blast radius, but provably
zero behaviour change). Overlays next because they share the `Dialog` primitive — Modal
(simplest) seeds the pattern, Slideover reuses it + side/dismissible. Tabs then
Pagination (most intricate, item-mapping). `Popover` needs no phase (already reka;
moved in Phase 0).

---

## 8. Constraints that hold / risks to sign off

- **SSR/SSG safety:** `DialogRoot`/`TabsRoot`/`PaginationRoot`/`PopoverRoot` are SSR-safe; overlays teleport to `<body>` via `DialogPortal`/`PopoverPortal` — fine under vite-ssg hydration (content renders only when `open`). No new `<ClientOnly>` needed for these. Leaflet stays in `<ClientOnly>` (unchanged). No dark mode introduced.
- **Pixel-identical holds** for Modal/Slideover (verbatim CSS via `forceMount`), Tabs (data-state utilities map 1:1 to the ternary), Pagination (own `pageItems` kept), Popover (unchanged).
- **Cannot hold without a flag:**
  - Tabs has no `aria-controls` panel linkage unless the caller adopts `TabsContent` (KEY DECISION #4).
  - Slideover `dismissible:false` now also blocks `Esc`/outside-click (today it only gated overlay click) — an intentional a11y improvement; flag if byte-for-byte parity is required.
  - Adding sr-only `DialogTitle` is required by reka for a11y (silences a console warning); it is visually hidden → zero pixel impact.

---

## 9. KEY DECISIONS (need user sign-off before Phase 0)

1. **Icon collision fix** → alias the iconify import as `IconifyIcon` so the component can be bare `<Icon>`. _(Recommended; alternative is to keep a distinct name like `UiIcon`/`AppIcon`, which violates the "no prefix" goal.)_
2. **Where `ClientOnly` lives** → `ui/utility/ClientOnly.vue` with `utility` in `globalNamespaces`. _(Recommended; alternatives: `ui/ClientOnly.vue` flat, or leave it in `common/`.)_
3. **Native components under `ui/<category>/`** → place Button/Badge/Icon/Skeleton in `ui/element/` and PageHeader in `ui/page/` even though they use **no** reka-ui (the Nuxt UI taxonomy lists them there). _(Recommended per the instruction; alternative is a flat `ui/` for natives.)_
4. **Tabs a11y scope** → triggers-only (keyboard + `aria-selected`, caller unchanged) vs. refactor `profile/Page.vue` to `TabsContent` for full panel ARIA (caller changes). _(Recommend triggers-only.)_

_Sub-decisions (low-stakes, recommended defaults):_ keep Pagination's hand-rolled
`pageItems` windowing (exact visual) rather than reka's `PaginationList`; scaffold all
9 empty Nuxt UI categories with `.gitkeep` as instructed.
