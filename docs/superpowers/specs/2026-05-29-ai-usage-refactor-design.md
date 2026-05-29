# ai-usage.zsh Refactor — Design Spec

**Status:** Design complete — awaiting user review of this file, then handoff to `writing-plans`.
**Target file:** `~/.tonyyang/scripts/ai-usage.zsh` (1051 行)
**Date:** 2026-05-29
**Model:** Opus 4.8

---

## 0. 一句話總結

維持單檔、零外部依賴,做三件事:

1. **Render 層** 8 個近乎重複的函式收斂成 **4 個**(一個通用 awk 渲染器 + 三個薄組裝層)。
2. **效能** 砍掉 fork 爆炸(`list-ai-usage-4w` 從 ~239 次 awk 降到個位數)、把 15 次 sqlite 併成 2 次。
3. **視覺** 顏色 + box-drawing 框線 + legend 圖例,顏色只給「有好壞語意」的欄位。

設計已通過一輪對抗式驗證(5 個獨立 lens + 1 個 critic,POC 在本機 BSD awk 實跑),驗證結論與決策記錄在 §7、§8。

---

## 1. 背景

`~/.tonyyang/scripts/ai-usage.zsh` 是 1051 行 zsh script,職責:

- 用 sqlite 快取 `bunx ccusage` 與 `rtk gain --all` 的每日資料
- 聚合成 cloud / local / overall / RTK 四種視角
- 輸出三個指令:`list-ai-usage`(today/7d/30d 摘要)、`list-ai-usage-2w`、`list-ai-usage-4w`

依賴:`bunx`、`jq`、`awk`、`column`、`sqlite3`。

**為什麼這檔會亂**(refactor 的真正動機):不是缺 region,是 render 層有四套近乎逐字重複的程式碼——

| 重複處                                                 | 證據(原始行號)                                    |
| ------------------------------------------------------ | ------------------------------------------------- |
| `_ai_usage_render` vs `_ai_usage_render_summary_block` | OVERALL+LOCAL% 區塊逐字重複(L890–908 vs L968–985) |
| `_ai_usage_print_section` 的 cloud/local 兩分支        | 同邏輯寫兩次,只差 `@OPUS$`/`@SONNET$` 兩欄        |
| `_render_rtk_pct_row` vs `_render_oasave_row`          | 開頭 6 行 jq 抽值完全一樣(L653–658 vs L691–696)   |
| 每格一支 awk(`_ai_usage_humanize` / `_ai_usage_pct`)   | render 迴圈裡 per-cell fork                       |

## 2. 目標(user 已確認)

| 面向         | 優先級   | 範圍                                             |
| ------------ | -------- | ------------------------------------------------ |
| 效能         | 同等重要 | architect 自行判斷瓶頸,**不做 daemon／背景程式** |
| 表格可讀性   | 同等重要 | 顏色＋標題＋box-drawing 三者都要                 |
| 程式碼可讀性 | 同等重要 | **保持單檔**,用區塊註解＋順序強化                |

## 3. 採用方案:A(保守整合 refactor,零外部依賴)

不引入 `gum` / `glow` 等新工具,全部在 zsh + jq + awk + sqlite3 + ANSI escape 範圍內完成。**不再用 `column -t`**(見 §4.2 渲染機制決策)。

---

## 4. Section 1 — Render 層收斂

### 4.1 檔案區塊重排與 TOC(維持單檔)

7 個明確標記的 region,順序「定義 → 資料層 → 計算層 → 呈現層 → 入口」嚴格分層:

```
#region 0  Configuration & TOC
#region 1  Schema & Constants     (sqlite DDL、price table、ANSI codes、color thresholds)
#region 2  Cache Layer            (sync, status — 本次不動)
#region 3  Aggregation Layer      (jq scripts + 格式化 def + 3-window 切窗)
#region 4  Formatting Primitives  (色碼常數、box-drawing 字元、TTY/locale 偵測)
#region 5  Render Layer           (下面 4 個單元)
#region 6  Public Commands        (list-ai-usage*)
```

採用 zsh `# #region` 慣例,與 user `CLAUDE.md` 對 `<script setup>` 的偏好對齊。

### 4.2 渲染機制決策:單一 awk 包辦對齊+上色+框(放棄 column -t)

**問題**:`column -t` 用 byte 長度算欄寬,一旦 ANSI 色碼或框線混進去就把色碼長度算進欄寬 → 整排對不齊。上色/加框**一定要在對齊完成之後**。

**驗證**:在本機 BSD awk(version 20200816)實跑 POC,確認:

- ANSI 塞在 `column -t` **之前** → 對齊爆掉(色碼被算進寬度)。
- ANSI 塞在對齊**之後** → 色碼是終端機零寬度,視覺對齊不受影響。✅

**決策(user confirm:A2)**:既然要上色就得跑一支 awk,讓**那支 awk 連對齊一起做**:自己算欄寬 → padding → 上色 → 畫框。**不需要 `column -t`**。理由:

- 所有欄位內容都是 ASCII(數字 / `$` / `%` / 日期 / model 名),`length()` == 顯示寬度,寬度計算只有約 4 行。
- awk 知道每一格是誰(直接讀 TSV),**不用回頭找字串** → lockstep 版會有的「同格值是別格子字串時上錯色」bug **從根本不存在**。
- 少一個 `column` fork,整段 `while IFS=$'\t' read -r ... printf` 機制消失。

### 4.3 收斂後的 4 個 render 單元(取代現在的 8 個)

| 新單元                             | 職責                                                                                                                                                | 取代(原函式)                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `_decorate`                        | **唯一的 awk**。吃「純文字 TSV + col-type vector(+ box title)」,輸出算寬對齊、上色、bold(TOTAL/OVERALL)、dim(`—` 與閒置日)、可選框線的成品          | 散落各處的 `humanize`/`pct`/`column -t`/上色                                                                  |
| `_render_table(spec)`              | 單一 jq 來源的表(header + rows + TOTAL)組成 TSV,丟給 `_decorate`。cloud/local 差別只在 spec 的「欄位清單」;full/totals-only 差別只在「要不要 rows」 | `_ai_usage_print_section`、`_ai_usage_print_section_totals_only`、`_ai_usage_print_rtk_section`               |
| `_render_overall_block(json, rtk)` | 多來源堆疊塊(OVERALL + LOCAL% + RTK + RTK% + OASAVE%)自己組 TSV,直接丟 `_decorate`。RTK%/OASAVE% 共用一個 `_rtk_extract_overall_vars` 抽值          | `_ai_usage_render_rtk_row`、`_ai_usage_render_rtk_pct_row`、`_ai_usage_render_oasave_row` + OVERALL/LOCAL% 列 |
| `_render_report(json, rtk, mode)`  | 編排 CLOUD → LOCAL → OVERALL → RTK。`mode=full\|summary` 只切要不要 per-day rows                                                                    | `_ai_usage_render`、`_ai_usage_render_summary_block`                                                          |

**刪除的 shell helper**:`_ai_usage_humanize`、`_ai_usage_pct`、`_ai_usage_truncate_models` 全部移進 jq(見 §5.1)。

**為什麼 stacked block 不塞進 `_render_table`**(驗證 REVIEW 4 的擔憂):因為 `_decorate` 才是真正的抽象——它吃任意 TSV 塊。`_render_table` 只是「單一 jq 來源」的糖衣。堆疊塊資料本來就是多來源、bespoke,讓它自己組 TSV 再丟 `_decorate` 即可,**不需要 router、不需要 >2 個 mode flag**。

### 4.4 col-type vector(靜態 metadata)

每張表的欄位語意是**靜態常數**(不從 jq 動態來),描述每一欄該怎麼上色。例:

```
# 平行陣列;index 對應欄位順序
cloud table:  (date  usd  tok  hitpct  savepct  text)
local table:  (date  usd  usd  usd     tok      hitpct  savepct  text)
rtk section:  (date  int  tok  savepct usd      usd     usd      usd)
```

`_decorate` 依 vector 知道「第 4 欄是 hitpct → 套 HIT% 紅黃綠」「usd 欄 → 解析 `$` 後的數值決定 dim」「text/tok 欄 → 只處理 `—` dim」。數值解析在 awk 裡就是 `gsub(/[$,%]/,"")` 後比大小,trivial。

---

## 5. Section 2 — 效能

驗證後的瓶頸排序與裁決(fork 數為靜態追蹤所得):

### 5.1 ✅ 單次 jq pass 出格式字串(最高 CP)

把 `humanize` / `fmt_pct` / `fmt_usd` 寫成 jq `def`,在 aggregation 階段直接輸出「人類可讀字串」TSV。render 層不再 per-cell fork awk。

- **效果**:`list-ai-usage-4w` 的 awk 從 **~239 次降到個位數**(只剩 `_decorate` 一支 + RTK%/OASAVE% 的小算式)。
- **強制要求(驗證 REVIEW 3 高風險項)**:所有 jq formatter **一律回傳字串**,null 回傳 `—` 字串,**永不吐 null/空字串**。否則下游若還有 `read` 會崩欄。本設計連 `read` 都拿掉(`_decorate` 直接讀 TSV),所以此 hazard **從結構上消失**,但 jq 仍須守「null → `—`」這條,讓 `—` 能被 dim。

### 5.2 ✅ rtk:4 次 sqlite3 → 1 次 CTE

`_rtk_usage_aggregate` 現在 4 次 fork(count 檢查、cloud_input_json、local_input_json、rtk daily)。合併成單一 sqlite3,用 `WITH` 一次回傳 `{cloudArr, localArr, daily}` JSON。

- **強制要求(驗證 REVIEW 3 中風險項)**:CTE 回傳的 JSON shape 必須剛好對上下游 jq 的期待(`$cloudArr` / `$localArr` / `.daily`)。implementation plan 要附 CTE 範例輸出並驗證下游 jq 不變。

### 5.3 ✅ list-ai-usage:15 次 sqlite3 → 2 次

`list-ai-usage` 現在跑 `_ai_usage_aggregate 1/7/30` + `_rtk_usage_aggregate 1/7/30` = 3 + 12 = 15 次 sqlite3。改成:**讀一次 30 天明細 → jq 同時切 1/7/30 三個視窗**。

- **off-by-one 地雷(驗證 REVIEW 3 高風險項,必寫進 plan)**:prune 用 `-30 days`(L292),但 query 用 `-(N-1) days`(L772)。三個視窗一定要各自用 `-(N-1)`:`today` / `-6d` / `-29d`(zsh 已在 L1008–1010 算好這三個日期,直接 `--arg` 餵進 jq,jq 用字串比較 `select(.date >= $cutoff)` 切窗)。用 `-30d` 會默默少算最舊一天 → 30 天 TOTAL 對不上現況。

### 5.4 ❌ 不做:JSONL mtime 預檢跳過 bunx

spec 原 §5.1 想掃 `~/.claude/projects/**/*.jsonl` mtime 來跳過 bunx。**砍掉**,理由:

- 與現有 `_ai_sync_status` 的 `ttl_expired` + `crossed_day`(L258–260)邏輯**重複**——常見的「工作階段中反覆看」場景已被 1 小時 TTL cover。
- mtime 預檢只在「TTL 過期但資料沒變」的窄縫有用,卻要遞迴掃數百個 per-conversation JSONL;且 ccusage 仍會讀全部資料,省不到 bunx 啟動成本。
- 違反 user `CLAUDE.md`「configurability invite drift」哲學。
- (附註:rtk **確實**有 `~/Library/Application Support/rtk/history.db`,REVIEW 1 說沒有是錯的;但即使有,此優化仍因重複而不做。)

### 5.5 不做的事

- ❌ daemon / 背景 server(user 明確排除)
- ❌ 換掉 `bunx`(npx --no-install、預編譯 binary 都引入新風險)
- ❌ 改 sync 層 / schema / jq 聚合數學(只加 formatter + 切窗,計算邏輯不動)

---

## 6. Section 3 — 表格視覺

### 6.1 顏色策略:只給「有好壞語意」的欄位

**資料佐證**(查 cache 30 天真實 cloud 花費):`min $0 / median $21 / max $67 / avg $25`。spec 原本「>$10 紅」會把 30 天裡 24 天全染紅,且 summary 視圖 COST 是視窗總和($7d≈$170、$30d≈$740)會永遠紅 → 純噪音。**結論:cost 是「花多少」不是「好不好」,不染評價色。**

| 欄位                        | 規則                          | 依據                                                                                    |
| --------------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| **HIT%**                    | ≥80 綠 / 50–80 黃 / <50 紅    | 低 = cache 策略壞掉(thrash),真的該警告。industry-standard 80%                           |
| **SAVE%**                   | ≥60 綠,其餘預設,**不紅**      | 原始碼 L36「Low SAVE% alone does NOT mean cache broken」——低 SAVE 常是工作內容新,不報警 |
| **RTK% / OASAVE% / LOCAL%** | 永遠綠                        | 代表省下的錢,無「壞」的情境                                                             |
| **COST**                    | 不依金額上色;`<$2` 閒置日 dim | 跨視圖一致;閒置日淡出                                                                   |
| **`—`**                     | 一律 dim                      | 讓真實數據視覺突出                                                                      |
| **TOTAL / OVERALL 列**      | bold                          | 結構強調,不靠顏色                                                                       |

色碼集中在 region 1:`_AI_C_RESET`/`_AI_C_BOLD`/`_AI_C_DIM`/`_AI_C_RED`/`_AI_C_YEL`/`_AI_C_GRN`。閾值也常數化在 region 1(不設 env var,符合 user 反 drift 哲學)。

### 6.2 顏色 / 框線開關

- **走彩色+UTF-8 框** 的條件:`locale charmap == UTF-8` 且 `[[ -t 1 ]]`(是 TTY)且 無 `NO_COLOR`。
- 否則退回 **ASCII `+-|` 純文字、無色**。
- `AI_USAGE_PLAIN=1` 一個逃生口強制純文字(SSH/mojibake/pager 場景)。honor 標準 `NO_COLOR`。
- (本機 `LANG=C.UTF-8`、charmap UTF-8,正常走彩色框。)

### 6.3 Box-drawing 框線

```
┌─ CLOUD (Anthropic) ──────────────────────────────────┐
│ DATE        COST    TOKENS    HIT%    SAVE%   MODELS  │
│ (— = no data · HIT% cache reuse · SAVE% input cached) │   ← dim legend
├──────────────────────────────────────────────────────┤
│ 2026-05-29  $12.34  1.23M     85.2%   62.1%   ...     │
├──────────────────────────────────────────────────────┤
│ TOTAL       $...    ...                               │   ← bold
└──────────────────────────────────────────────────────┘
```

- UTF-8:`┌─┬─┐ │ ├─┼─┤ └─┴─┘`;fallback ASCII:`+-+ | +-+ +-+`。
- 框寬 = `_decorate` 算出的對齊後行寬(用上色**前**的純文字長度,色碼零寬不計入)。
- 框由 `_decorate` 在 padding 後統一加,與上色同一 pass。

### 6.4 欄位命名與 legend

- **`@OPUS$` / `@SONNET$` 保留**(user confirm),不改名。意義「若重新按 opus/sonnet 計價會是多少」由每張表標題下的 dim **legend 行**解釋。
- legend 草稿:
  - CLOUD/LOCAL:`(— = no data · HIT% = cache reuse · SAVE% = input from cache · @OPUS$/@SONNET$ = if repriced)`
  - RTK SAVINGS:`(real $ saved, broken down by model tier)`
- `—` / `NA` / `null` 統一輸出 `—`(現在三者混用,jq formatter 收斂)。

### 6.5 區段與間距

- 大區段標題(TODAY / LAST 7 DAYS / LAST 30 DAYS)改反白單行:`\e[7m === LAST 30 DAYS === \e[0m`。
- 每張 box 之間留一空行。

---

## 7. 驗證記錄(對抗式 workflow,2026-05-29)

5 個獨立 lens reviewer 讀真實原始碼 + 本機 POC,1 個 critic 交叉比對。

**確認(confirmed)**:

- per-cell awk fork 爆炸真實存在(~239 → 個位數,確認)。
- sqlite CTE 合併、15→2 sqlite、jq 切三窗,皆確認可行且為真 win。
- BSD awk 20200816 支援 `index()`/`substr()`/`printf`/多 `-v`;**不支援** `gensub`/`FIELDWIDTHS`(設計已避開)。
- ANSI 塞在對齊**之後**不破壞視覺對齊(POC 實證)。
- UTF-8 框線在本機正常渲染。
- HIT%/SAVE%/RTK% 顏色語意與原始碼 L21–47 註解一致。

**被驗證打掉 / 修正的設計假設**:

- ❌ JSONL mtime 預檢(redundant)→ 砍掉(§5.4)。
- ❌ cost「>$10 紅」(real data median $21)→ 改成不依金額上色(§6.1)。
- ⚠️ window off-by-one 必須保留 `-(N-1)`(§5.3)。
- ⚠️ jq formatter 必須一律回傳字串(§5.1)。
- ⚠️ stacked block 不塞進 `_render_table`(§4.3)。

**reviewer 矛盾的裁決**:REVIEW 1/4 說「ANSI 破壞對齊」是測錯了(他們測 column -t **之前**);REVIEW 2 的 POC 測對齊**之後**,證明可行。最終採 A2(連 column -t 都不用),爭議消失。

---

## 8. 決策記錄(user 拍板)

| 決策                | 選擇                                                     |
| ------------------- | -------------------------------------------------------- |
| 渲染機制            | **A2**:單一 awk 包辦對齊+上色+框,放棄 `column -t`        |
| 三目標優先級        | 全部同等重要,整體 refactor                               |
| 效能痛點            | architect 判斷;**no daemon**                             |
| 表格可讀性          | 顏色 + 標題 + 框線三者都要                               |
| 檔案結構            | 保持單檔,加強區塊註解與順序                              |
| 方案選擇            | A(保守整合,零外部依賴)                                   |
| COST 上色           | 不依金額上色,只 dim 閒置日                               |
| HIT%/SAVE%          | HIT% 紅黃綠三段;SAVE% 只綠不紅                           |
| `@OPUS$`/`@SONNET$` | 保留,靠 legend 行解釋                                    |
| box fallback        | locale+TTY+NO_COLOR 自動偵測 + `AI_USAGE_PLAIN=1` 逃生口 |

---

## 9. 帶進實作期的風險(writing-plans 要處理)

1. **off-by-one**:三窗 cutoff 各用 `-(N-1)d`,plan 附「合併 query vs 現況 query 三窗結果逐一比對」測試。
2. **jq null → `—` 字串**:plan 附 `def fmt_pct`/`fmt_usd`/`humanize` 的 null coalescing 範例。
3. **rtk CTE shape**:plan 附 CTE 範例輸出 + 下游 jq 不變的驗證。
4. **`_decorate` 正確性**:plan 附「含重複數值的列」測例,確認算寬/上色/畫框正確;確認 bold/dim 偵測(以第一欄是否 TOTAL/OVERALL、cell 是否 `—`)。
5. **視覺驗證**:plan 完成後實跑 `list-ai-usage` / `-2w` / `-4w`,肉眼確認對齊+色+框,並與 refactor 前的數字逐欄比對(數字零變動是硬要求)。

## 10. 不在範圍內

- 換掉 sqlite / jq / awk;`column -t` 本次直接移除
- daemon / 常駐程式
- 新增 brew 相依(`gum`、`glow`、`bat` 等)
- 改 rtk 或 ccusage 本身
- 改 sync 層、schema、jq 聚合數學
