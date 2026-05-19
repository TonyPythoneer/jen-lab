# 08 — footer-socials

## What

Inside the right column of the footer (task 07), socials row:

- Each link: `w-16 h-16` circle, `bg-digital-orange text-pure-white`, `rounded-full`
- Icons rendered via `UIcon` at ~`size-6`
- Hover: `bg-[#e34800] -translate-y-0.5 transition-[background,transform]`
- Source: `appConfig.contacts` (same as before)
- Row: `flex flex-wrap gap-2.5 justify-end`

Reference: caldera `.foot__social`.

## Verify

Social icons in footer are 64px solid orange circles that lift on hover.
