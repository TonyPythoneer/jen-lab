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

Separate `RTK SAVINGS` section (same pattern as CLOUD/LOCAL) printed after the OVERALL block:

```
RTK SAVINGS
DATE        CMDS   SAVED     SAVE%   @OPUS$   @SONNET$
2026-05-22    45   450.00K   62.7%   $0.02    $0.01
...
TOTAL        123   3.74M     62.7%   $0.23    $0.14
```

## Parallel Fetch

`_ai_cache_sync` and `_rtk_cache_sync` run in background simultaneously.
The RTK temp-file path is stored in a module-level variable `_RTK_TMP`.

```
_ai_cache_sync & _rtk_cache_sync &
wait
```

RTK cost calculation happens after `wait`, reading `cacheSaveRate` from the
aggregate result (which depends on the completed SQLite sync).

## New Functions

| Function                                  | Responsibility                                                   |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `_rtk_cache_sync`                         | Fetch `rtk gain --daily --format json` into `$_RTK_TMP`          |
| `_rtk_usage_aggregate days cacheSaveRate` | Filter `$_RTK_TMP` by date window, compute weighted savings cost |
| `_ai_usage_render_rtk_row rtk_json`       | Print single RTK row for OVERALL section                         |
| `_ai_usage_print_rtk_section rtk_json`    | Print full RTK SAVINGS table for 2w/4w                           |

## Modified Functions

| Function                         | Change                                               |
| -------------------------------- | ---------------------------------------------------- |
| `list-ai-usage`                  | Parallel fetch; pass RTK row into each summary block |
| `list-ai-usage-2w`               | Parallel fetch; append RTK SAVINGS section           |
| `list-ai-usage-4w`               | Parallel fetch; append RTK SAVINGS section           |
| `_ai_usage_render`               | Accept optional RTK section at bottom                |
| `_ai_usage_render_summary_block` | Accept optional RTK row in OVERALL                   |

## Constraints

- `_RTK_TMP` must be cleaned up (`rm -f`) after each top-level command.
- If `rtk` is not found or returns non-zero, RTK row is silently omitted.
- `cacheSaveRate` passed into `_rtk_usage_aggregate` is the **overall** rate
  for the window (not cloud-only), matching how OVERALL already mixes both.
