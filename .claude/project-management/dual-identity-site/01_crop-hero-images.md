---
name: 01-crop-hero-images
description: Crop the two-girl hero PNG into two optimized webp halves for the homepage directions cards.
---

# 01 — Crop hero illustration into two halves

## Goal

Produce two web-optimized images from `public/home/jen-on-home-page.origin.png` (1024×676):

- `public/home/jen-knows-hero.webp` — the LEFT girl (raised hand).
- `public/home/jen-liu-hero.webp` — the RIGHT girl (camera).

## Why (reasoning chain)

- Task 08 (the "More Is More" section) needs each girl ALONE inside her own colored card.
- The origin is a single 797 KB PNG with both girls. Loading it twice on the homepage is wasteful, and
  CSS `object-position` framing of one shared image is fragile (the girls lean toward center and overlap).
- Cropping to two smaller webps is the perf-correct, deterministic choice — this is a UI-polish branch.
- Tools confirmed available: `magick` (ImageMagick) and `cwebp` at `/opt/homebrew/bin`.

## Inputs / references

- Source: `public/home/jen-on-home-page.origin.png` (1024×676). Left=Jen Knows, Right=Jen Liu (REFERENCE §4).

## Steps

1. Crop left half and right half with a small center overlap so neither girl is clipped. Starting guess
   (tune after visual check): left = `560x676+0+0`, right = `560x676+464+0`.
   ```sh
   magick public/home/jen-on-home-page.origin.png -crop 560x676+0+0 +repage -quality 82 public/home/jen-knows-hero.webp
   magick public/home/jen-on-home-page.origin.png -crop 560x676+464+0 +repage -quality 82 public/home/jen-liu-hero.webp
   ```
2. **Visually verify** each crop with the Read tool (open the webp). Confirm: Jen Knows = the raised-hand
   girl fully in frame; Jen Liu = the camera girl fully in frame. Adjust the `+X` offset / width and
   re-run until each girl is well-centered with breathing room. Do not skip this — offsets are a guess.
3. Keep file sizes reasonable (target < ~120 KB each). Lower `-quality` if needed.

## Acceptance criteria

- Two webp files exist; each shows exactly one girl, well-framed, no hard clip of hand/camera/limbs.
- Each file is meaningfully smaller than the 797 KB origin.

## Gotchas

- `+repage` is required after `-crop` or the webp keeps the original canvas offset.
- Do NOT delete the origin PNG — keep it as the master.
