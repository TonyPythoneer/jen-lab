# 05 — Rewrite SectionProductDots Copy

## WHY

Current copy is design-system developer jargon copied verbatim from the Caldera source:
"Every section composes from the same six tokens — colour, radius, type, spacing, font, shadow.
Add another card and it just fits."
A personal site visitor doesn't care about design tokens. This alienates the audience.

## WHAT was observed

`app/components/home/SectionProductDots.vue` — the decorative dot-grid section between Stats
and Features. Playwright `05_product_dots.png` confirms the section is visible and the copy
reads as technical placeholder content.

## HOW (exact steps)

Replace the badge text, headline, and body inside `SectionProductDots.vue`.
Candidate copy (pick one or adapt):

**Option A — lean into "living lab" metaphor:**

- Badge: `A living experiment`
- Headline: `Always In Progress.`
- Body: `This site is never finished — and that's the point. Each section is a snapshot of what I'm building, eating, or thinking about right now.`

**Option B — Sydney / personal focus:**

- Badge: `Brewed in Sydney`
- Headline: `One Harbour,<br>Many Currents.`
- Body: `Food logs, code experiments, long walks, and the occasional half-marathon. All in one place.`

Keep the dot-field background visual unchanged — only the text content changes.

## VERIFY

- `vp check` passes
- No phrase "token", "six tokens", "composes from" in the rendered section
- Text reads naturally for a non-developer visitor
