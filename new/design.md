---
version: alpha
name: Taiwan Travelogue Map
description: Warm, editorial map interface for a Taiwanese food atlas with pale parchment surfaces, brick accent lines, serif-led typography, and minimal depth.
colors:
  primary: "#993c1d"
  secondary: "#3d2817"
  tertiary: "#fbf6e7"
  neutral: "#e5e7eb"
  surface: "#f2e8ce"
  on-surface: "#3d2817"
  background: "#f2e8ce"
  text: "#3d2817"
  accent: "#993c1d"
  error: "#993c1d"
typography:
  headline-display:
    fontFamily: "Crimson Pro"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 38px
    letterSpacing: "0px"
    fontFeature: "normal"
  headline-lg:
    fontFamily: "Crimson Pro"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 29px
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Crimson Pro"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Crimson Pro"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: "0px"
  body-md:
    fontFamily: "Crimson Pro"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Crimson Pro"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Crimson Pro"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: "0px"
  label-md:
    fontFamily: "Crimson Pro"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Crimson Pro"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: "0px"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "2px"
  sm: "10px"
  md: "14px"
  lg: "24px"
  xl: "64px"
components:
  button:
    primary:
      backgroundColor: "#fbf6e7"
      color: "#3d2817"
      borderColor: "#993c1d"
      borderRadius: "4px"
      borderWidth: "2px"
      borderStyle: "solid"
      padding: "12px 21px"
      fontSize: "12px"
      fontWeight: 400
      minWidth: "109px"
      minHeight: "42px"
    secondary:
      backgroundColor: "transparent"
      color: "#3d2817"
      borderColor: "#3d2817"
      borderRadius: "4px"
      borderWidth: "1px"
      borderStyle: "solid"
      padding: "12px 21px"
      fontSize: "12px"
      fontWeight: 400
      minWidth: "109px"
      minHeight: "42px"
    link:
      backgroundColor: "transparent"
      color: "#3d2817"
      borderColor: "transparent"
      borderRadius: "0px"
      borderWidth: "0px"
      borderStyle: "none"
      padding: "0px"
      fontSize: "12px"
      fontWeight: 400
  card:
    backgroundColor: "#f2e8ce"
    color: "#3d2817"
    borderColor: "#e5e7eb"
    borderRadius: "8px"
    borderWidth: "1px"
    borderStyle: "solid"
    padding: "16px"
    boxShadow: "none"
---

# Overview

Taiwan Travelogue Map is a calm, museum-like atlas interface. The screenshot shows a parchment background, thin gold-brown dividers, a serif title system, and a large white map stage framed by restrained borders. The tone is editorial, archival, and slightly ceremonial.

Use this system for:

- atlas-style navigation
- food/place lists
- map exploration
- chapter or category browsing

The visual language should stay quiet and spacious. Prefer light backgrounds, dark brown text, and brick-red accents only for emphasis and interactive affordances.

# Colors

Core palette:

- **Primary / accent:** `#993c1d`
- **Secondary / text:** `#3d2817`
- **Surface / background:** `#f2e8ce`
- **Tertiary / button fill:** `#fbf6e7`
- **Neutral border:** `#e5e7eb`

Usage guidance:

- Use `background` / `surface` for most page chrome.
- Use `on-surface` for primary text and icons.
- Use `primary` sparingly for active states, anchors, and small UI marks.
- Avoid bright or saturated colors that break the archival mood.
- Maintain low contrast ornamentation; the interface should feel printed, not glossy.

# Typography

Typography is serif-led and editorial.

## Recommended tokens

- `headline-display`: 32px/38px, 700
- `headline-lg`: 24px/29px, 700
- `headline-md`: 20px/24px, 600
- `body-lg`: 18px/22px, 600
- `body-md`: 14px/20px, 400
- `body-sm`: 12px/18px, 400
- `label-lg`: 14px/20px, 400
- `label-md`: 12px/18px, 400
- `label-sm`: 12px/18px, 400

## Font stack

Primary family: `Crimson Pro`
Fallbacks: `Shippori Mincho`, `Noto Serif TC`, `Noto Serif JP`, `serif`

## Guidance

- Use larger serif headlines for the site title and chapter headings.
- Keep list items and labels compact and airy.
- Use all-caps sparingly for micro-labels such as the English subtitle.
- Do not introduce sans-serif typography unless absolutely necessary for system UI; if used, keep it secondary and unobtrusive.

# Layout

The layout is a three-zone composition:

1. **Top header** with title/subtitle and language controls.
2. **Left sidebar** with tabbed categories and a vertical list.
3. **Main map stage** centered and dominant, with a slim right-side helper area.

Observed structure:

- Background is a uniform parchment tone.
- Dividers are thin and mostly vertical/horizontal rules.
- The map canvas sits inside a white framed field with a fine border.
- Panels align to a grid with generous negative space.

Spacing tokens:

- `xs`: 2px
- `sm`: 10px
- `md`: 14px
- `lg`: 24px
- `xl`: 64px

Guidance:

- Use `xl` for macro separation between navigation zones.
- Use `lg` for section and panel padding.
- Use `md` and `sm` for list item rhythm.
- Keep content anchored to edges with clear frames; avoid floating cards unless they match the map stage framing.
- Preserve the open central composition even when data is sparse.

# Elevation & Depth

Depth is intentionally minimal.

- Shadows: none
- Layering should rely on borders, contrast, and whitespace rather than blur or elevation.
- The main map panel is a framed plane, not a floating card.
- Any overlays, controls, or popovers should feel like inserted paper elements, with no soft shadow.

# Shapes

Rounded corners are restrained:

- `none`: 0px
- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `full`: 9999px

Guidance:

- Use `sm` for buttons and utility controls.
- Use `md` only for softer informational surfaces.
- Prefer square or lightly rounded geometry for frames, tabs, and map containers.
- Circular icons may be used for map controls and location markers.

# Components

## Buttons

Primary button:

- Filled parchment background with brick-red border
- Dark brown text
- 12px serif text
- Minimum size approximately 109×42px

Secondary button:

- Transparent fill with dark brown border
- Same size and type scale as primary

Link button:

- Text-only, underlined, minimal padding

Use primary buttons for key actions. Use secondary buttons for alternates. Use link buttons for low-emphasis navigation.

## Card

Cards are lightly framed information surfaces:

- Background: `#f2e8ce`
- Border: `#e5e7eb`
- Radius: 8px
- No shadow

Use cards for supporting content only; do not turn the main map into a card.

## Navigation tabs and lists

The screenshot shows segmented tabs for `食物 / 城市` and a stacked list of food categories with small line icons.

- Active tabs should be clear through border and fill contrast, not heavy color.
- List items should be compact, left-aligned, and separated by thin rules.
- Icons should be thin-stroked and brick-red or brown.

## Map controls

Zoom and location controls should be small, aligned to corners, and minimally styled.

- Use circular or square-ish light controls
- Avoid floating shadows
- Keep labels tiny or icon-only

# Do's and Don'ts

## Do

- Do use `#f2e8ce` as the dominant app background.
- Do keep the main map area large, bright, and clearly framed.
- Do use serif typography for almost all visible text.
- Do keep dividers thin and subtle.
- Do make active states rely on border, fill, and small accent color changes.
- Do preserve generous whitespace around the central canvas.
- Do keep controls compact and editorial.

## Don't

- Don't introduce gradients, glows, or shadow-heavy surfaces.
- Don't use saturated blues, greens, or modern neon accents.
- Don't replace serif typography with a sans-serif system.
- Don't over-round panels or buttons.
- Don't stack dense UI inside the map stage.
- Don't make interactive elements look like app chrome from a generic dashboard.
- Don't add decorative motion or visual effects that distract from the atlas feel.
