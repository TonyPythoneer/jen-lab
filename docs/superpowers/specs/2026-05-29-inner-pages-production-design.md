# Inner Pages → Production-Level Design (Direction A: Bold Poster)

> **Status: brainstorming checkpoint (resume here).** Design direction is LOCKED.
> Profile-page mockup approved. Blog mockups + spec finalisation + implementation plan are still TODO.
> Saved 2026-05-29 because the session was running out of tokens. A fresh agent can continue from "Next Steps".

## Goal

Raise three page areas of the jen-lab site to a polished, shipped, production-level look — matching the bar already set by the homepage. **The restaurant page is explicitly out of scope.**

In scope:

- `app/pages/jen-liu.vue` and `app/pages/jen-knows.vue` — both render the shared **`app/components/profile/Page.vue`** (`ProfilePage`). Restyle that one component and both pages benefit.
- `app/pages/blogs/index.vue` (list + search/filter) and `app/pages/blogs/[...slug].vue` (post detail).

## Locked decision — Direction "A: Bold Poster"

Chosen by the user from a 3-way visual comparison (A Bold Poster vs B Masthead Grid vs C Collaged Canvas). A scored highest (brandFit 9 / productionBar 9 / distinctiveness 8).

A high-fidelity, approved mockup of the **profile page** in this direction is saved at:
`docs/superpowers/specs/assets/2026-05-29-bold-poster-profile-mockup.html` (open in a browser — it is a standalone doc using the real palette + fonts). Treat it as the visual source of truth for the profile page.

### Design language (must stay inside the existing "Caldera" system)

Use ONLY existing tokens — no new colors/fonts. Tokens live in `app/assets/css/theme.css`:
`--color-basalt-canvas #e2e2df` (page bg) · `--color-ash-white #f7f6f2` (cards) · `--color-abyssal-ink #070607` (ink) · `--color-pure-white #ffffff` · `--color-digital-orange #fc5000` (primary) · `--color-cyber-violet #524ae9` (secondary) · `--color-pixel-glare #f5f28e` · `--color-sydney-sky #87ceeb`. Display font `font-display` = Bebas Neue (ALL-CAPS); body `font-sans` = DM Sans. Shapes: `rounded-button` (800px pill), `rounded-card` (40px), `rounded-input` (100px).

**Bold Poster — concrete design moves:**

- **Headline scale:** Bebas Neue ALL-CAPS, 80–120px on desktop (64px mobile), `leading-[0.9]`, `tracking-[0.03em]`. Profile name dominates its container; crop the right edge on desktop (overflow clip) for intentional poster tension. Section headings (PRODUCTS, LINKS) at 48–56px in the same tight style.
- **Asymmetric grid:** staggered columns — narrower left, wider right. Cards shift left/right by 2–3 spacing units. Section heading bleeds left, content indented (deliberate friction). Single column on mobile.
- **Colored blocks:** product cards get a hard full-height left-border stripe (8–12px) in digital-orange or cyber-violet, or a 10–15% background tint. Links/portal cells get a subtle cyber-violet tint + 2px border on hover.
- **No soft shadows:** use hard inset/offset shadows only (sticker energy). Sharp 0° corners on framed images.
- **Pill buttons as punctuation:** the 800px pills are the only soft-rounded elements; stack vertically when 2+, orange primary absorbs weight, neutral-outline recedes; full-width pills on mobile.
- **Poster image treatment:** product images mounted with a hard ash-white 12–16px frame, 0 radius corners, and a 6px offset shadow (right+down, abyssal-ink ~0.8).
- **Spacing rhythm:** 40px between major sections, 24px card padding, 16px grid gaps; micro 8–12px for inline text+icons.

## User refinements to apply (REQUIRED)

1. **Profile hero: remove BOTH CTA buttons** currently in `ProfilePage.vue` — `訂閱電子報` (subscribe) and `請我喝奶茶` (support). The hero no longer carries CTAs.
2. **Reuse the existing support section for 請我喝奶茶.** `app/components/home/SectionSupport.vue` (auto-imported as `HomeSectionSupport`) already renders the bubble-tea support block. Render it **inside `ProfilePage.vue`, after the last section, just before the page footer.** Do not rebuild it.
3. **Do NOT modify the header or footer styles** — `app/components/site/Header.vue` and `app/components/site/Footer.vue` are off-limits.
4. **Use Nuxt UI (`@nuxt/ui` v4) components** to build the UI wherever a component fits (see the `nuxt-ui` skill). Don't hand-roll what Nuxt UI already provides.

### Open questions for the resuming agent (confirm with user)

- The hero's `訂閱電子報` (newsletter) CTA is removed per refinement #1. There IS a reusable `HomeSectionNewsletter` (`app/components/home/SectionNewsletter.vue`). **User did not ask to re-place the newsletter anywhere** — leave it out unless the user requests it. Confirm before adding.
- `SectionSupport.vue` hard-codes BOTH "支持 Jen Knows" and "支持 Jen Liu" buttons. On the jen-liu / jen-knows profile pages, should it show only the matching brand's support button? Currently it shows both. Confirm desired behaviour (may need a prop).

## Scope guardrails

- **Blog data/search layer stays as-is.** Keep WP API (`~/utils/wpApi`), `useBlogList`, taxonomies (`queryCollection` wpCategories/wpTags), pagination, URL sync, caching. This is **visual/UX restyle only** — the user is "lazy to deal with the search/data process". Do not refactor the data flow.
- Respect repo constraints in `CLAUDE.md`: light mode only; `SitePageContainer` on all non-home pages; `useLazyAsyncData` (not `useAsyncData`); plain-English comments; no hardcoded domain strings in templates (use `<script setup>` constants); verify visual changes with webwright (dev server runs at :3500, user-managed — never start/kill).

## Where things are

- Approved profile mockup (durable): `docs/superpowers/specs/assets/2026-05-29-bold-poster-profile-mockup.html`
- Ephemeral brainstorm artifacts (gitignored, may be cleaned): `.superpowers/brainstorm/54738-1780015748/` — `content/directions-gallery.html` (the 3-way gallery), `mockups/{A,B,C}-*-profile.html`.
- Visual companion server was at `http://localhost:50348` (auto-exits after 30 min idle; restart with `superpowers/.../brainstorming/scripts/start-server.sh --project-dir <repo>` if needed).
- Target files: `app/components/profile/Page.vue`, `app/pages/blogs/index.vue`, `app/pages/blogs/[...slug].vue`, reuse `app/components/home/SectionSupport.vue`.

## Next Steps (resume here)

1. Restart the visual companion if you want to keep showing mockups (optional). Generate **blog index + blog detail** mockups in the Bold Poster direction; get user confirmation. (Profile is already approved.)
2. Finalise this spec (resolve the two open questions with the user), then run the **spec self-review** (placeholders / consistency / scope / ambiguity).
3. Ask the user to review the spec.
4. Invoke the **writing-plans** skill to produce the implementation plan (per-file: ProfilePage.vue restyle + remove CTAs + append HomeSectionSupport; blogs index + detail restyle with Nuxt UI; keep data layer untouched; webwright visual verification).
5. Implement (TDD where it applies), verify each route in webwright, then `requesting-code-review` / finish-branch.

## Brainstorming process state

Checklist progress: (1) explore ✅ (2) visual companion ✅ (3) clarify — direction picked via gallery ✅, two open questions remain (4) propose approaches ✅ (workflow: 5 concepts → judge → top 3) (5) present design — profile approved; blog pending (6) write spec — this doc, finalise after blog mockups (7) user reviews spec — pending (8) writing-plans — pending. **Do NOT start implementation until the spec is approved (brainstorming HARD-GATE).**
