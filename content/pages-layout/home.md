---
# ===== Homepage Layout Manager =====
# How to use:
#   - Remove a section block -> that section will not appear on the homepage
#   - Reorder the blocks -> homepage order follows
#   WARNING: Do NOT change the English names after "component:"

sections:
  # Hero banner (recommended: keep at top)
  - component: section-hero

  # Dual-identity intro cards
  - component: section-directions

  # 3D rotating blog carousel
  - component: section-blog
    postCount: 10
    spinDuration: 90

  # Email newsletter signup
  - component: section-newsletter

  # Support the author
  - component: section-support
---
