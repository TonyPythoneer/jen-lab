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

_（目前沒有背景任務）_

---

## ✅ 已完成（Done）

- `PostCard.vue` 品牌對齊
- `PostCardSkeleton.vue` 品牌對齊
- `SectionNewsletter / Support / Directions` 標題 leading 統一
- `nuxt.config.ts` 加入 `componentSettings`（保住元件名字，搬檔不破壞）
- `gsd-cockpit` skill v1 草稿（`~/.claude/skills/gsd-cockpit/SKILL.md`）— 待你點頭
- ✅ **整理 home/ 完成**：22 個檔歸位（sections/art/motion/parts/\_unused）+ `components:dirs` hook 保住扁平名字，驗證 0 phantom、template 零改動

---

## 📋 接下來（Next）

1. 🎯 設計 + 建「駕駛艙」skill（GSD 之上的工作模式驅動器）— v1 純 skill
2. 用 skill 驅動：把 `home/` 檔案搬進 `sections/art/motion/parts/_unused`（含 stories）→ 背景
3. 驗證 dev server 在新 config 下元件都解析得到
4. CLAUDE.md 寫入 Design System Quick Reference
5. webwright 視覺驗證所有樣式改動
6. （v2）加 SessionStart hook 讓 skill always-on

---

## 🅿️ 暫放（Parked / Later）

- 全站其他領域的結構模式（現在不需要）
- Sydney food-map（這次明確不碰）
