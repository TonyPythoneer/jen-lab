# 🧭 Jen-Lab 控制台（BOARD）

> 這是你的駕駛艙，不是產品程式碼。
> 我們每次對話的想法、決定、進度都記在這 → 你隨時看得到全貌 → 你掌控節奏。
> 我用這塊板自己往前推。

**Branch:** `refactor/design-system-cleanup`
**運作契約:** 非即時的實作一律走背景程序，主對話永不卡住。一兩秒的小事直接做但記在板上，零黑箱。

---

## 💭 你的點子收集箱（Inbox）

_你丟，我接。還沒分類的想法都先放這。_

- [06-03] 「心理醫生」工作模式：邊聊邊記、收集想法 → 正在變成一個 skill
- [06-03] 正式實作前一律走 background / fork，主對話永不卡住
- [06-03] 這塊板 = agile board，用來驅動前進
- [06-03] ⭐ 駕駛艙 skill 要把 GSD 術語（phase/roadmap…）翻成白話 → 使用者永遠不用學術語，只管聊
- [06-03] ⭐ 模式進化：`你 ↔ 我(翻譯+指揮) ↔ 背景工人隊`，全程 async。大且可平行的工作才派整隊（先給看計畫）；小事就背景單條指令。crew 大小要配合工作量，不為一行指令召喚艦隊

---

## 🔒 已決定（Decided）

- Dark mode 全站禁用（light-mode only）
- PostCard / Skeleton → 品牌 token
- Section 標題 typography → `leading-0.94`、`tracking-0.02em`、不用 `font-bold`
- `home/` → 按身份分子資料夾：`sections / art / motion / parts`（方案 A）
- 只重組 `home/`，其他領域已夠清楚（避免過度工程）
- CLAUDE.md 要加「Design System Quick Reference」
- 工作模式：心理醫生式陪聊 + 控制台 + background-first 實作
- 孤兒元件（ContentBody / SectionNewProduct / Toc）→ 集中到 `home/_unused/`（方案 B）
- 把這套模式做成 **GSD 之上的 skill**：v1 純 skill → v2 再加 SessionStart hook 變 always-on
- 吃狗糧：skill 建好後，第一個任務就是用它驅動「home/ 重組」收尾
- 確認節奏：每做完一塊就停 → 回控制台等你點頭，再做下一塊（方案 1）
- 每個「驗證過、沒壞」的改動就 commit 一次（原子 commit，方便你回溯）— 絕不 commit 壞掉的狀態

---

## 🔨 進行中（Doing）

- 🧠 **規劃模式（你外出 3 小時）**：產出計畫 + 規格中。**此期間不做正式實作。**
  - ✅ 盤點完成：非品牌色散在 13 檔（多為機械替換）、圓角 2 檔、dark 殘留 0
  - ✅ 設計文件：`docs/superpowers/specs/2026-06-03-design-system-consistency-design.md`
  - ✅ 實作計畫：`docs/superpowers/plans/2026-06-03-design-system-consistency.md`（逐檔改動 + 工人隊腳本）
  - ✅ **規劃全部完成 — 等你回來拍 3 個小決定（見下方 Next）**

---

## ✅ 已完成（Done）

- `PostCard.vue` 品牌對齊
- `PostCardSkeleton.vue` 品牌對齊
- `SectionNewsletter / Support / Directions` 標題 leading 統一
- `nuxt.config.ts` 加入 `componentSettings`（保住元件名字，搬檔不破壞）
- `gsd-cockpit` skill v1 草稿（`~/.claude/skills/gsd-cockpit/SKILL.md`）— 待你點頭
- ✅ **整理 home/ 完成**：22 個檔歸位（sections/art/motion/parts/\_unused）+ `components:dirs` hook 保住扁平名字，驗證 0 phantom、template 零改動
- ✅ 三個 commit 落地（樣式 / 重組 / 控制台）
- ✅ **視覺驗證**：/blogs + 首頁瀏覽器確認沒壞（你親自看過）
- ✅ 設計文件 + 實作計畫已寫好並 commit（規劃模式產出）

---

## 📋 接下來（Next）

**▶ 你回來第一步：拍 3 個小決定（其餘全部備好了）**

計畫：`docs/superpowers/plans/2026-06-03-design-system-consistency.md`
規格：`docs/superpowers/specs/2026-06-03-design-system-consistency-design.md`

1. **拍板 D1 / D2 / D3**（計畫開頭的 Decision gate，都有我的預設建議）
   - D1：YouTube 播放鍵紅色 →（預設）改 `digital-orange`
   - D2：篩選器「選中」的 teal →（預設）改 `digital-orange`
   - D3：三個孤兒元件（ContentBody / SectionNewProduct / Toc）→（預設）刪除
2. **CLAUDE.md 寫入設計速查**（計畫 Task 1，先做＝工人的合約）
3. **品牌色掃除**：11–13 檔機械替換（計畫 Task 3；工人隊腳本在 Appendix A，一聲令下就放）
4. **Storybook 標題對齊**新資料夾（計畫 Task 4）
5. 全部完成 → 瀏覽器視覺驗證 + 逐塊 commit

---

## 🅿️ 暫放（Parked / Later）

- 全站其他領域的結構模式（現在不需要）
- Sydney food-map（這次明確不碰）
- **駕駛艙 skill v2**：把工人隊模式寫進 skill + 加 SessionStart hook 變 always-on（meta 工具，不擋清理工作）
- **Typography 語意 token**（D4 延後）：讓標題改用 theme.css 的 `--text-heading/display`，獨立一輪再做
- `gsd-cockpit` skill v1 仍待你點頭定案
