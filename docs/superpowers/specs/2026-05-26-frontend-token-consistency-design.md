# Frontend Token Consistency Fix

## Scope

Targeted fixes to bring `Profile.vue` and `SectionHero.vue` in line with the design token system. No architecture changes.

## Changes

### 1. `app/assets/css/theme.css`

Add a named token for the hero background color so it is no longer a raw browser named color.

```css
--color-sydney-sky: #87ceeb;
```

### 2. `app/components/home/Profile.vue`

Replace generic Tailwind grays with design system tokens.

| Current                      | Replace with             |
| ---------------------------- | ------------------------ |
| `bg-[#f7f7f7]`               | `bg-ash-white`           |
| `text-gray-800`              | `text-abyssal-ink`       |
| `text-gray-600`              | `text-abyssal-ink/60`    |
| `border-gray-300`            | `border-abyssal-ink/20`  |
| `hover:bg-gray-50` (buttons) | `hover:bg-basalt-canvas` |

### 3. `app/components/home/SectionHero.vue`

Three fixes:

- `bg-[skyblue]` → `bg-sydney-sky`
- `h-[calc(100vh_-_...)]` → `h-[calc(100dvh_-_...)]`
- Portrait images: `h-[252px]` → `h-[180px] md:h-[252px]`
- Subtext: `font-black` → `font-semibold`

## Out of Scope

- Sub-page section header typography overhaul (separate task)
- Three-column card layout diversification (separate task)
- Any other component not listed above
