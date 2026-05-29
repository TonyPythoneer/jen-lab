# list-ai-usage Summary Format — Design Spec

**Status:** Design complete — awaiting user review of this file, then handoff to `writing-plans`.
**Target file:** `~/.tonyyang/scripts/ai-usage.zsh`
**Date:** 2026-05-29
**Model:** Opus 4.8

---

## 0. 一句話總結

只改 `list-ai-usage` 的 summary 表格：`CLOUD` 列 header 改成 `-> claude`，TOTAL 與 OVERALL 之間加 `---` 分隔線。`list-ai-usage-2w` / `-4w` 不改动。

---

## 1. 背景

`list-ai-usage` 目前用 `_render_report` 的 `mode=summary`，輸出三個時間窗（today / 7d / 30d），每個窗包含：

- 合併表格（CLOUD / LOCAL / TOTAL 三行）
- OVERALL 區塊（OVERALL / LOCAL% / RTK / RTK% / OASAVE%）

**目前格式**（today 窗）：

```
+-----------------------------------------------------------+
| TYPE   COST    @OPUS$  @SONNET$  TOKENS      HIT%   SAVE% |
+-----------------------------------------------------------+
| CLOUD  $37.29  —       —             51.05M  94.7%  94.6% |
| LOCAL  $0.00   $51.47  $30.88        10.15M  0.0%   —     |
| TOTAL  $37.29  $51.47  $30.88        61.20M  94.7%  94.6% |
+-----------------------------------------------------------+

+- OVERALL -----------------------------------------------+
|          COST    @OPUS$  @SONNET$  TOKENS  HIT%   SAVE% |
+---------------------------------------------------------+
| OVERALL  $37.29  $88.76  $68.17    61.20M  94.7%  78.8% |
| LOCAL%   —       58.0%   45.3%     16.6%   —      —     |
| RTK      $0.00   $0.08   $0.05     15.27K  —      —     |
| RTK%     0.00%   0.09%   0.07%     —       —      —     |
| OASAVE%  0.00%   58.02%  45.33%    —       —      —     |
+---------------------------------------------------------+
```

**問題**：

1. `CLOUD` 列 header 不夠直觀，想改成 `-> claude`
2. TOTAL 和 OVERALL 之間沒有分隔，視覺上容易混淆

---

## 2. 目標

| 面向                  | 範圍                     |
| --------------------- | ------------------------ |
| 只改 `list-ai-usage`  | `-2w` / `-4w` 不動       |
| `CLOUD` → `-> claude` | 合併表格的第一列 header  |
| TOTAL / OVERALL 分隔  | 加 `---` 分隔線          |
| 零數字變更            | 所有數值、格式、顏色不變 |

---

## 3. 變更設計

### 3.1 `_render_merged_table`：`CLOUD` → `-> claude`

**位置**：L817

**变更前**：

```zsh
printf 'CLOUD\t%s\t%s\t%s\t%10s\t%s\t%s\n' \
```

**變更後**：

```zsh
printf '-> claude\t%s\t%s\t%s\t%10s\t%s\t%s\n' \
```

**影響**：

- 表格第一列的 TYPE 欄位從 `CLOUD` 改成 `-> claude`
- `_decorate` 的 bold 偵測（L746: `raw[r,1] ~ /^(TOTAL|OVERALL)/`）不受影響，因為 `-> claude` 不匹配
- 列寬計算：`-> claude` (9 chars) vs `CLOUD` (5 chars)，需要確認對齊

### 3.2 `_render_report`：TOTAL / OVERALL 之間加分隔線

**位置**：L918–933

**变更前**：

```zsh
_render_report() {
  ...
  if [[ $mode == summary ]]; then
    _render_merged_table "$json" "$style"; print
  else
    _render_table "$json" cloud "$tmode" "$style"; print
    _render_table "$json" local "$tmode" "$style"; print
  fi
  _render_overall_block "$json" "$rtk" "$style"
  ...
}
```

**变更後**：

```zsh
_render_report() {
  ...
  if [[ $mode == summary ]]; then
    _render_merged_table "$json" "$style"; print
    print '---'  # separator between merged table and OVERALL block
  else
    _render_table "$json" cloud "$tmode" "$style"; print
    _render_table "$json" local "$tmode" "$style"; print
  fi
  _render_overall_block "$json" "$rtk" "$style"
  ...
}
```

**影響**：

- summary mode 的 merged table 和 OVERALL block 之間多一行 `---`
- full mode（`-2w` / `-4w`）不受影響

---

## 4. 預期輸出

### 4.1 summary mode（`list-ai-usage`）

```
=== TODAY (2026-05-29) ===
+---------------------------------------------------------------------+
| TYPE        COST    @OPUS$  @SONNET$  TOKENS      HIT%   SAVE%       |
+---------------------------------------------------------------------+
| -> claude   $37.29  —       —             51.05M  94.7%  94.6%      |
| LOCAL       $0.00   $51.47  $30.88        10.15M  0.0%   —          |
| TOTAL       $37.29  $51.47  $30.88        61.20M  94.7%  94.6%      |
+---------------------------------------------------------------------+
---

+- OVERALL -----------------------------------------------+
|          COST    @OPUS$  @SONNET$  TOKENS  HIT%   SAVE% |
+---------------------------------------------------------+
| OVERALL  $37.29  $88.76  $68.17    61.20M  94.7%  78.8% |
| LOCAL%   —       58.0%   45.3%     16.6%   —      —     |
| RTK      $0.00   $0.08   $0.05     15.27K  —      —     |
| RTK%     0.00%   0.09%   0.07%     —       —      —     |
| OASAVE%  0.00%   58.02%  45.33%    —       —      —     |
+---------------------------------------------------------+
```

### 4.2 full mode（`list-ai-usage-2w` / `-4w`）— 不变更

保持原樣，CLOUD / LOCAL 分離表格 + OVERALL + RTK SAVINGS。

---

## 5. 不在範圍內

- `list-ai-usage-2w` / `-4w` 不改动
- 不改 `_decorate` 的 bold/dim 邏輯
- 不改 OVERALL 區塊內部結構
- 不改顏色策略
- 不改 aggregation 數學

---

## 6. 驗證

1. 執行 `list-ai-usage`，確認：
   - `CLOUD` 列 header 改成 `-> claude`
   - TOTAL 和 OVERALL 之間有 `---` 分隔線
   - 所有數值與变更前一致
2. 執行 `list-ai-usage-2w`，確認不受影響
3. 執行 `list-ai-usage-4w`，確認不受影響
4. 執行 `pnpm check`（lint + format + typecheck）
