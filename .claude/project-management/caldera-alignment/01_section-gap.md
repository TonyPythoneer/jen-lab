# 01 — section-gap

## What

`app/pages/index.vue:193` — outer `<div class="... space-y-10 ...">` → replace with `flex flex-col gap-2.5` (10px gap matching caldera `.page { gap: 10px }`).

## Verify

All homepage sections have ~10px vertical gap visually.
