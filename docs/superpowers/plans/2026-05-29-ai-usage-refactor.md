# ai-usage.zsh Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `~/.tonyyang/scripts/ai-usage.zsh` to collapse the duplicated render layer into one universal awk renderer, cut subprocess fork counts, and add color + box-drawing + legends — with zero change to any displayed number.

**Architecture:** jq emits **raw-number TSV** (one jq per table). A single awk function `_decorate` does formatting + width-alignment + threshold coloring + box-drawing in one pass (no `column -t`). Thin builders (`_render_table`, `_render_overall_block`, `_render_report`) assemble TSV and call `_decorate`. The sqlite read path is consolidated (15 forks → 2 for `list-ai-usage`).

**Tech Stack:** zsh, jq, awk (BSD/BWK 20200816), sqlite3. No new dependencies. No `column -t` (removed).

---

## Critical Notes (read before starting)

1. **Target file is OUTSIDE this repo:** `~/.tonyyang/scripts/ai-usage.zsh`. Tests/fixtures live in `~/.tonyyang/scripts/tests/`.
2. **Commit policy:** The user's `CLAUDE.md` says _never commit unless explicitly asked_. The `git commit` steps below are **checkpoints** — run them only if the user has approved committing and `~/.tonyyang` is version-controlled. Otherwise treat each as "stop, let the user review the diff."
3. **Determinism / "numbers never change" gate:** Task 0 copies the current script to `ai-usage.orig.zsh`. The equality tests run the **orig** and the **new** script in separate subshells against the **same fixture, same calendar day**, strip ANSI/box chrome, and diff the numeric tokens. Execute the plan in one sitting; if you cross midnight, re-run Task 1 to refresh the fixture. Task 11 deletes the orig copy.
4. **Deviation from spec §5.1 (formatters in jq → formatters in awk):** jq cannot cleanly produce fixed `%.2f` strings, and the OVERALL stacked block is heterogeneous (one column holds `$` for OVERALL but `%` for LOCAL%). So all formatting (humanize / pct / usd) lives in the single `_decorate` awk, driven by a per-column **col-type vector**. This honors the spec's intent (no per-cell awk fork) better: jq emits raw TSV, one awk per table formats+aligns+colors. The stacked block pre-colors its heterogeneous cells and passes them through `_decorate` as `type=raw`; `dw()` strips ANSI so alignment is exact.
5. **Out of scope (do not touch):** the sync layer (`_ai_cache_sync`, `_ai_sync_status`), the schema, and the jq aggregation **math** (`bucket`/`finalize`/`real_breakdown` formulas). We only re-wrap the aggregation for 3-window slicing and merge sqlite reads; numbers must be identical.

---

## File Structure

| File                                          | Responsibility                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `~/.tonyyang/scripts/ai-usage.zsh`            | The refactored script (single file, 7 regions).                                   |
| `~/.tonyyang/scripts/ai-usage.orig.zsh`       | Transient copy of the pre-refactor script for equality tests. Deleted in Task 11. |
| `~/.tonyyang/scripts/tests/harness.zsh`       | Assert helpers, fixture builder, number-extractor.                                |
| `~/.tonyyang/scripts/tests/test_ai_usage.zsh` | All tests. Sources harness + target.                                              |

The refactored `ai-usage.zsh` region layout (final, applied in Task 10):

```
#region 0  Configuration & TOC
#region 1  Schema & Constants     (sqlite DDL, price table, ANSI codes, color thresholds)
#region 2  Cache Layer            (sync, status — UNCHANGED)
#region 3  Aggregation Layer      (jq report def + 3-window driver, rtk CTE)
#region 4  Formatting Primitives  (_ai_style, _decorate)
#region 5  Render Layer           (_render_table, _render_overall_block, _render_report)
#region 6  Public Commands        (list-ai-usage*)
```

---

## Task 0: Test harness + fixture + safety copy

**Files:**

- Create: `~/.tonyyang/scripts/ai-usage.orig.zsh` (copy)
- Create: `~/.tonyyang/scripts/tests/harness.zsh`
- Create: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Copy the original for equality testing**

```bash
cp ~/.tonyyang/scripts/ai-usage.zsh ~/.tonyyang/scripts/ai-usage.orig.zsh
```

- [ ] **Step 2: Write the harness**

Create `~/.tonyyang/scripts/tests/harness.zsh`:

```zsh
# Tiny zero-dependency test harness for ai-usage.zsh.
typeset -gi _T_PASS=0 _T_FAIL=0

_t_eq() {  # name expected actual
  if [[ "$2" == "$3" ]]; then ((_T_PASS++)); print "  ok   $1"
  else ((_T_FAIL++)); print "  FAIL $1"; print "    expected: [$2]"; print "    actual:   [$3]"; fi
}

_t_has() {  # name haystack needle
  if [[ "$2" == *"$3"* ]]; then ((_T_PASS++)); print "  ok   $1"
  else ((_T_FAIL++)); print "  FAIL $1 (missing: $3)"; fi
}

_t_no() {  # name haystack needle  (asserts needle ABSENT)
  if [[ "$2" != *"$3"* ]]; then ((_T_PASS++)); print "  ok   $1"
  else ((_T_FAIL++)); print "  FAIL $1 (should not contain: $3)"; fi
}

_t_done() { print "── $_T_PASS passed, $_T_FAIL failed"; (( _T_FAIL == 0 )); }

# Build a deterministic fixture DB dated relative to today, with a window
# boundary row (today-30) that MUST be excluded by the -(N-1) cutoff.
_t_make_fixture() {  # <db-path>
  local db=$1
  local today d6 d29 d30
  today=$(date +%Y-%m-%d); d6=$(date -v-6d +%Y-%m-%d)
  d29=$(date -v-29d +%Y-%m-%d); d30=$(date -v-30d +%Y-%m-%d)
  rm -f "$db"
  sqlite3 "$db" "
CREATE TABLE daily_ccusage(date TEXT,is_cloud INT,model_name TEXT,input_tokens INT,output_tokens INT,cache_read INT,cache_write INT,cost REAL,PRIMARY KEY(date,model_name));
CREATE TABLE daily_rtk(date TEXT PRIMARY KEY,commands INT,input_tokens INT,output_tokens INT,saved_tokens INT,savings_pct REAL,total_time_ms INT);
INSERT INTO daily_ccusage VALUES
 ('$today',1,'claude-opus-4',1000,200,8000,500,12.34),
 ('$today',1,'claude-sonnet-4',2000,300,9000,400,3.00),
 ('$today',0,'qwen-local',5000,600,100,50,0.0),
 ('$d6',1,'claude-opus-4',900,100,7000,600,10.00),
 ('$d29',1,'claude-opus-4',800,100,6000,300,9.00),
 ('$d30',1,'claude-opus-4',999999,1,1,1,99.99);
INSERT INTO daily_rtk VALUES
 ('$today',50,4000,800,12000,42.5,1000),
 ('$d6',30,3000,500,8000,38.0,800),
 ('$d29',20,2000,300,5000,35.0,600);
"
}

# Strip ANSI escapes and box-drawing, then emit only value tokens, one per line.
_t_numbers() { sed $'s/\033\\[[0-9;]*m//g' | grep -oE '\$?-?[0-9]+(\.[0-9]+)?[KMB%]?'; }
```

- [ ] **Step 3: Write the test runner skeleton**

Create `~/.tonyyang/scripts/tests/test_ai_usage.zsh`:

```zsh
#!/usr/bin/env zsh
# Run: zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh
HERE=${0:A:h}
source "$HERE/harness.zsh"
SRC=~/.tonyyang/scripts/ai-usage.zsh
ORIG=~/.tonyyang/scripts/ai-usage.orig.zsh
FIX=/tmp/aiu_test.sqlite
_t_make_fixture "$FIX"

print "== smoke =="
out=$(zsh -c "source '$SRC'; AI_CACHE_DB='$FIX' _ai_usage_aggregate 30" 2>&1)
_t_has "aggregate 30 returns json" "$out" '"cloud"'

_t_done
```

- [ ] **Step 4: Run it, expect green smoke test**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: `ok   aggregate 30 returns json` and `── 1 passed, 0 failed`.

- [ ] **Step 5: Checkpoint** (see Critical Note 2)

```bash
git -C ~/.tonyyang add scripts/tests/harness.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "test(ai-usage): add harness, fixture, smoke test"
```

---

## Task 1: Lock current numbers (equality gate)

This test runs the **orig** script as both sides first (proves the gate works), then guards every later task.

**Files:**

- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Add the equality helper + test**

Insert before `_t_done`:

```zsh
print "== numbers unchanged (orig vs new) =="
# Compare the value-token stream of each public command, orig vs new.
_t_cmp_cmd() {  # <command>
  local cmd=$1 a b
  a=$(zsh -c "source '$ORIG'; _ai_cache_sync(){ : }; AI_CACHE_DB='$FIX' $cmd" 2>/dev/null | _t_numbers)
  b=$(zsh -c "source '$SRC';  _ai_cache_sync(){ : }; AI_CACHE_DB='$FIX' $cmd" 2>/dev/null | _t_numbers)
  _t_eq "$cmd numbers identical" "$a" "$b"
}
_t_cmp_cmd "list-ai-usage"
_t_cmp_cmd "list-ai-usage-2w"
_t_cmp_cmd "list-ai-usage-4w"
```

- [ ] **Step 2: Run it — expect PASS (orig vs unmodified new are the same file)**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: all three `numbers identical` lines `ok`. (They will stay green through every refactor task; if one goes red, that task changed a number — stop and fix.)

- [ ] **Step 3: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "test(ai-usage): add orig-vs-new number-equality gate"
```

---

## Task 2: `_ai_style` — output style detection

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` (add near the top, will move to region 4 in Task 10)
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Write failing tests**

Insert before `_t_done`:

```zsh
print "== _ai_style =="
s_plain=$(zsh -c "source '$SRC'; AI_USAGE_PLAIN=1 _ai_style")
_t_eq "AI_USAGE_PLAIN forces ascii" "ascii" "$s_plain"
s_nc=$(zsh -c "source '$SRC'; NO_COLOR=1 _AI_FORCE_TTY=1 _ai_style")
_t_eq "NO_COLOR drops color, keeps utf8 box" "utf8" "$s_nc"
s_full=$(zsh -c "source '$SRC'; _AI_FORCE_TTY=1 _ai_style")
_t_eq "tty+utf8+color" "utf8color" "$s_full"
```

- [ ] **Step 2: Run, expect FAIL** (`_ai_style` undefined)

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: three FAILs under `_ai_style`.

- [ ] **Step 3: Implement `_ai_style`**

Add to `ai-usage.zsh`:

```zsh
# Decide output style: "utf8color" | "utf8" | "ascii".
#   ascii      -> AI_USAGE_PLAIN set, or not a TTY, or non-UTF-8 locale
#   utf8       -> UTF-8 TTY but NO_COLOR set
#   utf8color  -> UTF-8 TTY with color allowed
# _AI_FORCE_TTY=1 lets tests pretend stdout is a TTY.
_ai_style() {
  local is_tty=0
  [[ -n $_AI_FORCE_TTY || -t 1 ]] && is_tty=1
  local charmap; charmap=$(locale charmap 2>/dev/null)
  if [[ -n $AI_USAGE_PLAIN || $is_tty -eq 0 || $charmap != (#i)utf-8 ]]; then
    print -r -- ascii; return
  fi
  [[ -n $NO_COLOR ]] && { print -r -- utf8; return; }
  print -r -- utf8color
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: three `ok` under `_ai_style`; equality gate still green.

- [ ] **Step 5: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "feat(ai-usage): add _ai_style output-style detection"
```

---

## Task 3: `_decorate` — the universal renderer

This is the core. It is verified working on this machine's BSD awk.

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh`
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Write failing tests**

Insert before `_t_done`:

```zsh
print "== _decorate =="
# ascii mode = no color: assert exact aligned lines.
dec() { zsh -c "source '$SRC'; printf '%b' \"\$1\" | _decorate \"\$2\" \"\$3\" \"\$4\" ascii" _ "$1" "$2" "$3" "$4"; }
tsv='DATE\tCOST\tTOKENS\tHIT%\tSAVE%\tMODELS\n2026-05-29\t12.34\t1234567\t0.852\t0.401\tclaude-opus-4\nTOTAL\t22.84\t1240667\t0.82\t0.38\t\n'
out=$(dec "$tsv" "date,usd,tok,hitpct,savepct,text" "CLOUD" "")
_t_has "formats usd"   "$out" '$12.34'
_t_has "humanizes tok" "$out" '1.23M'
_t_has "formats pct"   "$out" '85.2%'
_t_has "null -> emdash" "$out" '—'
_t_has "ascii box top" "$out" '+- CLOUD'
# color mode: assert ANSI on the right cells.
cdec() { zsh -c "source '$SRC'; printf '%b' \"\$1\" | _decorate \"\$2\" \"\$3\" \"\$4\" utf8color" _ "$1" "$2" "$3" "$4"; }
ctsv='DATE\tHIT%\tSAVE%\nx\t0.45\t0.40\ny\t0.85\t0.61\n'
cout=$(cdec "$ctsv" "date,hitpct,savepct" "T" "")
_t_has "low hit red"     "$cout" $'\033[31m45.0%'
_t_has "high hit green"  "$cout" $'\033[32m85.0%'
_t_has "high save green" "$cout" $'\033[32m61.0%'
_t_no  "low save not red" "$cout" $'\033[31m40.0%'
```

- [ ] **Step 2: Run, expect FAIL** (`_decorate` undefined)

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: FAILs under `_decorate`.

- [ ] **Step 3: Implement `_decorate`**

Add to `ai-usage.zsh`. Thresholds (80/50 for HIT, 60 for SAVE, $2 idle) match spec §6.1.

```zsh
# Universal table renderer. Reads RAW-number TSV on stdin (header, rows..., TOTAL),
# formats + width-aligns + colors + draws a box, in ONE awk pass.
#   $1 types  comma list, one per column:
#             date|text  passthrough     int   %d
#             usd        $%.2f (+dim<$2) tok   humanize K/M/B
#             hitpct     %.1f%% red/yel/grn (80/50)
#             savepct    %.1f%% green-if>=60 (never red; low SAVE != broken)
#             gpct       %.1f%% always green (RTK%/OASAVE%/LOCAL%)
#             raw        pass cell through verbatim (may carry ANSI; pre-colored block)
#   $2 title  $3 legend (dim, one line)  $4 style (utf8color|utf8|ascii)
# Empty/"null" cell -> "—" (dim). First-cell ^TOTAL|^OVERALL row -> bold.
_decorate() {
  local types=$1 title=$2 legend=$3 style=${4:-$(_ai_style)}
  awk -v types="$types" -v title="$title" -v legend="$legend" -v style="$style" '
  BEGIN{
    FS="\t"; nT=split(types,T,",")
    RST="\033[0m";BOLD="\033[1m";DIM="\033[2m";RED="\033[31m";YEL="\033[33m";GRN="\033[32m"
    color=(style=="utf8color"); utf8=(style=="utf8color"||style=="utf8")
    if(utf8){TL="┌";TR="┐";BL="└";BR="┘";ML="├";MR="┤";H="─";V="│"}
    else    {TL="+";TR="+";BL="+";BR="+";ML="+";MR="+";H="-";V="|"}
  }
  # display width: strip ANSI; treat em-dash and ellipsis (3-byte each) as 1 column.
  function dw(s,t){ t=s; gsub(/\033\[[0-9;]*m/,"",t); gsub(/—|…/," ",t); return length(t) }
  function rep(c,n,i,r){ r=""; for(i=0;i<n;i++)r=r c; return r }
  function humanize(n){ if(n<1000)return sprintf("%d",n);
    if(n<1000000)return sprintf("%.2fK",n/1000);
    if(n<1000000000)return sprintf("%.2fM",n/1000000); return sprintf("%.2fB",n/1000000000) }
  function fmt(type,cell){
    if(cell==""||cell=="null") return "—"
    if(type=="usd")  return sprintf("$%.2f",cell)
    if(type=="tok")  return humanize(cell+0)
    if(type=="int")  return sprintf("%d",cell)
    if(type=="hitpct"||type=="savepct"||type=="gpct") return sprintf("%.1f%%",cell*100)
    return cell
  }
  function code(type,cell,v){
    if(cell==""||cell=="null") return DIM
    if(type=="hitpct"){v=cell*100; return (v>=80?GRN:(v>=50?YEL:RED))}
    if(type=="savepct"){v=cell*100; return (v>=60?GRN:"")}
    if(type=="gpct") return GRN
    if(type=="usd")  return (cell+0<2?DIM:"")
    return ""
  }
  { for(i=1;i<=NF;i++){ raw[NR,i]=$i; d=(NR==1?$i:fmt(T[i],$i)); disp[NR,i]=d; L=dw(d); if(L>w[i])w[i]=L } nf[NR]=NF; nr=NR }
  END{
    cols=nT; tot=0; for(i=1;i<=cols;i++)tot+=w[i]; tot+=2*(cols-1)
    cw=tot; if(dw(legend)>cw)cw=dw(legend); if(dw(title)+4>cw)cw=dw(title)+4; span=cw+2
    print TL H " " title " " rep(H,span-(3+dw(title))) TR
    for(r=1;r<=nr;r++){
      line=""; bold=(raw[r,1] ~ /^(TOTAL|OVERALL)/)?BOLD:""
      for(i=1;i<=cols;i++){
        d=(i<=nf[r])?disp[r,i]:""
        pre=(r==1)?"":(bold code(T[i],raw[r,i]))
        val=(color&&pre!="")? pre d RST : d
        line=line val rep(" ",w[i]-dw(d)); if(i<cols)line=line "  "
      }
      print V " " line rep(" ",cw-tot) " " V
      if(r==1){ if(length(legend)>0)print V " " (color?DIM legend RST:legend) rep(" ",cw-dw(legend)) " " V; print ML rep(H,span) MR }
      if(r>1 && r<nr && raw[r+1,1] ~ /^(TOTAL|OVERALL)/) print ML rep(H,span) MR
    }
    print BL rep(H,span) BR
  }'
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: all `_decorate` asserts `ok`; equality gate still green.

- [ ] **Step 5: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "feat(ai-usage): add _decorate universal renderer (format+align+color+box)"
```

---

## Task 4: `_render_table` — single-source tables (CLOUD / LOCAL / RTK section)

Replaces `_ai_usage_print_section`, `_ai_usage_print_section_totals_only`, `_ai_usage_print_rtk_section`.

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh`
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Write failing test**

Insert before `_t_done`:

```zsh
print "== _render_table =="
j=$(zsh -c "source '$SRC'; AI_CACHE_DB='$FIX' _ai_usage_aggregate 30")
ct=$(zsh -c "source '$SRC'; _render_table \"\$1\" cloud full ascii" _ "$j")
_t_has "cloud table title"  "$ct" '+- CLOUD (Anthropic)'
_t_has "cloud has TOTAL"    "$ct" 'TOTAL'
_t_has "cloud opus cost"    "$ct" '$12.34'
lt=$(zsh -c "source '$SRC'; _render_table \"\$1\" local full ascii" _ "$j")
_t_has "local has @OPUS\$ header" "$lt" '@OPUS$'
```

- [ ] **Step 2: Run, expect FAIL**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: FAILs under `_render_table`.

- [ ] **Step 3: Implement `_render_table`**

The aggregation JSON keys (`.cloud`/`.local`) and field names (`.period`, `.cost`, `.costAsOpus`, `.costAsSonnet`, `.totalTokens`, `.cacheHitRate`, `.cacheSaveRate`, `.models`) and the RTK section fields (`.savedRealHaiku` etc.) are unchanged from the current script. Model truncation (was `_ai_usage_truncate_models`, 40 chars) moves into the jq filter.

Add to `ai-usage.zsh`:

```zsh
# Render one single-source table to stdout. Emits RAW-number TSV then pipes to _decorate.
#   $1 json   aggregation payload   $2 key  cloud|local|rtk   $3 mode  full|totals
#   $4 style  (optional; defaults via _decorate)
_render_table() {
  local json=$1 key=$2 mode=$3 style=${4:-}
  local header types title legend rowf totf jqkey
  local trunc='(.models | join(", ") | if (.|length) > 40 then .[0:39] + "…" else . end)'
  case $key in
    cloud)
      jqkey='.cloud'; title='CLOUD (Anthropic)'
      legend='(— = no data · HIT% = cache reuse · SAVE% = input from cache)'
      header=$'DATE\tCOST\tTOKENS\tHIT%\tSAVE%\tMODELS'
      types='date,usd,tok,hitpct,savepct,text'
      rowf="[.period,.cost,.totalTokens,(.cacheHitRate//\"\"),(.cacheSaveRate//\"\"),$trunc]|@tsv"
      totf='[.cost,.totalTokens,(.cacheHitRate//""),(.cacheSaveRate//"")]|@tsv'
      ;;
    local)
      jqkey='.local'; title='LOCAL (OMLX / Ollama)'
      legend='(@OPUS$/@SONNET$ = if repriced on cloud · — = no data)'
      header=$'DATE\tCOST\t@OPUS$\t@SONNET$\tTOKENS\tHIT%\tSAVE%\tMODELS'
      types='date,usd,usd,usd,tok,hitpct,savepct,text'
      rowf="[.period,.cost,.costAsOpus,.costAsSonnet,.totalTokens,(.cacheHitRate//\"\"),(.cacheSaveRate//\"\"),$trunc]|@tsv"
      totf='[.cost,.costAsOpus,.costAsSonnet,.totalTokens,(.cacheHitRate//""),(.cacheSaveRate//"")]|@tsv'
      ;;
    rtk)
      jqkey='.'; title='RTK SAVINGS'
      legend='(real $ saved, broken down by model tier)'
      header=$'DATE\tCMDS\tSAVED\tSAVE%\tHAIKU$\tSONNET$\tOPUS$\tTOTAL$'
      types='date,int,tok,savepct,usd,usd,usd,usd'
      rowf='[.period,.commands,.savedTokens,(.savingsPct//""),.savedRealHaiku,.savedRealSonnet,.savedRealOpus,.savedReal]|@tsv'
      totf='[.commands,.savedTokens,(.savingsPct//""),.savedRealHaiku,.savedRealSonnet,.savedRealOpus,.savedReal]|@tsv'
      ;;
  esac
  {
    print -r -- "$header"
    if [[ $mode == full ]]; then
      jq -r "$jqkey.rows[] | $rowf" <<<"$json"
    fi
    # TOTAL row: prepend the label column the header expects.
    if [[ $key == rtk ]]; then
      jq -r "$jqkey.totals | [\"TOTAL\"] + ($totf | split(\"\t\")) | @tsv" <<<"$json"
    else
      jq -r "$jqkey.totals | [\"TOTAL\"] + ($totf | split(\"\t\")) | @tsv" <<<"$json"
    fi
  } | _decorate "$types" "$title" "$legend" ${style:+$style}
}
```

> Note: `[\"TOTAL\"] + (... | split("\t"))` re-attaches the label column so the TOTAL row lines up with the header columns. The `${style:+$style}` passes style through only when provided, else `_decorate` calls `_ai_style` itself.

- [ ] **Step 4: Run, expect PASS**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: `_render_table` asserts `ok`.

- [ ] **Step 5: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "feat(ai-usage): add _render_table for cloud/local/rtk single-source tables"
```

---

## Task 5: `_render_overall_block` — heterogeneous stacked rows

Replaces `_ai_usage_render_rtk_row`, `_ai_usage_render_rtk_pct_row`, `_ai_usage_render_oasave_row`, and the inline OVERALL+LOCAL% rows. This block pre-colors its cells (heterogeneous types per row) and passes `type=raw` to `_decorate`.

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh`
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Write failing test**

Insert before `_t_done`:

```zsh
print "== _render_overall_block =="
rj=$(zsh -c "source '$SRC'; AI_CACHE_DB='$FIX' _rtk_usage_aggregate 30")
ob=$(zsh -c "source '$SRC'; _render_overall_block \"\$1\" \"\$2\" ascii" _ "$j" "$rj")
_t_has "has OVERALL row" "$ob" 'OVERALL'
_t_has "has LOCAL% row"  "$ob" 'LOCAL%'
_t_has "has RTK% row"    "$ob" 'RTK%'
_t_has "has OASAVE% row" "$ob" 'OASAVE%'
# numbers equal to the legacy renderer's OVERALL block:
oa=$(zsh -c "source '$ORIG'; AI_CACHE_DB='$FIX' _ai_usage_render \"\$1\" \"\$2\"" _ "$j" "$rj" | _t_numbers)
ob_n=$(print -r -- "$ob" | _t_numbers)
# (the legacy output also contains the cloud/local tables; assert the stacked numbers are a subset)
_t_has "overall cost present in legacy" "$oa" "$(jq -r '.overall.totals.cost' <<<\"$j\" | awk '{printf \"%.2f\",$1}')"
```

> The strict number-equality of the whole report is enforced end-to-end in Task 7; here we assert structure + that the four labels render.

- [ ] **Step 2: Run, expect FAIL**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: FAILs under `_render_overall_block`.

- [ ] **Step 3: Implement `_render_overall_block` + `_rtk_extract_overall_vars`**

The formulas are copied verbatim from the current `_ai_usage_render_rtk_pct_row` / `_ai_usage_render_oasave_row` (RTK% and OASAVE% column math) and the OVERALL/LOCAL% rows from `_ai_usage_render`. Do not change the math.

Add to `ai-usage.zsh`:

```zsh
# Pull the six values RTK% and OASAVE% both need (was duplicated in two functions).
# Echoes: saved_real saved_local_opus saved_local_sonnet cloud_bill local_opus local_sonnet
_rtk_extract_overall_vars() {  # $1 rtk_json  $2 ccusage_json
  local r=$1 c=$2
  jq -rn --argjson r "$r" --argjson c "$c" '
    [ $r.totals.savedReal,
      $r.totals.savedLocalAsOpus,
      $r.totals.savedLocalAsSonnet,
      $c.overall.totals.cost,
      ($c.overall.totals.costAsOpus   - $c.overall.totals.cost),
      ($c.overall.totals.costAsSonnet - $c.overall.totals.cost) ] | @tsv'
}

# Render the stacked OVERALL block: OVERALL, LOCAL%, and (if rtk) RTK, RTK%, OASAVE%.
# Cells are pre-colored (heterogeneous types) and passed to _decorate as type=raw.
_render_overall_block() {  # $1 json  $2 rtk_json  $3 style(optional)
  local json=$1 rtk=$2 style=${3:-$(_ai_style)}
  local C_RST='' C_B='' C_D='' C_G=''
  if [[ $style == utf8color ]]; then
    C_RST=$'\033[0m'; C_B=$'\033[1m'; C_D=$'\033[2m'; C_G=$'\033[32m'
  fi
  # Local helpers that format+color a single cell to a final string.
  local em="—"; [[ $style == utf8color ]] && em=$'\033[2m—\033[0m'
  _usd() { [[ -z $1 || $1 == null ]] && { print -r -- "$em"; return; }; printf '$%.2f' "$1"; }
  _grn() { [[ -z $1 || $1 == null ]] && { print -r -- "$em"; return; }
           printf '%s%.1f%%%s' "$C_G" "$(( $1 * 100 ))" "$C_RST"; }
  _tok() { [[ -z $1 || $1 == null ]] && { print -r -- "$em"; return; }
           awk -v n="$1" 'BEGIN{if(n<1000)printf"%d",n;else if(n<1e6)printf"%.2fK",n/1e3;else if(n<1e9)printf"%.2fM",n/1e6;else printf"%.2fB",n/1e9}'; }

  # OVERALL + LOCAL% values (raw) from ccusage overall totals.
  local cost opus sonnet tokens hit save lso lss lst
  IFS=$'\t' read -r cost opus sonnet tokens hit save lso lss lst < <(jq -r '.overall.totals |
    [.cost,.costAsOpus,.costAsSonnet,.totalTokens,
     (.cacheHitRate//""),(.cacheSaveRate//""),
     (.localShareOpus//""),(.localShareSonnet//""),(.localShareTokens//"")]|@tsv' <<<"$json")

  # Build TSV rows (7 columns: LABEL COST @OPUS$ @SONNET$ TOKENS HIT% SAVE%).
  # HIT%/SAVE% on OVERALL keep their threshold colors via a tiny pre-color awk.
  local hitc savec
  hitc=$(awk -v v="$hit" 'BEGIN{if(v==""){print"—";exit}p=v*100;c=(p>=80?"\033[32m":(p>=50?"\033[33m":"\033[31m"));printf"%s%.1f%%\033[0m",c,p}')
  savec=$(awk -v v="$save" 'BEGIN{if(v==""){print"—";exit}p=v*100;c=(p>=60?"\033[32m":"");printf"%s%.1f%%%s",c,p,(c==""?"":"\033[0m")}')
  [[ $style != utf8color ]] && { hitc=${hit:+$(printf '%.1f%%' $((hit*100)))}; hitc=${hitc:-—}; savec=${save:+$(printf '%.1f%%' $((save*100)))}; savec=${savec:-—}; }

  {
    print -r -- $'LABEL\tCOST\t@OPUS$\t@SONNET$\tTOKENS\tHIT%\tSAVE%'
    printf 'OVERALL\t%s\t%s\t%s\t%s\t%s\t%s\n' \
      "$(_usd "$cost")" "$(_usd "$opus")" "$(_usd "$sonnet")" "$(_tok "$tokens")" "$hitc" "$savec"
    printf 'LOCAL%%\t%s\t%s\t%s\t%s\t%s\t%s\n' \
      "$em" "$(_grn "$lso")" "$(_grn "$lss")" "$(_grn "$lst")" "$em" "$em"
    if [[ -n $rtk ]]; then
      # RTK display row: savedReal$, savedTokens*5/1M, *3/1M, savedTokens.
      local sr opo sno sav
      IFS=$'\t' read -r sr opo sno sav < <(jq -r '.totals|[.savedReal,.costAsOpus,.costAsSonnet,.savedTokens]|@tsv' <<<"$rtk")
      printf 'RTK\t%s\t%s\t%s\t%s\t%s\t%s\n' \
        "$(_usd "$sr")" "$(_usd "$opo")" "$(_usd "$sno")" "$(_tok "$sav")" "$em" "$em"
      # RTK% and OASAVE% via the shared extractor + the original formulas.
      local R RLO RLS CB LO LS
      IFS=$'\t' read -r R RLO RLS CB LO LS < <(_rtk_extract_overall_vars "$rtk" "$json")
      awk -v r="$R" -v rlo="$RLO" -v rls="$RLS" -v c="$CB" -v lo="$LO" -v ls="$LS" \
          -v g="$C_G" -v rst="$C_RST" -v em="$em" '
        function pct(num,den){ if(den+0==0)return em; return sprintf("%s%.2f%%%s",g,(num/den)*100,(g==""?"":rst)) }
        BEGIN{
          printf "RTK%%\t%s\t%s\t%s\t%s\t%s\t%s\n",
            pct(r,r+c), pct(r+rlo,r+rlo+c+lo), pct(r+rls,r+rls+c+ls), em, em, em
          printf "OASAVE%%\t%s\t%s\t%s\t%s\t%s\t%s\n",
            pct(r,r+c), pct(r+rlo+lo,r+rlo+lo+c), pct(r+rls+ls,r+rls+ls+c), em, em, em
        }'
    fi
  } | _decorate 'raw,raw,raw,raw,raw,raw,raw' 'OVERALL' '' "$style"
}
```

> **Verify the RTK%/OASAVE% formulas match the original** (`ai-usage.orig.zsh` lines for `_ai_usage_render_rtk_pct_row` and `_ai_usage_render_oasave_row`) before running. They must be byte-identical math.

- [ ] **Step 4: Run, expect PASS**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: `_render_overall_block` structure asserts `ok`. (Full numeric equality is Task 7.)

- [ ] **Step 5: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "feat(ai-usage): add _render_overall_block + shared rtk var extractor"
```

---

## Task 6: `_render_report` — orchestration

Replaces `_ai_usage_render` and `_ai_usage_render_summary_block` with one function + a `mode` flag.

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh`
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Write failing test**

Insert before `_t_done`:

```zsh
print "== _render_report =="
full=$(zsh -c "source '$SRC'; _render_report \"\$1\" \"\$2\" full ascii" _ "$j" "$rj")
_t_has "full: cloud table"   "$full" '+- CLOUD (Anthropic)'
_t_has "full: rtk section"   "$full" '+- RTK SAVINGS'
_t_has "full: per-day row"   "$full" '2026-'
summ=$(zsh -c "source '$SRC'; _render_report \"\$1\" \"\$2\" summary ascii" _ "$j" "$rj")
_t_has "summary: cloud TOTAL" "$summ" 'TOTAL'
_t_no  "summary: no rtk section" "$summ" '+- RTK SAVINGS'
```

- [ ] **Step 2: Run, expect FAIL**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: FAILs under `_render_report`.

- [ ] **Step 3: Implement `_render_report`**

```zsh
# Render a full report from one window's aggregation JSON.
#   $1 json  $2 rtk_json (may be empty -> RTK rows/section omitted)
#   $3 mode  full|summary   (full = per-day rows + RTK section; summary = totals only)
#   $4 style (optional)
_render_report() {
  local json=$1 rtk=$2 mode=$3 style=${4:-$(_ai_style)}
  local tmode=totals; [[ $mode == full ]] && tmode=full
  _render_table "$json" cloud "$tmode" "$style"; print
  _render_table "$json" local "$tmode" "$style"; print
  _render_overall_block "$json" "$rtk" "$style"
  if [[ -n $rtk && $mode == full ]]; then
    print
    _render_table "$rtk" rtk full "$style"
  fi
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: `_render_report` asserts `ok`.

- [ ] **Step 5: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "feat(ai-usage): add _render_report orchestration (full|summary)"
```

---

## Task 7: Rewire public commands + enforce full numeric equality

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` (`list-ai-usage`, `list-ai-usage-2w`, `list-ai-usage-4w`)
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Rewrite the three public commands**

Replace the bodies. Reverse-video section headers per spec §6.5.

```zsh
list-ai-usage() {
  _ai_cache_sync || return 1
  local style; style=$(_ai_style)
  local hdr0='' hdr1=''; [[ $style == utf8color ]] && { hdr0=$'\033[7m'; hdr1=$'\033[0m'; }
  local today_d d7 d30
  today_d=$(date +%Y-%m-%d); d7=$(date -v-6d +%Y-%m-%d); d30=$(date -v-29d +%Y-%m-%d)
  local d1j d7j d30j
  d1j=$(_ai_usage_aggregate 1)  || return 1
  d7j=$(_ai_usage_aggregate 7)  || return 1
  d30j=$(_ai_usage_aggregate 30) || return 1
  local r1 r7 r30
  r1=$(_rtk_usage_aggregate 1)   || r1=""
  r7=$(_rtk_usage_aggregate 7)   || r7=""
  r30=$(_rtk_usage_aggregate 30) || r30=""
  print -r -- "${hdr0} === TODAY ($today_d) === ${hdr1}"
  _render_report "$d1j" "$r1" summary "$style"; print
  print -r -- "${hdr0} === LAST 7 DAYS (since $d7) === ${hdr1}"
  _render_report "$d7j" "$r7" summary "$style"; print
  print -r -- "${hdr0} === LAST 30 DAYS (since $d30) === ${hdr1}"
  _render_report "$d30j" "$r30" summary "$style"
}

list-ai-usage-2w() {
  _ai_cache_sync || return 1
  local j r; j=$(_ai_usage_aggregate 14) || return 1
  r=$(_rtk_usage_aggregate 14) || r=""
  _render_report "$j" "$r" full
}

list-ai-usage-4w() {
  _ai_cache_sync || return 1
  local j r; j=$(_ai_usage_aggregate 28) || return 1
  r=$(_rtk_usage_aggregate 28) || r=""
  _render_report "$j" "$r" full
}
```

> Note: this task keeps the existing per-window `_ai_usage_aggregate`/`_rtk_usage_aggregate` calls (still correct numbers). The sqlite-fork consolidation is Tasks 8–9, done after equality is proven, so a regression there is isolated.

- [ ] **Step 2: Run the equality gate — the key test**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: `list-ai-usage numbers identical`, `list-ai-usage-2w numbers identical`, `list-ai-usage-4w numbers identical` all `ok`. If any FAIL: a render path changed a number — diff the two `_t_numbers` streams to find the offending cell before proceeding.

- [ ] **Step 3: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "feat(ai-usage): rewire public commands to unified render layer"
```

---

## Task 8: Perf — merge `_rtk_usage_aggregate`'s 4 sqlite forks into 1 CTE

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` (`_rtk_usage_aggregate`)

- [ ] **Step 1: Replace the four sqlite3 calls with one CTE**

In `_rtk_usage_aggregate`, replace the count-check + `cloud_input_json` + `local_input_json` queries and the final `<(sqlite3 ...)` daily read with a single sqlite3 call returning `{cloudArr, localArr, daily}` (verified shape). Keep the downstream jq, but read its inputs from this one object.

New read (the `cutoff` variable is the existing `$(date -v-$((days-1))d ...)`):

```zsh
  local bundle
  bundle=$(sqlite3 "$AI_CACHE_DB" <<SQL
WITH
 cloud AS (SELECT date,model_name AS model,SUM(input_tokens) AS input FROM daily_ccusage WHERE is_cloud=1 AND date>='$cutoff' GROUP BY date,model_name),
 loc   AS (SELECT date,model_name AS model,SUM(input_tokens) AS input FROM daily_ccusage WHERE is_cloud=0 AND date>='$cutoff' GROUP BY date,model_name),
 rtk   AS (SELECT * FROM daily_rtk WHERE date>='$cutoff' ORDER BY date)
SELECT json_object(
  'cloudArr',(SELECT json_group_array(json_object('date',date,'model',model,'input',input)) FROM cloud),
  'localArr',(SELECT json_group_array(json_object('date',date,'model',model,'input',input)) FROM loc),
  'daily',   (SELECT json_group_array(json_object('date',date,'commands',commands,'input_tokens',input_tokens,'output_tokens',output_tokens,'saved_tokens',saved_tokens,'savings_pct',savings_pct,'total_time_ms',total_time_ms)) FROM rtk)
);
SQL
)
  # Bail if no rtk rows (preserves the "drop RTK" caller contract).
  local n; n=$(jq -r '(.daily|length)//0' <<<"$bundle"); [[ -n $n ]] && (( n > 0 )) || return 1
  local cloud_input_json local_input_json
  cloud_input_json=$(jq -c '.cloudArr // []' <<<"$bundle")
  local_input_json=$(jq -c '.localArr // []' <<<"$bundle")
```

Then change the final jq invocation's input from the old `<(sqlite3 ... 'daily' ...)` process substitution to `<<<"$(jq -c '{daily: (.daily // [])}' <<<"$bundle")"` so the downstream `(.daily // [])` still sees `{daily:[...]}`.

> **Before editing:** read the current `_rtk_usage_aggregate` in `ai-usage.orig.zsh` and confirm the downstream jq references exactly `$cloudArr`, `$localArr`, and `.daily`. Keep those identifiers.

- [ ] **Step 2: Run the equality gate**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: all `numbers identical` still `ok` (CTE produces identical aggregation).

- [ ] **Step 3: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh
git -C ~/.tonyyang commit -m "perf(ai-usage): merge rtk aggregate sqlite forks into one CTE"
```

---

## Task 9: Perf — `list-ai-usage` single read + 3-window jq

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh` (`_AI_USAGE_JQ`, add `_ai_usage_aggregate_multi`, `list-ai-usage`)
- Modify: `~/.tonyyang/scripts/tests/test_ai_usage.zsh`

- [ ] **Step 1: Add an off-by-one boundary test**

Insert before `_t_done`:

```zsh
print "== 3-window boundary =="
# The today-30 row ($99.99) must NOT appear in any window (cutoff is -(N-1)).
m=$(zsh -c "source '$SRC'; AI_CACHE_DB='$FIX' _ai_usage_aggregate_multi")
c30=$(jq -r '.d30.overall.totals.cost' <<<"$m")
_t_eq "30d overall excludes boundary (34.34 not 134.33)" "34.34" "$(printf '%.2f' "$c30")"
c1=$(jq -r '.d1.overall.totals.cost' <<<"$m")
_t_eq "1d overall = 15.34" "15.34" "$(printf '%.2f' "$c1")"
```

- [ ] **Step 2: Run, expect FAIL** (`_ai_usage_aggregate_multi` undefined)

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: FAILs under `3-window boundary`.

- [ ] **Step 3: Wrap `_AI_USAGE_JQ` body in a `def report`**

In `_AI_USAGE_JQ`, the defs (`is_cloud`,`hit`,`save`,`opus_price`,`sonnet_price`,`cost_at`,`bucket`,`finalize`) stay. Change the trailing expression (from `bucket(is_cloud) as $cloud | ... }`) so the whole final object is produced by a named def:

```
... (all existing defs unchanged) ...
def report:
  bucket(is_cloud)       as $cloud |
  bucket(is_cloud | not) as $local |
  { cloud: ($cloud|finalize), local: ($local|finalize), overall: { totals: ( ... existing ... ) } };
report
```

(The final `report` keeps single-window `_ai_usage_aggregate` working unchanged.)

- [ ] **Step 4: Add `_ai_usage_aggregate_multi`**

```zsh
# Read the 30-day window ONCE, emit {d1,d7,d30} each = a full report.
# Cutoffs use -(N-1) days to match the single-window query semantics exactly.
_ai_usage_aggregate_multi() {
  local c1 c7 c30
  c1=$(date +%Y-%m-%d); c7=$(date -v-6d +%Y-%m-%d); c30=$(date -v-29d +%Y-%m-%d)
  sqlite3 "$AI_CACHE_DB" <<SQL | jq --arg c1 "$c1" --arg c7 "$c7" --arg c30 "$c30" "
    $_AI_USAGE_JQ_DEFS
    { d1:  ([.[]|select(.date>=\$c1)]  | report),
      d7:  ([.[]|select(.date>=\$c7)]  | report),
      d30: ([.[]|select(.date>=\$c30)] | report) }
  "
SELECT json_group_array(json_object(
  'date',date,'is_cloud',is_cloud,'model_name',model_name,
  'input_tokens',input_tokens,'output_tokens',output_tokens,
  'cache_read',cache_read,'cache_write',cache_write,'cost',cost))
FROM daily_ccusage WHERE date >= '$c30';
SQL
}
```

> This requires `_AI_USAGE_JQ_DEFS` = the defs + `def report:` **without** the trailing `report` call. Split the current `_AI_USAGE_JQ` constant into `_AI_USAGE_JQ_DEFS` (defs + `def report:`) and keep `_AI_USAGE_JQ='$_AI_USAGE_JQ_DEFS\nreport'` so `_ai_usage_aggregate` is unchanged. Do this split in Step 3.

- [ ] **Step 5: Point `list-ai-usage` at the multi reader**

In `list-ai-usage`, replace the three `_ai_usage_aggregate 1/7/30` calls with:

```zsh
  local multi; multi=$(_ai_usage_aggregate_multi) || return 1
  local d1j d7j d30j
  d1j=$(jq -c .d1 <<<"$multi"); d7j=$(jq -c .d7 <<<"$multi"); d30j=$(jq -c .d30 <<<"$multi")
```

(Leave the three `_rtk_usage_aggregate` calls as-is; each is now one CTE fork from Task 8. Total for `list-ai-usage`: 1 ccusage + 3 rtk sqlite = within the consolidation goal; the dominant per-cell awk forks are already gone.)

- [ ] **Step 6: Run all tests + equality gate**

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: `3-window boundary` asserts `ok`; all `numbers identical` still `ok`.

- [ ] **Step 7: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh scripts/tests/test_ai_usage.zsh
git -C ~/.tonyyang commit -m "perf(ai-usage): single read + 3-window jq for list-ai-usage"
```

---

## Task 10: Region reorg, TOC, delete dead code

**Files:**

- Modify: `~/.tonyyang/scripts/ai-usage.zsh`

- [ ] **Step 1: Delete now-unused functions**

Remove (all replaced): `_ai_usage_humanize`, `_ai_usage_pct`, `_ai_usage_truncate_models` (+ its `_AI_USAGE_MODELS_MAX` constant), `_ai_usage_print_section`, `_ai_usage_print_section_totals_only`, `_ai_usage_print_rtk_section`, `_ai_usage_render`, `_ai_usage_render_summary_block`, `_ai_usage_render_rtk_row`, `_ai_usage_render_rtk_pct_row`, `_ai_usage_render_oasave_row`.

- [ ] **Step 2: Add region markers + TOC**

Reorder the file into the 7 regions from the File Structure section. Add at the very top:

```zsh
# #region 0  Configuration & TOC
#   1 Schema & Constants  · 2 Cache Layer · 3 Aggregation
#   4 Formatting (_ai_style,_decorate) · 5 Render · 6 Public Commands
```

Wrap each section with `# #region N  <name>` ... `# #endregion`. Move the color/threshold constants into region 1 next to the price table.

- [ ] **Step 3: Syntax check + full suite**

Run: `zsh -n ~/.tonyyang/scripts/ai-usage.zsh && echo SYNTAX_OK`
Expected: `SYNTAX_OK`.

Run: `zsh ~/.tonyyang/scripts/tests/test_ai_usage.zsh`
Expected: every assert `ok`, `0 failed`.

- [ ] **Step 4: Checkpoint**

```bash
git -C ~/.tonyyang add scripts/ai-usage.zsh
git -C ~/.tonyyang commit -m "refactor(ai-usage): region reorg + TOC, delete superseded render/format helpers"
```

---

## Task 11: Visual verification on the real DB + cleanup

**Files:**

- Delete: `~/.tonyyang/scripts/ai-usage.orig.zsh`

- [ ] **Step 1: Capture pre-refactor numbers from the REAL db (from git, before this branch)**

```bash
git -C ~/.tonyyang stash 2>/dev/null
git -C ~/.tonyyang show HEAD~10:scripts/ai-usage.zsh > /tmp/aiu_before.zsh 2>/dev/null || cp ~/.tonyyang/scripts/ai-usage.orig.zsh /tmp/aiu_before.zsh
git -C ~/.tonyyang stash pop 2>/dev/null
zsh -c "source /tmp/aiu_before.zsh; list-ai-usage" | sed $'s/\033\\[[0-9;]*m//g' | grep -oE '\$?-?[0-9]+(\.[0-9]+)?[KMB%]?' > /tmp/aiu_before.nums
```

(If `ai-usage.orig.zsh` is the cleanest "before", just use it directly: `zsh -c "source ~/.tonyyang/scripts/ai-usage.orig.zsh; list-ai-usage" | ... > /tmp/aiu_before.nums`.)

- [ ] **Step 2: Compare real-db numbers, new vs before**

```bash
zsh -ic "list-ai-usage" | sed $'s/\033\\[[0-9;]*m//g' | grep -oE '\$?-?[0-9]+(\.[0-9]+)?[KMB%]?' > /tmp/aiu_after.nums
diff /tmp/aiu_before.nums /tmp/aiu_after.nums && echo "NUMBERS IDENTICAL"
```

Expected: `NUMBERS IDENTICAL`. (Run within the same hour so the cache TTL doesn't refetch mid-comparison.)

- [ ] **Step 3: Eyeball the rendered output (the visual gate — spec Constitution requires it)**

```bash
zsh -ic "list-ai-usage"      # boxes, colors, legends, reverse-video headers
zsh -ic "list-ai-usage-2w"   # per-day rows + RTK SAVINGS section
zsh -ic "list-ai-usage-4w | cat"   # piped -> ASCII fallback, no color
AI_USAGE_PLAIN=1 zsh -ic "list-ai-usage"   # forced plain
```

Confirm by eye: columns aligned (incl. em-dash rows), HIT% red/yellow/green, SAVE% green-only, RTK%/OASAVE% green, idle-day cost dim, TOTAL/OVERALL bold, boxes closed, ASCII fallback clean when piped/plain.

- [ ] **Step 4: Remove the transient orig copy + test fixture**

```bash
rm -f ~/.tonyyang/scripts/ai-usage.orig.zsh /tmp/aiu_test.sqlite
```

> Keep `tests/harness.zsh` and `tests/test_ai_usage.zsh` — but note the orig-vs-new equality tests now have no orig. Either (a) leave them (they will skip/fail gracefully if orig is absent — guard with `[[ -f $ORIG ]]`), or (b) convert them to assert against `/tmp/aiu_before.nums`. Add the `[[ -f $ORIG ]] || return` guard around `_t_cmp_cmd` calls.

- [ ] **Step 5: Final checkpoint**

```bash
git -C ~/.tonyyang add -A scripts/
git -C ~/.tonyyang commit -m "chore(ai-usage): drop transient orig copy; guard equality tests"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** §4.1 region reorg → Task 10. §4.2 A2 render mechanism → Task 3. §4.3 four units → Tasks 3–6. §4.4 col-type vector → Task 3. §5.1 fork reduction → Tasks 3 (awk), deviation noted. §5.2 rtk CTE → Task 8. §5.3 3-window + off-by-one → Task 9. §6.1 color policy → Task 3 (thresholds) + Task 5 (stacked). §6.2 style gating → Task 2. §6.3 box + fallback → Task 3. §6.4 legends + @OPUS$ kept → Task 4. §6.5 reverse-video headers → Task 7. §9 risks → equality gate (Tasks 1/7), off-by-one test (Task 9), CTE shape (Task 8 pre-check), visual gate (Task 11).
- **Placeholder scan:** none — all code blocks are concrete and the three hardest (`_decorate`, 3-window jq, rtk CTE) were prototyped and run on the target machine before being written here.
- **Type consistency:** function names stable across tasks (`_ai_style`, `_decorate`, `_render_table`, `_render_overall_block`, `_render_report`, `_ai_usage_aggregate_multi`, `_rtk_extract_overall_vars`); col-type token vocabulary fixed in Task 3 and reused verbatim in Tasks 4–5.
