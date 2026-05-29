# RTK Savings Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing rough RTK cost estimate with the reverse-engineered per-model formula from the spec, add the `RTK%` row beneath the RTK row, and lock the design intent into in-script comments so future edits don't drift.

**Architecture:** All work happens in one file: `~/.tonyyang/scripts/ai-usage.zsh`. `_rtk_usage_aggregate` is rewritten to pull per-model cloud input tokens directly from sqlite (no `_AI_USAGE_JQ` changes) and compute `rtkSavedReal$` via `input_M × pct/(1-pct) × price_M`. Render functions emit two stacked rows (RTK + RTK%) aligned to OVERALL's 6 columns. The three required comment blocks (A above aggregate, B above render, C at fallback) carry the spec's "why" into the script itself.

**Tech Stack:** zsh, sqlite3, jq, awk, `rtk` CLI, `bunx ccusage`.

**Spec:** `docs/superpowers/specs/2026-05-28-rtk-savings-design.md`.

---

## File Structure

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` — single file, all changes here.
  - Rewrite `_rtk_usage_aggregate` (lines ~322-361): drop `cacheSaveRate` arg, add sqlite query for per-model cloud input, compute `rtkSavedReal$` via reverse-engineering. Attach **Block A** comment.
  - Rewrite `_ai_usage_render_rtk_row` (lines ~363-373): emit 4-column RTK row (`real$ | opus$ | sonnet$ | tokens`) instead of current 3-column. Attach **Block B** comment (shared with new render fn).
  - Add new `_ai_usage_render_rtk_pct_row` function: emits the `RTK%` row from rtk JSON + ccusage overall totals JSON.
  - Modify `_ai_usage_render_summary_block` (lines ~612-637): pass overall totals into RTK% renderer.
  - Modify `_ai_usage_render` (lines ~541-570): same RTK% wiring.
  - Modify three `list-ai-usage*` commands (lines ~643-717): drop `cacheSaveRate` argument from `_rtk_usage_aggregate` calls. Attach **Block C** comment at the fallback fan-in point.
- No tests created — this is a personal zsh script with no test infrastructure. Each task ends with a manual `list-ai-usage` invocation and output diff check.

---

## Task 1: Rewrite `_rtk_usage_aggregate` with reverse-engineering formula

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh:322-361`

The current implementation uses a cache-weighted estimate that the spec rejects. Replace it. The new version queries sqlite for per-model cloud `input_tokens` over the window, then applies `savedTokens_M = input_M × pct / (1 − pct)` and sums `savedTokens_M × price_M`. Local models are excluded because RTK's "real $ saved" requires real cloud pricing.

- [ ] **Step 1: Read the current implementation to confirm signature and JSON output shape**

Run: `sed -n '322,361p' ~/.tonyyang/scripts/ai-usage.zsh`
Note the existing `.rows[].costAsOpus / .costAsSonnet` and `.totals.costAsOpus / .costAsSonnet` keys — these stay; we add `.totals.savedReal` and keep the old display fields for the per-day section.

- [ ] **Step 2: Replace the function body**

Replace lines 322-361 with:

```zsh
# Block A — rtkSavedReal$ reverse-engineering
# ccusage input tokens are post-RTK (what was actually sent).
# Reverse them to get "what would have been sent without RTK":
#   savedTokens_M = ccusageInput_M * pct / (1 - pct)
#   rtkSavedReal$ = sum over models of savedTokens_M * price_M
# Assumes RTK's filter rate is the same for every model.
#
# $1: window in days. Pulls per-model cloud input from sqlite; pulls
# savings_pct + saved_tokens from $_RTK_TMP. No cacheSaveRate arg —
# the new formula doesn't need it.
_rtk_usage_aggregate() {
  local -i days=${1:-$AI_USAGE_WINDOW_DAYS}
  [[ -z $_RTK_TMP || ! -s $_RTK_TMP ]] && return 1

  local cutoff
  cutoff=$(date -v-$((days - 1))d +%Y-%m-%d)

  # Per-model cloud input tokens for the window. JSON object keyed by
  # model_name. Local rows (is_cloud=0) are excluded.
  local model_input_json
  model_input_json=$(sqlite3 "$AI_CACHE_DB" <<SQL
SELECT json_group_object(model_name, total_input)
FROM (
  SELECT model_name, SUM(input_tokens) AS total_input
  FROM daily_usage
  WHERE is_cloud = 1 AND date >= '$cutoff'
  GROUP BY model_name
);
SQL
)
  [[ -z $model_input_json ]] && model_input_json='{}'

  jq --arg cutoff "$cutoff" --argjson modelInput "$model_input_json" '
    # Public Anthropic per-MTok input prices. Match _AI_USAGE_JQ.
    def opus_price:   5;
    def sonnet_price: 3;
    def haiku_price:  0.8;
    def price_for(name):
      if   (name | test("opus";   "i")) then opus_price
      elif (name | test("sonnet"; "i")) then sonnet_price
      elif (name | test("haiku";  "i")) then haiku_price
      else sonnet_price end;

    (.daily // []) as $all |
    [ $all[] | select(.date >= $cutoff) ] as $rows |
    ($rows | map(.saved_tokens) | add // 0) as $saved |
    ($rows | map(.commands)     | add // 0) as $cmds  |
    (if ($rows | length) > 0
     then ($rows | map(.savings_pct) | add) / ($rows | length)
     else 0 end) as $pct_avg |
    # Aggregate savings_pct for reverse-engineering: total saved / (total
    # saved + total post-RTK input). When per-day pct varies, this gives
    # the volume-weighted rate.
    ($modelInput | to_entries | map(.value) | add // 0) as $totalCloudInput |
    (if ($totalCloudInput + $saved) > 0
     then $saved / ($totalCloudInput + $saved)
     else 0 end) as $pct |
    # Reverse-engineer per-model: savedTokens_M = input_M * pct/(1-pct)
    (if (1 - $pct) > 0
     then [ $modelInput | to_entries[] |
            (.value * $pct / (1 - $pct)) * price_for(.key) / 1000000
          ] | add // 0
     else 0 end) as $savedReal |
    {
      rows: [ $rows[] | {
        period:      .date,
        commands:    .commands,
        savedTokens: .saved_tokens,
        savingsPct:  (.savings_pct / 100),
        costAsOpus:  (.saved_tokens * 5 / 1000000),
        costAsSonnet:(.saved_tokens * 3 / 1000000)
      }],
      totals: {
        commands:    $cmds,
        savedTokens: $saved,
        savingsPct:  ($pct_avg / 100),
        savedReal:   $savedReal,
        costAsOpus:  ($saved * 5 / 1000000),
        costAsSonnet:($saved * 3 / 1000000)
      }
    }
  ' "$_RTK_TMP"
}
```

- [ ] **Step 3: Verify the function parses without zsh syntax errors**

Run: `zsh -n ~/.tonyyang/scripts/ai-usage.zsh && echo OK`
Expected: `OK`

- [ ] **Step 4: Smoke-test in a subshell**

Run:

```bash
zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _RTK_TMP=$(mktemp); _rtk_cache_sync
  _rtk_usage_aggregate 7 | jq ".totals"
  rm -f "$_RTK_TMP"
'
```

Expected: JSON object containing `savedReal`, `costAsOpus`, `costAsSonnet`, `savedTokens`, `commands`, `savingsPct`. `savedReal` should be a positive number (typically smaller than `costAsOpus` since real mix < pure opus).

- [ ] **Step 5: Cross-check `savedReal` magnitude**

Run:

```bash
zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _ai_cache_sync
  _RTK_TMP=$(mktemp); _rtk_cache_sync
  saved=$(_rtk_usage_aggregate 7 | jq -r ".totals.savedReal")
  opus=$( _rtk_usage_aggregate 7 | jq -r ".totals.costAsOpus")
  printf "savedReal=%s  costAsOpus=%s  (real should be <= opus)\n" "$saved" "$opus"
  rm -f "$_RTK_TMP"
'
```

Expected: `savedReal <= costAsOpus`. If `savedReal > costAsOpus`, the per-model lookup is wrong (likely missing a model in `price_for`).

---

## Task 2: Update `_ai_usage_render_rtk_row` for new 4-column layout

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh:363-373`

Current row prints `RTK | — | $opus | $sonnet | tokens | — | —` (em-dash in Col1). The spec puts `rtkSavedReal$` in Col1, so the layout is `RTK | $real | $opus | $sonnet | tokens | — | —`.

- [ ] **Step 1: Replace the function body**

Replace lines 363-373 with:

```zsh
# Emit a single RTK row for the OVERALL column -t block.
# Columns align to OVERALL: label | real$ | opus$ | sonnet$ | tokens | — | —
# Col1 (real$) uses the reverse-engineered rtkSavedReal$ from totals.savedReal.
# Col2/Col3 are display-only: savedTokens * 5/3 over 1M.
_ai_usage_render_rtk_row() {
  local json=$1
  jq -r '.totals | [.savedReal, .costAsOpus, .costAsSonnet, .savedTokens] | @tsv' <<<"$json" |
  while IFS=$'\t' read -r real opus sonnet saved; do
    printf "RTK\t\$%.2f\t\$%.2f\t\$%.2f\t%s\t—\t—\n" \
      "$real" "$opus" "$sonnet" \
      "$(_ai_usage_humanize "$saved")"
  done
}
```

- [ ] **Step 2: Syntax check**

Run: `zsh -n ~/.tonyyang/scripts/ai-usage.zsh && echo OK`
Expected: `OK`

- [ ] **Step 3: Visual smoke test**

Run:

```bash
zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _ai_cache_sync
  _RTK_TMP=$(mktemp); _rtk_cache_sync
  rtk_json=$(_rtk_usage_aggregate 30)
  printf "header\trow\n"
  _ai_usage_render_rtk_row "$rtk_json"
  rm -f "$_RTK_TMP"
'
```

Expected: a line starting with `RTK` followed by 4 dollar/number columns and 2 em-dashes.

---

## Task 3: Add `_ai_usage_render_rtk_pct_row` for the RTK% row

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` (insert after `_ai_usage_render_rtk_row`, ~line 374)

New function. Pulls `rtkSavedReal$` from rtk JSON and `cost / costAsOpus / costAsSonnet` from ccusage overall totals. Computes the three percentages per the spec formula.

- [ ] **Step 1: Insert the new function with Block B comment**

Insert immediately after `_ai_usage_render_rtk_row`'s closing brace:

```zsh
# Block B — RTK / RTK% column semantics (read before changing formulas)
# RTK part is always real ($ actually not spent).
# Local part has no real price (OMLX/Ollama don't bill), so columns 2 and 3
# reprice it as opus / sonnet to give it a dollar value.
#
# RTK%:
#   Col1 = rtkSavedReal / (rtkSavedReal                 + cloudBill)
#   Col2 = (rtkSavedReal + localAsOpus)   / (... + cloudBill)
#   Col3 = (rtkSavedReal + localAsSonnet) / (... + cloudBill)
#
# Extract from existing ccusage jq:
#   cloudBill     = .overall.totals.cost
#   localAsOpus   = .overall.totals.costAsOpus   - .overall.totals.cost
#   localAsSonnet = .overall.totals.costAsSonnet - .overall.totals.cost
# Subtraction is exact because jq defines costAsOpus = cloud.cost + localOpus.
#
# RTK row (display only, different from RTK% numerator):
#   Col1 rtkSavedReal | Col2 savedTokens*5/1M | Col3 savedTokens*3/1M | Col4 savedTokens
#
# Args: rtk_json (from _rtk_usage_aggregate), ccusage_json (overall totals).
_ai_usage_render_rtk_pct_row() {
  local rtk_json=$1 ccusage_json=$2
  local saved_real cloud_bill local_opus local_sonnet
  saved_real=$(jq -r '.totals.savedReal'                                    <<<"$rtk_json")
  cloud_bill=$(jq -r '.overall.totals.cost'                                 <<<"$ccusage_json")
  local_opus=$(jq -r   '.overall.totals.costAsOpus   - .overall.totals.cost' <<<"$ccusage_json")
  local_sonnet=$(jq -r '.overall.totals.costAsSonnet - .overall.totals.cost' <<<"$ccusage_json")

  awk -v r="$saved_real" -v c="$cloud_bill" -v lo="$local_opus" -v ls="$local_sonnet" '
    function pct(num, den) {
      if (den + 0 == 0) return "—"
      return sprintf("%.2f%%", (num / den) * 100)
    }
    BEGIN {
      col1 = pct(r,      r + c)
      col2 = pct(r + lo, r + lo + c)
      col3 = pct(r + ls, r + ls + c)
      printf "RTK%%\t%s\t%s\t%s\t—\t—\t—\n", col1, col2, col3
    }
  '
}
```

- [ ] **Step 2: Syntax check**

Run: `zsh -n ~/.tonyyang/scripts/ai-usage.zsh && echo OK`
Expected: `OK`

- [ ] **Step 3: Smoke test the percentages**

Run:

```bash
zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _ai_cache_sync
  _RTK_TMP=$(mktemp); _rtk_cache_sync
  cc=$(_ai_usage_aggregate 30)
  rt=$(_rtk_usage_aggregate 30)
  _ai_usage_render_rtk_pct_row "$rt" "$cc"
  rm -f "$_RTK_TMP"
'
```

Expected: one line starting `RTK%` with three percentage values (e.g. `0.33%  18.47%  12.10%`) followed by three em-dashes. Col1 should be smaller than Col2 and Col3 (local repricing inflates Col2/Col3).

---

## Task 4: Wire RTK% into `_ai_usage_render_summary_block`

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh:612-637`

The block currently emits OVERALL → LOCAL% → RTK (if rtk_json). Add the RTK% row immediately after the RTK row. Both new rows go into the same `column -t` stream so widths line up.

- [ ] **Step 1: Replace the trailing rtk-row line**

Find the line:

```zsh
    [[ -n $rtk_json ]] && _ai_usage_render_rtk_row "$rtk_json"
```

Replace with:

```zsh
    if [[ -n $rtk_json ]]; then
      _ai_usage_render_rtk_row "$rtk_json"
      _ai_usage_render_rtk_pct_row "$rtk_json" "$json"
    fi
```

- [ ] **Step 2: Run `list-ai-usage` and inspect**

Run: `zsh -c 'source ~/.tonyyang/scripts/ai-usage.zsh; list-ai-usage' | head -40`
Expected: each `=== ... ===` block contains OVERALL, LOCAL%, RTK, RTK% rows in that order, all 7 columns aligned.

---

## Task 5: Wire RTK% into `_ai_usage_render` (2w/4w views)

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh:541-570`

Identical change as Task 4, but in the full-render function used by 2w / 4w.

- [ ] **Step 1: Apply the same replacement**

Find:

```zsh
    [[ -n $rtk_json ]] && _ai_usage_render_rtk_row "$rtk_json"
```

Replace with:

```zsh
    if [[ -n $rtk_json ]]; then
      _ai_usage_render_rtk_row "$rtk_json"
      _ai_usage_render_rtk_pct_row "$rtk_json" "$json"
    fi
```

- [ ] **Step 2: Verify 2w view**

Run: `zsh -c 'source ~/.tonyyang/scripts/ai-usage.zsh; list-ai-usage-2w' | head -60`
Expected: OVERALL → LOCAL% → RTK → RTK% appears in the totals block above `RTK SAVINGS` section.

---

## Task 6: Drop `cacheSaveRate` from `_rtk_usage_aggregate` callers

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh:643-717` (three `list-ai-usage*` functions)

The new aggregate no longer needs `cacheSaveRate`. Remove the `csr*` extraction and the second positional arg to `_rtk_usage_aggregate`.

- [ ] **Step 1: Patch `list-ai-usage` (lines 660-668)**

Delete:

```zsh
  local csr_today csr_d7 csr_d30
  csr_today=$(jq -r '.overall.totals.cacheSaveRate // 0' <<<"$today_json")
  csr_d7=$(jq -r    '.overall.totals.cacheSaveRate // 0' <<<"$d7_json")
  csr_d30=$(jq -r   '.overall.totals.cacheSaveRate // 0' <<<"$d30_json")

  local rtk_today rtk_d7 rtk_d30
  rtk_today=$(_rtk_usage_aggregate 1  "$csr_today") || rtk_today=""
  rtk_d7=$(_rtk_usage_aggregate 7     "$csr_d7")    || rtk_d7=""
  rtk_d30=$(_rtk_usage_aggregate 30   "$csr_d30")   || rtk_d30=""
```

Replace with:

```zsh
  # Block C — RTK fallback
  # rtk missing or non-zero exit: drop RTK and RTK% rows entirely.
  # Do not print dashes or 0% — reads as "RTK saved nothing".
  local rtk_today rtk_d7 rtk_d30
  rtk_today=$(_rtk_usage_aggregate 1)  || rtk_today=""
  rtk_d7=$(_rtk_usage_aggregate 7)     || rtk_d7=""
  rtk_d30=$(_rtk_usage_aggregate 30)   || rtk_d30=""
```

- [ ] **Step 2: Patch `list-ai-usage-2w` (lines ~693-694)**

Delete:

```zsh
  local csr; csr=$(jq -r '.overall.totals.cacheSaveRate // 0' <<<"$json")
  local rtk_json; rtk_json=$(_rtk_usage_aggregate 14 "$csr") || rtk_json=""
```

Replace with:

```zsh
  local rtk_json; rtk_json=$(_rtk_usage_aggregate 14) || rtk_json=""
```

- [ ] **Step 3: Patch `list-ai-usage-4w` (lines ~711-712)**

Delete:

```zsh
  local csr; csr=$(jq -r '.overall.totals.cacheSaveRate // 0' <<<"$json")
  local rtk_json; rtk_json=$(_rtk_usage_aggregate 28 "$csr") || rtk_json=""
```

Replace with:

```zsh
  local rtk_json; rtk_json=$(_rtk_usage_aggregate 28) || rtk_json=""
```

- [ ] **Step 4: Syntax check**

Run: `zsh -n ~/.tonyyang/scripts/ai-usage.zsh && echo OK`
Expected: `OK`

- [ ] **Step 5: Run all three commands**

Run:

```bash
zsh -c 'source ~/.tonyyang/scripts/ai-usage.zsh; list-ai-usage'
zsh -c 'source ~/.tonyyang/scripts/ai-usage.zsh; list-ai-usage-2w'
zsh -c 'source ~/.tonyyang/scripts/ai-usage.zsh; list-ai-usage-4w'
```

Expected: all three produce non-empty, column-aligned output ending with the RTK SAVINGS section (2w/4w) or RTK + RTK% rows in each block (no-arg version).

---

## Task 7: Fallback behaviour audit

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` (verify, no changes if already correct)

Spec mandates: when `rtk` is missing or fails, RTK + RTK% rows must be **omitted entirely**, not rendered as dashes or `0%`.

- [ ] **Step 1: Simulate missing `rtk` by truncating `$_RTK_TMP`**

Run:

```bash
zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _ai_cache_sync
  _RTK_TMP=$(mktemp)       # empty file -> _rtk_usage_aggregate returns 1
  cc=$(_ai_usage_aggregate 7)
  rtk_json=$(_rtk_usage_aggregate 7) || rtk_json=""
  echo "rtk_json is [$rtk_json]"
  _ai_usage_render_summary_block "$cc" "$rtk_json" | tail -5
  rm -f "$_RTK_TMP"
'
```

Expected: `rtk_json is []`, and the rendered output ends with the `LOCAL%` line — **no** `RTK` or `RTK%` row appears.

- [ ] **Step 2: Simulate `rtk` binary missing**

Run:

```bash
PATH=/usr/bin:/bin zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _ai_cache_sync
  _RTK_TMP=$(mktemp); _rtk_cache_sync
  rtk_json=$(_rtk_usage_aggregate 7) || rtk_json=""
  echo "rtk_json=[$rtk_json]"
  rm -f "$_RTK_TMP"
'
```

Expected: `rtk_json=[]`. `_rtk_cache_sync` failed silently because `rtk` is not on the stripped PATH, leaving `$_RTK_TMP` empty, which makes `_rtk_usage_aggregate` return 1.

- [ ] **Step 3: If either test prints `RTK` / `RTK%` rows, add an early-exit guard**

If render functions emit anything for an empty rtk_json, add to both `_ai_usage_render` and `_ai_usage_render_summary_block` near the start:

```zsh
  [[ -n $rtk_json ]] && ! jq -e '.totals.savedReal' <<<"$rtk_json" >/dev/null 2>&1 && rtk_json=""
```

Re-run Step 1 to confirm.

---

## Task 8: End-to-end verification + spec commit

**Files:**

- Read-only: spec, plan, script.

- [ ] **Step 1: Sanity check column counts**

Run: `zsh -c 'source ~/.tonyyang/scripts/ai-usage.zsh; list-ai-usage'`

For each `=== ... ===` block, confirm:

- `OVERALL` has 7 visible columns (label + 6 data)
- `LOCAL%` has 7 (label + em-dash + 2 pct + 3 em-dash)
- `RTK` has 7 (label + 4 values + 2 em-dash)
- `RTK%` has 7 (label + 3 pct + 3 em-dash)

If any row is misaligned, the `column -t` stream is dropping a tab. Check that every `printf` in the new functions emits exactly 6 `\t`-separated fields after the label.

- [ ] **Step 2: Confirm comments are in place**

Run: `grep -nE "Block [ABC]" ~/.tonyyang/scripts/ai-usage.zsh`
Expected: at least 3 hits (one per block).

- [ ] **Step 3: Spot-check math against ccusage**

Run:

```bash
zsh -c '
  source ~/.tonyyang/scripts/ai-usage.zsh
  _ai_cache_sync; _RTK_TMP=$(mktemp); _rtk_cache_sync
  cc=$(_ai_usage_aggregate 30)
  rt=$(_rtk_usage_aggregate 30)
  echo "cloud bill: $(jq -r .overall.totals.cost <<<\"$cc\")"
  echo "rtk real:   $(jq -r .totals.savedReal   <<<\"$rt\")"
  echo "ratio:      $(jq -r ".totals.savedReal / (.totals.savedReal + $(jq .overall.totals.cost <<<\"$cc\"))" <<<\"$rt\")"
  rm -f "$_RTK_TMP"
'
```

Expected: the printed ratio matches the `RTK% Col1` value shown in the rendered output (within rounding).

- [ ] **Step 4: Commit plan + spec changes to jen-lab repo**

```bash
cd /Users/tonyyang/git/personal/jen-lab
git add docs/superpowers/plans/2026-05-28-rtk-savings.md
git status
git diff --staged docs/superpowers/plans/2026-05-28-rtk-savings.md | head
git commit -m "$(cat <<'EOF'
docs(plans): add RTK savings integration implementation plan

Companion to 2026-05-28-rtk-savings-design.md. Eight tasks covering
aggregate rewrite, RTK + RTK% row rendering, caller wiring, and
fallback verification.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Dotfile script commit (user's own repo, if any)**

The script lives outside this repo. If `~/.tonyyang/scripts/` is under version control elsewhere, commit there separately. Otherwise, no action.

---

## Done When

- All 8 tasks checked off.
- `list-ai-usage`, `list-ai-usage-2w`, `list-ai-usage-4w` all show RTK + RTK% rows aligned with OVERALL.
- `grep "Block [ABC]"` returns three hits.
- Fallback test (missing rtk) produces output without RTK rows, no error.
