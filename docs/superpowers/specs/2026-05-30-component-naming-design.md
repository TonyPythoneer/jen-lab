# Component Naming & Organization Design

**Date**: 2026-05-30
**Status**: Approved

## Problem

`app/components/` has grown without a clear system:

- 8 root-level components with no home
- Version-based naming (`SectionBlog3DV2`) that obscures purpose
- `home/Profile.vue` lives in the wrong domain directory
- No rule distinguishing page-level blocks from internal sub-components

## Convention

### 1. Directory = Route Domain

Each subdirectory maps to the route it serves. Nuxt auto-import turns the directory name into the component prefix automatically.

| Directory      | Serves                                  | Auto-import prefix |
| -------------- | --------------------------------------- | ------------------ |
| `site/`        | All pages (global layout)               | `Site`             |
| `home/`        | `/`                                     | `Home`             |
| `blog/`        | `/blogs`, `/blogs/[slug]`               | `Blog`             |
| `restaurants/` | `/my-best-restaurants-search-in-sydney` | `Restaurants`      |
| `profile/`     | `/about` (jen-knows, jen-liu)           | `Profile`          |
| `shared/`      | Cross-domain reusable primitives        | `Shared`           |
| `fx/`          | Visual effects consumed by components   | `Fx`               |

### 2. `Section` Prefix = Page Consumes Directly

A component with a `Section` prefix is a full-width block rendered directly inside a `pages/` file. No `Section` prefix means the component is a sub-component — consumed by another component, not a page.

```
pages/index.vue
  └─ HomeSectionHero          ← Section prefix: page uses it directly
  └─ HomeSectionBlog3D
       └─ HomeImageCarousel   ← No prefix: sub-component inside a Section
```

### 3. No Version Suffixes

Version markers (`V2`, `V3`) are banned. The current version is always the file. If a parallel version is needed during development, use a feature branch — not a filename suffix.

## Changes Required

### Root Directory → Subdirectories

| File                       | Move to        |
| -------------------------- | -------------- |
| `FilterGroup.vue`          | `blog/`        |
| `FilterItem.vue`           | `blog/`        |
| `MapView.vue`              | `restaurants/` |
| `RestaurantCard.vue`       | `restaurants/` |
| `SnapCarousel.vue`         | `shared/`      |
| `ScrollToTopButton.vue`    | `shared/`      |
| `CollapsibleSeparator.vue` | `shared/`      |
| `ContactLinks.vue`         | `shared/`      |

### Wrong Domain

| File               | Move to    |
| ------------------ | ---------- |
| `home/Profile.vue` | `profile/` |

### Version Naming

| File                       | Rename to                |
| -------------------------- | ------------------------ |
| `home/SectionBlog3DV2.vue` | `home/SectionBlog3D.vue` |

### Orphans (Deferred)

`home/ContentBody.vue`, `home/SectionNewProduct.vue`, `home/Toc.vue` — unused, addressed separately.

## Out of Scope

- Sub-component renaming within directories (they are correct by the new convention)
- `fx/` directory contents (already correct)
- `site/` directory contents (already correct)
