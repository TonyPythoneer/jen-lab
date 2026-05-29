# list-ai-usage Summary Format — Implementation Plan

**Goal:** Change `list-ai-usage` summary table: `CLOUD` → `-> claude`, add `---` separator between TOTAL and OVERALL. No changes to `-2w` / `-4w`.

**Target file:** `~/.tonyyang/scripts/ai-usage.zsh`

---

## Task 1: Change `CLOUD` → `-> claude` in `_render_merged_table`

**File:** `~/.tonyyang/scripts/ai-usage.zsh`
**Line:** ~817

**Change:**

```zsh
# Before:
printf 'CLOUD\t%s\t%s\t%s\t%10s\t%s\t%s\n' \

# After:
printf '-> claude\t%s\t%s\t%s\t%10s\t%s\t%s\n' \
```

**Verification:**

- `-> claude` (9 chars) is wider than `CLOUD` (5 chars)
- `_decorate` recalculates column widths dynamically, so alignment will adjust automatically
- No other code references the literal `CLOUD` as a row header in merged tables

---

## Task 2: Add `---` separator between merged table and OVERALL block

**File:** `~/.tonyyang/scripts/ai-usage.zsh`
**Function:** `_render_report`
**Line:** ~922–923

**Change:**

```zsh
# Before:
if [[ $mode == summary ]]; then
  _render_merged_table "$json" "$style"; print
else

# After:
if [[ $mode == summary ]]; then
  _render_merged_table "$json" "$style"; print
  print '---'
else
```

**Verification:**

- Only affects `mode == summary` (i.e., `list-ai-usage`)
- `list-ai-usage-2w` / `-4w` use `mode == full`, unaffected

---

## Task 3: Verification

**Commands to run:**

```bash
source ~/.tonyyang/scripts/ai-usage.zsh 2>/dev/null
list-ai-usage          # Verify: -> claude header, --- separator, numbers unchanged
list-ai-usage-2w       # Verify: unchanged (CLOUD / LOCAL separated)
list-ai-usage-4w       # Verify: unchanged
```

**Checklist:**

- [ ] `-> claude` appears in all three time windows (today / 7d / 30d)
- [ ] `---` separator appears between merged table and OVERALL block in all three windows
- [ ] All numbers match pre-change output
- [ ] `list-ai-usage-2w` and `-4w` are unchanged
- [ ] `pnpm check` passes (lint + format + typecheck)

---

## Critical Notes

1. **Target file is OUTSIDE this repo:** `~/.tonyyang/scripts/ai-usage.zsh`
2. **Commit policy:** User's `CLAUDE.md` says _never commit unless explicitly asked_
3. **Zero numeric change:** All displayed numbers must remain identical
4. **No other changes:** Do not touch `_decorate`, OVERALL block internals, color strategy, or aggregation math
