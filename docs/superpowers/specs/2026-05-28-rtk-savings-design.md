# RTK Savings Integration Design

**Date:** 2026-05-28  
**File:** `~/.tonyyang/scripts/ai-usage.zsh`

## Goal

Surface RTK token savings alongside the existing ccusage CLOUD/LOCAL/OVERALL tables so the full cost picture is visible in one place.

## Data Source

`rtk gain --daily --format json` — returns `summary` and `daily[]` entries.

Each daily entry:

```json
{
  "date": "2026-05-22",
  "commands": 45,
  "saved_tokens": 450000,
  "savings_pct": 62.7
}
```

`saved_tokens` = tool-output tokens intercepted by RTK and never sent to Claude.

## Cost Formula

Saved tokens mix input reads and cache reads in an unknown ratio. We use the
window's `cacheSaveRate` from ccusage as a proxy:

```
saved_cost(price) =
  saved_tokens × (
    (1 - cacheSaveRate) × price.input +
    cacheSaveRate       × price.read
  ) / 1_000_000
```

Prices ($/MTok):

| Tier   | input | read |
| ------ | ----- | ---- |
| Opus   | 5.00  | 0.50 |
| Sonnet | 3.00  | 0.30 |

This is an estimate; the true ratio of fresh-input vs. cache-read for RTK-filtered tokens is unknowable without deeper instrumentation.

## Display

### `list-ai-usage` (totals view)

RTK row appended after `LOCAL%` in each time block's OVERALL section:

```
OVERALL  $25.96  $25.96  $25.96  50.52M  96.9%  96.9%
LOCAL%   —       0.0%    0.0%    —       —      —
RTK      —       $0.23   $0.14   3.74M   —      —
```

Columns: label | cost(`—`) | @OPUS$ saved | @SONNET$ saved | saved tokens | `—` | `—`

### `list-ai-usage-2w` / `list-ai-usage-4w` (daily view)

Separate `RTK SAVINGS` section (same pattern as CLOUD/LOCAL) printed after the OVERALL block. Per-day rows use that day's ccusage model mix; TOTAL = sum-of-days (NOT window-flat) to keep per-row + TOTAL consistent and avoid cross-day smearing.

```
RTK SAVINGS
DATE        CMDS  SAVED    SAVE%  HAIKU$  SONNET$  OPUS$  TOTAL$
2026-05-15  464   64.08K   46.6%  $0.00   $0.03    $0.26  $0.30
2026-05-20  237   1.82M    98.6%  $0.32   $4.06    $0.36  $4.74
...
TOTAL       3057  2.77M    48.4%  $0.33   $4.31    $0.83  $5.47
```

Per-tier columns show which cloud model received the intercepted token volume (priced at real per-tier rates).

## Sync

Both ccusage and RTK persist into the same sqlite DB (`$AI_CACHE_DB`):

- **daily_ccusage**: per (date, model_name), populated by `bunx ccusage --json` + UPSERT.
- **daily_rtk**: per date, populated by `rtk gain --all --format=json` + UPSERT.
- **latest_sync_at**: single-row cursor (`id = 1` CHECK constraint), `synced_at` typed as `DATETIME` so any sqlite client renders it human-readably.

All three sit behind the same gate: `_ai_sync_status` returns `(ttl_expired, crossed_day, synced_at, synced_date)`. Sync triggers if **either** flag is 1 — crossed_day overrides a TTL-fresh cursor so a 23:50 sync followed by a 00:30 view still re-fetches.

**Cross-day re-sync**: `fetch_start = synced_date`. Wipe range `[fetch_start .. today]` applies to **both** `daily_ccusage` and `daily_rtk` before UPSERT, so partial last-sync rows don't survive.

| Scenario                                  | Wipe range              | ccusage --since   | RTK fetch       |
| ----------------------------------------- | ----------------------- | ----------------- | --------------- |
| Same-day TTL miss (last sync 2 hours ago) | today only              | today             | full (filtered) |
| Cross-day (last sync yesterday)           | yesterday + today       | yesterday         | full (filtered) |
| Cross-multi-day gap                       | from synced day → today | from synced day   | full (filtered) |
| First run (no synced_at)                  | full window             | window lower edge | full            |

RTK CLI returns the full history every call; the jq filter (`select(.date >= $cutoff)`) trims to `fetch_start` before staging so daily_rtk's wipe + UPSERT shape matches ccusage's.

Callers do nothing special — just `_ai_cache_sync` then `_*_usage_aggregate`. No temp-file lifecycle. No `$_RTK_TMP` / `$AI_CACHE_RTK_JSON` variables.

## New Functions

| Function                                        | Responsibility                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `_rtk_usage_aggregate days`                     | Pull per-model input from sqlite, reverse-engineer cloud + local RTK savings |
| `_ai_usage_render_rtk_row rtk_json`             | Print single RTK row (real $, opus $, sonnet $, tokens)                      |
| `_ai_usage_render_rtk_pct_row rtk_json cc_json` | Print RTK% row (pure RTK contribution share)                                 |
| `_ai_usage_render_oasave_row rtk_json cc_json`  | Print OASAVE% row (RTK + entire local workload share)                        |
| `_ai_usage_print_rtk_section rtk_json`          | Print full RTK SAVINGS table for 2w/4w                                       |

RTK JSON fetch (`rtk gain --all --format=json` → `$AI_CACHE_RTK_JSON`) is folded into `_ai_cache_sync` with its own 1-hour TTL gate based on file mtime. Independent of ccusage gate.

## Implementation: Required Script Comments

註解必須是 **plain English**、句句精簡、不重複 spec、只保留未來改 code 時需要的 WHY。下列為強制最小集合：

### Block A — above `_rtk_usage_aggregate`

```
# rtk saved_tokens is system-wide (intercepts tool output for both
# cloud-bound and local-bound calls). Split it back across models:
#   pct = saved / (cloudInput + localInput + saved)  # uniform filter rate
#   savedTokens_M = input_M * pct / (1 - pct)
# Then cloud side priced at real per-model rates (rtkSavedReal$),
# local side priced as opus / sonnet hypotheticals (no real cost).
```

### Block B — above the RTK% / OASAVE% render

```
# Each column = "RTK's pure contribution as % of the no-RTK total bill"
# in a given pricing world. Cloud side is always real $; local side has
# no real price, so cols 2 and 3 reprice local-side RTK savings AND the
# local workload itself as opus / sonnet.
#
# RTK%:
#   Col1 = rtkSavedReal / (rtkSavedReal + cloudBill)
#   Col2 = (rtkSavedReal + rtkSavedLocalAsOpus) /
#          (rtkSavedReal + rtkSavedLocalAsOpus + cloudBill + localAsOpus)
#   Col3 = (rtkSavedReal + rtkSavedLocalAsSonnet) /
#          (rtkSavedReal + rtkSavedLocalAsSonnet + cloudBill + localAsSonnet)
#
# OASAVE% (full RTK + entire local workload share, ≈ LOCAL% + RTK%):
#   Col1 = same as RTK% Col1
#   Col2 = (rtkSavedReal + rtkSavedLocalAsOpus + localAsOpus) /
#          (rtkSavedReal + rtkSavedLocalAsOpus + localAsOpus + cloudBill)
#   Col3 = (rtkSavedReal + rtkSavedLocalAsSonnet + localAsSonnet) /
#          (rtkSavedReal + rtkSavedLocalAsSonnet + localAsSonnet + cloudBill)
#
# Extract from ccusage overall totals:
#   cloudBill     = .overall.totals.cost
#   localAsOpus   = .overall.totals.costAsOpus   - .overall.totals.cost
#   localAsSonnet = .overall.totals.costAsSonnet - .overall.totals.cost
# Subtraction is exact: _AI_USAGE_JQ defines costAsOpus = cloud.cost + localOpus.
#
# RTK row (display only, NOT the RTK% / OASAVE% numerator):
#   Col1 rtkSavedReal | Col2 savedTokens*5/1M | Col3 savedTokens*3/1M | Col4 savedTokens
```

### Block C — fallback

```
# rtk missing or non-zero exit: drop RTK, RTK% and OASAVE% rows entirely.
# Do not print dashes or 0% — reads as "RTK saved nothing".
```

PR missing any of these comments is not done.

## Modified Functions

| Function                         | Change                                               |
| -------------------------------- | ---------------------------------------------------- |
| `list-ai-usage`                  | Parallel fetch; pass RTK row into each summary block |
| `list-ai-usage-2w`               | Parallel fetch; append RTK SAVINGS section           |
| `list-ai-usage-4w`               | Parallel fetch; append RTK SAVINGS section           |
| `_ai_usage_render`               | Accept optional RTK section at bottom                |
| `_ai_usage_render_summary_block` | Accept optional RTK row in OVERALL                   |

## RTK% Row Format (resolved 2026-05-28)

### Final Decision

Three rows appended after LOCAL% in OVERALL section. 欄位與 OVERALL 完全對齊：Col1=real、Col2=@opus、Col3=@sonnet、Col4=tokens、Col5/6=cache。LOCAL% Col4 = local token 數 / overall token 數（volume share）。

```
OVERALL  $652.47  $811.48  $747.88  1.08B    97.2%  94.8%
LOCAL%   —        19.6%    12.8%    4.5%     —      —
RTK      $real$   $opus$   $sonnet$ 3.74M    —      —
RTK%     real%    opus%    sonnet%  —        —      —
OASAVE%  real%    opus%    sonnet%  —        —      —
```

### Core Semantic（修改前必讀）

**RTK 攔截是系統範圍**：`rtk gain --all --format=json` 的 `saved_tokens` 涵蓋 cloud-觸發 + local-觸發的 tool output。反推時用系統級 filter rate `pct = saved / (cloudInput + localInput + saved)` 按 model input 比例攤分 saved tokens。

**RTK cloud 部分（`rtkSavedReal$`）恆為真實值**：cloud-attributed saved tokens × 各 model 真實單價。是「真的少花的錢」。

**RTK local 部分（`rtkSavedLocalAsOpus$` / `rtkSavedLocalAsSonnet$`）需要假想計價**：local model 無單價，把攤分到 local 的 saved tokens 用 opus 或 sonnet 單價估算。

**Local 工作量本體（`localAsOpus` / `localAsSonnet`）也需要假想計價**：跟 RTK 無關，只是 local 工作量本身的 cloud 等值估算。

**三行的問句**：

- **RTK%**：「**純 RTK** 在某計價情境下，沒 RTK bill 會多漲幾 %」（分子只含 RTK 兩面）
- **OASAVE%**：「**RTK + 整個 local 工作量** 在某計價情境下佔 (RTK + local + cloudBill) 幾 %」（分子混進整個 local 工作量；數值與 LOCAL% 接近因為 RTK 通常遠小於 local 工作量）

> **此語意必須同步寫入 script 註解**。未來修改任何公式前先讀懂這段，避免把 cloud/local 兩側混淆或把 RTK 跟 local 工作量混為一談。

### Column Definitions

| Row     | Col1                                          | Col2                                                                                                                      | Col3                                                                                                                              | Col4                      | Col5 | Col6 |
| ------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---- | ---- |
| RTK     | `rtkSavedReal$`                               | `rtkSavedOpus$` = `savedTokens × 5/1M`                                                                                    | `rtkSavedSonnet$` = `savedTokens × 3/1M`                                                                                          | `savedTokens` (humanized) | —    | —    |
| RTK%    | `rtkSavedReal$ / (rtkSavedReal$ + cloudBill)` | `(rtkSavedReal$ + rtkSavedLocalAsOpus$) / (rtkSavedReal$ + rtkSavedLocalAsOpus$ + cloudBill + localAsOpus)`               | `(rtkSavedReal$ + rtkSavedLocalAsSonnet$) / (rtkSavedReal$ + rtkSavedLocalAsSonnet$ + cloudBill + localAsSonnet)`                 | —                         | —    | —    |
| OASAVE% | `rtkSavedReal$ / (rtkSavedReal$ + cloudBill)` | `(rtkSavedReal$ + rtkSavedLocalAsOpus$ + localAsOpus) / (rtkSavedReal$ + rtkSavedLocalAsOpus$ + localAsOpus + cloudBill)` | `(rtkSavedReal$ + rtkSavedLocalAsSonnet$ + localAsSonnet) / (rtkSavedReal$ + rtkSavedLocalAsSonnet$ + localAsSonnet + cloudBill)` | —                         | —    | —    |

其中 `cloudBill = .overall.totals.cost`。

**Row 區別**

- **RTK%**：分子是**純 RTK 兩面貢獻**（cloud 真實節省 + local 假想節省）。Col1 沒 local（local 無真實 $），所以 Col1 = `rtkSavedReal$ / (rtkSavedReal$ + cloudBill)`。
- **OASAVE%**：分子是 **完整 RTK 兩面貢獻 + 整個 local 工作量**。Col1 跟 RTK% Col1 相同（local 部分為 0）。Col2/Col3 ≈ LOCAL% + RTK%（同欄相加），略低一點點是因為分母也擴大稀釋。

**Col1 設計筆記**

`rtkSavedReal$` 改為 sum-of-days（之前是 window-flat）後，Col1 不再永遠趨近 0% — 攔截集中發生的日子（如某天 SAVE% 98% + 該日 cloud 有 input）會貢獻完整 real$，不被其他低活躍日的局部 mix 稀釋掉。如果未來想再改攤分模型（commands 計數、output_tokens 比例、rtk 自己回報 per-model 攔截量），可以在 `_rtk_usage_aggregate` 內的 `real_breakdown` 函式換實作。

### Calculation Details

從 sqlite 拉每個 model 的 post-RTK input tokens（cloud + local 分開），加 rtk JSON 的總 saved，反推系統級 filter rate 後按 model input 比例攤分回去。

**變數**

- `cloudInput_M` = sqlite `SUM(input_tokens)` per model where `is_cloud=1`
- `localInput_M` = 同上 where `is_cloud=0`
- `saved` = `rtk gain --all --format=json` 的 `Σ daily[].saved_tokens` 於時間視窗內
- `price_M` = opus $5/MTok, sonnet $3/MTok, haiku $0.8/MTok（model name 含 "opus"/"sonnet"/"haiku"，case-insensitive）

**公式**

```
pct   = saved / (Σ cloudInput_M + Σ localInput_M + saved)   # 系統級 filter rate
scale = pct / (1 − pct)

savedTokens_M       = inputM × scale                         # 兩側都套用
rtkSavedReal$       = Σ (cloud models) savedTokens_M × price_M
savedLocalTokens    = Σ (local models) savedTokens_M
rtkSavedLocalAsOpus$   = savedLocalTokens × 5/1M
rtkSavedLocalAsSonnet$ = savedLocalTokens × 3/1M
```

**假設**：RTK 在所有 model 的攔截比例一致（按 input 量攤分）。

**其他中介量**

- **rtkSavedOpus$** (RTK 列 Col2 顯示): `savedTokens × 5/1M`（全 saved tokens 當 opus；跟 RTK% 分子不同）
- **rtkSavedSonnet$** (RTK 列 Col3 顯示): `savedTokens × 3/1M`
- **localAsOpus**: `.overall.totals.costAsOpus − .overall.totals.cost`（精確；`_AI_USAGE_JQ` 定義 `costAsOpus = cloud.cost + localOpus`，相減即 local-only-as-opus）
- **localAsSonnet**: `.overall.totals.costAsSonnet − .overall.totals.cost`
- **cloudBill**: `.overall.totals.cost`（cloud 真實計費；local 不計費）

### Status

Resolved. User approved this format.

### Resolved Questions (2026-05-28)

1. ~~RTK% Col2 numerator ambiguity~~ — 分子 = `rtkSavedReal$ + localAsOpus`（local 假想計價）；分母加上 `.overall.totals.cost`。Col3 同理用 sonnet。
2. ~~rtkSavedReal$ formula~~ — 見 §Calculation Details。用 post-RTK input × `savings_pct / (1 − savings_pct)` 反推。
3. ~~RTK row Col2/Col3 definition~~ — Col2 = `rtkSavedOpus$`, Col3 = `rtkSavedSonnet$`, Col4 = `savedTokens`（純展示，跟 RTK% 分子不同）。
4. ~~RTK% Col1 denominator~~ — `.overall.totals.cost`（actual cloud bill）。
5. ~~localAsOpus / localAsSonnet 抽取~~ — 精確值 = `costAsOpus − cost` / `costAsSonnet − cost`。ccusage jq 已用 `cloud.cost + localOpus` 算 `costAsOpus`，相減即 local-only。

## Constraints

- `_RTK_TMP` must be cleaned up (`rm -f`) after each top-level command.
- If `rtk` is not found or returns non-zero, RTK row is silently omitted.
- `cacheSaveRate` passed into `_rtk_usage_aggregate` is the **overall** rate
  for the window (not cloud-only), matching how OVERALL already mixes both.
