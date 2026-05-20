---
name: 06-navigation-and-remove-about
description: Point nav at the two new pages, swap the header CTA to subscribe, delete /about.
---

# 06 — Update navigation + remove `/about`

## Goal

Make the two new destinations reachable and retire the about page.

## Why (reasoning chain)

- The pages exist after tasks 04/05, so wiring nav now keeps links from ever pointing at 404s (linear order).
- Owner decided: no /about. The header CTA should push the primary action (subscribe), matching the new
  homepage emphasis.

## Inputs / references

- Nav source: `app/components/site/Header.vue` (`navItems` array, desktop + mobile both map it).
- Footer may also link About — check `app/components/site/Footer.vue`.
- Hero (`SectionHero.vue`) has an "About Jen" button — removed when Hero is rewritten in task 07, but if
  task 07 isn't done yet, also strip the `/about` link here to avoid a dead link.
- Subscribe link: REFERENCE §4.

## Steps

1. In `Header.vue`, set `navItems` to (drop About, add the two identities):
   `Home /` · `Jen Knows /jen-knows` · `Jen Liu /jen-liu` · `Restaurants /my-best-restaurants-search-in-sydney` · `Blogs /blogs`.
2. Change the header CTA from "Get In Touch" (`href="#footer"`) to **訂閱電子報** linking to the Kit URL
   (`target="_blank" rel="noopener"`). Keep the orange pill styling + scrolled height behavior.
3. Grep for any remaining `/about` links (`Footer.vue`, `SectionHero.vue`, anywhere) and remove/redirect.
4. Delete `app/pages/about.vue`.

## Acceptance criteria

- Nav (desktop + mobile drawer) shows the 5 items; all resolve.
- Header CTA opens the Kit subscribe page.
- No remaining link points to `/about`; `/about` returns 404.

## Gotchas

- `navItems` is consumed by BOTH desktop nav and mobile drawer — one edit covers both.
- Don't hardcode the Kit URL inline if it's already a const elsewhere; otherwise define a local const.
