# MIMIC_CALDERA

Clone caldera.xyz landing page aesthetic onto `app/pages/index.vue`, plus matching `/about` and `/blogs` pages. Branch: `experiment/design`. Reference dump: `~/Documents/caldera/Caldera - The Internet of Chains.html`. Design tokens in `DESIGN (1).md` + `theme.css` + `tokens.json` (root of repo).

## Constraints

- Replace ONLY files inside `app/pages/`. New components in `app/components/` allowed. Do NOT delete anything outside `app/pages/`.
- Content backup retained at `app/pages_backup/`.
- Existing config files (`nuxt.config.ts`, `app.config.ts`, `app/assets/css/main.css`, `content.config.ts`) — **read before edit**, merge cleanly, never clobber Cloudflare preset / nuxt-content / `contacts[]`.
- Fonts via `@nuxt/fonts` (self-hosted Bebas Neue display + Inter body). No raw Google Fonts `<link>`.
- Light mode only. Disable Nuxt UI color mode to keep bundle small.
- English copy only this round.
- All decorative SVG = original artwork. Sydney / Australia motif (Opera House sails, Harbour Bridge arc, wave, gum leaf, etc.). Two-tone using `Cyber Violet` + `Digital Orange` + `Pure White` accents.
- SKIP the "Backed by the best" investor partners section — Jen has no business partners.
- Adapt copy: Jen's real data where available (`contacts[]` from `app.config.ts`), placeholder dummy elsewhere — placeholder copy may reference Sydney/Australia loosely for tonal consistency.
- Each task = one logical chunk + browser verification before tick.

## Architecture decision — Nuxt UI v4 first

`@nuxt/ui ^4.7.1` ships a full landing-page kit (`UHeader`, `UNavigationMenu`, `UFooter`, `UFooterColumns`, `UPageHero`, `UPageFeature`, `UPageGrid`, `UPageCard`, `UPageColumns`, `UPageCTA`, `UPageSection`, `UPageHeader`, `UTabs`, `UBlogPost`, `UBlogPosts`, `UInput`, `UFormField`, `UButton`, `UBadge`, `UMarquee`, `UBanner`, ...).

**Default = compose Nuxt UI primitives + theme them via `app.config.ts → ui` and Tailwind v4 `@theme`.** Build a custom `.vue` component only when (a) decorative SVG (no library ships these), or (b) the same shape is genuinely reused 3+ times.

Custom files this project actually needs:

- `app/components/site/Footer.vue` (thin wrapper around `UFooter` + `UFooterColumns`)
- `app/components/home/OperaHouseSvg.vue`
- `app/components/home/HarbourBridgeSvg.vue`
- `app/components/home/WaveSvg.vue`
- `app/components/home/GlyphSvg.vue` (kind: gum-leaf | terminal | book | compass | coffee | surf | ferris | sail)
- (optional) `app/components/home/KoalaSvg.vue`

Everything else = inline Nuxt UI in page files. Page files may grow to ~250 lines — use `// #region` blocks per existing CLAUDE.md rule before splitting into wrapper components.

## Tasks

- [x] 01_tokens_and_fonts
- [ ] 02_styleguide ← visual catalogue / `/styleguide` route (early feedback)
- [ ] 03_layout_shell
- [ ] 04_hero_with_opera_house_svg
- [ ] 05_stats_grid
- [ ] 06_features_two_columns
- [ ] 07_use_case_tabs
- [ ] 08_testimonials
- [ ] 09_blog_cards
- [ ] 10_newsletter_band
- [ ] 11_footer
- [ ] 12_about_page
- [ ] 13_blogs_page
- [ ] 14_responsive_polish
- [ ] 15_cleanup

## Lifecycle

1. **Now:** plan + write all task files (no code yet).
2. **First commit:** project-management structure only.
3. **Middle commits:** one per task, sequential.
4. **Final commit (task 15):** delete `.claude/project-management/MIMIC_CALDERA/`, update `CLAUDE.md` to match new architecture, present a confirm-list to Jen for optional artifact removal (`DESIGN.md`, `DESIGN (1).md`, root `theme.css`, `tokens.json`, `CLAUDE.draft.md`, `app/pages_backup/`). `/styleguide` remains in production as living spec.

Progress pointer: `PROGRESS_<NN>` file at folder root marks active task.
