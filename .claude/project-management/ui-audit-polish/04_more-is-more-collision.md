# 04 — Fix "More is more" Text Collision

## Problem

ProductDots badge: "More is more"
Features section heading (immediately below): "More Is More. Stack Sideways."

They render back-to-back on the page. Visually jarring — same phrase twice in 100px.

## Plan

Change the ProductDots badge text to something distinct — e.g. remove the badge entirely
(the dot-field is already decorative enough) or replace with a site-relevant label.
Do NOT change Features heading — it's a section title, not a badge.
→ verify: no duplicated phrase visible when scrolling through the two sections

## Success criteria

- "More is more" / "More Is More" no longer appears twice in sequence
- `vp check` passes
