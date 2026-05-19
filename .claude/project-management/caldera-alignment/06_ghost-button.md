# 06 — ghost-button

## What

Caldera `.btn--ghost`:

- Border via `box-shadow: inset 0 0 0 1.5px var(--color-abyssal-ink)` (not CSS border)
- Hover: `background: var(--color-abyssal-ink); color: var(--color-pure-white)` — full fill reverse

Current `variant="outline"` uses 1px border and different hover. Override via Nuxt UI `ui.button` theme in `app/app.config.ts` or a CSS layer targeting `[data-variant="outline"]`.

Check Nuxt UI v4 docs in `node_modules/@nuxt/ui` for the correct override path before writing code.

## Verify

Ghost/outline buttons have 1.5px-weight border feel and fully invert (dark fill, white text) on hover.
