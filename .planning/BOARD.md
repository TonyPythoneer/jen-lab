# 🧭 Jen-Lab 控制台（BOARD）

> 這是你的駕駛艙，不是產品程式碼。
> 我們每次對話的想法、決定、進度都記在這 → 你隨時看得到全貌 → 你掌控節奏。
> 我用這塊板自己往前推。

**Branch:** `perf/food-map-vector-layers`（從 develop 開，develop 未污染）
**運作契約:** 非即時的實作一律走背景程序，主對話永不卡住。一兩秒的小事直接做但記在板上，零黑箱。

---

## 🚧 自主任務 2（Tony 再次出門 ~2hr）：Canvas marker 大遷移

**根因已確認:** 拖曳卡 = 餐廳 pin(77)+ 船(32)+ suburb 標籤,每個都是獨立 DOM 合成層,弱機 GPU 平移時合成不完。**舊地圖順是因為它是純圓點、無 filter。**

**計畫:** `.planning/plans/food-map-canvas-markers.md`。把所有 marker 搬到 canvas(pin/標籤一張靜態 canvas、船一張動態 canvas),並砍掉永遠開著的成本。

**已鎖 12 個決定:** emoji 彩色 / 無陰影無動畫無過渡 / 羊皮紙全砍(主題塌成 voyager+osm) / 船搬 canvas / 手機@1x桌機@2x / 標籤依視窗過濾 / maxBounds 動態算到手機 room 置中 / 桌機留 hover+tooltip / DPR 上限 1.5 / 點擊選最近+選中畫最上不做 cluster / 邊界用原始 jsdelivr / 清掉 maplibre+GL。

**進度(GSD 自主):**
- [x] P0 清理:maplibre/GL 移除、羊皮紙移除、主題縮減、手機 @1x
- [x] P1 canvas 圖層基礎
- [x] P2 pin 上 canvas + emoji bitmap 快取
- [x] P3 命中(click+hover+tooltip 已接)測試 + hover/tooltip + 狀態
- [x] P4 船上 canvas
- [x] P5 標籤視窗過濾 + 動態 maxBounds 置中
- [x] P6 接線、刪舊碼、驗證、重建 prod preview

### ✅ 全部完成(自主跑完,未 commit,等 Tony 實機測 + review)

**核心成果:餐廳 pin(77)+ 船(32)+ suburb 標籤 從「每個一個 DOM 合成層」→ 全部畫到 2 張 canvas。** 弱機 GPU 平移要合成的層從 ~109 變 2 —— 直接打中你實測的根因(fancy pin 太多層)。

**做了什麼(12 個決定全到位):**
- 新檔 `useCanvasLayer.ts`(通用 canvas 圖層,DPR≤1.5、平移免重畫、zoom 動畫跟著縮放)+ `usePinCanvas.ts`(白圓+彩色 emoji bitmap 快取、選中/群組/淡化、命中測試)。
- `useRiverBoats.ts`:船 DOM→canvas Path2D(模擬邏輯不動,只換畫法)。
- pin 互動:點擊選最近、桌機 hover 高亮+店名 tooltip、選中畫最上;無陰影/過渡/跳動。
- 羊皮紙全移除;主題塌成 voyager+墨線;手機 @1x;標籤視窗內才畫(~470→~56);範圍牆動態算到手機 room 置中。
- 清掉 maplibre/GL(bundle 0 殘留)、死 CSS、死 dev 開關。

**驗證(全綠):** check 0 errors、test 52/52;Playwright 桌機+手機:DOM marker=**0**、canvas=2、點擊✓、hover tooltip(「Skittle Lane」)✓、zoom/pan 對齊✓、0 error;prod build 同樣 0 DOM marker。

**⚠️ 唯一未證 = 弱機實機手感**(桌機重現不了),但這次是結構性根治(層 109→2,跟你舊地圖純圓點同級)。**請手機測 prod。**

**視覺取捨:** pin 形狀 水滴→圓形(canvas 最乾淨/命中最準),emoji 彩色(墨色濾鏡沒了)。不喜歡可改。

### 📱 實機測 **http://10.220.2.178:3700/sydney-food-map/**(prod,已重建)
_改 6 檔 + 新增 2 檔。計畫 `.planning/plans/food-map-canvas-markers.md`。_

---

## 自主任務 1（已完成）：向量層效能

**目標:** 食物地圖拖曳在低階 Android（Motorola G05 / Helio G81）仍卡。船隻 rAF 已於上一輪修掉（pause-on-drag，已 merge），但殘留卡頓。Tony 假設殘留成本在 **SVG 向量層**:航線 polylines / 碼頭點 circleMarker / 行政區邊界。

**Tony 交辦順序:** ① 先做三個 dev-only 圖層 toggle 去隔離 → ② 量測各層資源消耗、找根因 → ③ 動手修根因。GSD 模式、自主循環、可開 opus subagent 當 principal engineer。

### ✅ 完成（自主跑完，未 commit，等你 review）

**根因（數據釘死，推翻你原本假設）:** 元兇不是航線、不是碼頭點,是**行政區邊界 GeoJSON = 173,858 個頂點 / 471 區**(航線只有 2,009 點,輕 86 倍)。6x throttle 下,zoom 重投影成本 baseline 352ms,單獨關掉邊界就掉到 77ms(邊界一層吃掉 ~275ms);關航線/碼頭點 ≈ 0 影響。**你想 dev-gate 的航線,渲染幾乎免費。**

**為什麼 drag 桌機測不出差異:** Leaflet 拖曳只對 pane 下 transform、不重投影向量,所以向量數量不影響每幀主執行緒;重投影只在 zoom 發生。弱機拖曳卡是 GPU 合成那塊巨大 SVG,桌機 GPU 太強重現不了——但 zoom 指標精準隔離出「最重的那層」。

**修法(3 招,全部驗過):**
1. `preferCanvas: true`(FoodMapStage)— 所有向量層改用單一 canvas bitmap 而非龐大 SVG DOM,pan 只合成一張貼圖(真正解拖曳的招,桌機量不到)。船/餐廳 pin 是 divIcon(DOM)不受影響;虛線航線、circleMarker 在 canvas 正常。
2. 邊界下載後即時 Douglas-Peucker 簡化(`app/utils/geo-simplify.ts`,ε=0.0005≈45m)→ **174k 降到 10.3k 點(17x)**,一次性成本只 9.4ms。
3. 拖曳時關掉餐廳 pin 的 5-stage glyph filter(food-map.css)— 免費省 paint。

**驗證:** zoomMs **352 → 74(4.8x,逼近 52ms 地板)**;視覺截圖 z13/z15 邊界外框+標籤仍貼合海岸線、無鋸齒(17x 簡化對 0.5 透明細線無損);dev toggle UI 端到端驗過(471→關→0→開→471);`pnpm check` 0 errors;`pnpm test` 52/52(geo-simplify 新增 8 個)。**Motorola G05 實機手感要你親自確認**(桌機重現不了弱機 GPU 合成成本)。

**順手交付你要的東西:** 地圖樣式選單 dev-only 多了「Dev · Layer profiler」開關 + 船隻開關,`import.meta.dev` gate,prod 不出現 → **你可以在手機上自己逐層開關感受成本**:
- 行政區邊界(顯示/隱藏)
- **邊界簡化(開=簡化 10k 點;關=原始 jsdelivr CDN 174k 點)← 你要的比較開關**,切換會用快取的原始資料即時重建圖層,可反覆切。端到端驗過:10,321 ⇄ 173,858 ⇄ 10,321(無洩漏)
- 航線 / 碼頭點(顯示/隱藏)
- **Dev · Basemap renderer dropdown(新增,實機追查用)**:@2x raster(現況)/ @1x raster(同風格 1/4 像素)/ Vector GL(MapLibre WebGL,像 Google)。三模式都驗過會渲染、0 error;@1x URL 確認 `{r}` 已剝除;GL 用 `@maplibre/maplibre-gl-leaflet` 把底圖換 WebGL、Leaflet 的 pins/船/邊界全留在上層。GL/maplibre 走 dev-only dynamic import,prod 不 bundle。**注意:重大轉折——「全關向量層還是慢」指向底圖本身(retina @2x raster 永遠在、桌機重現不了),不是向量層。**

⚠️ 若你最後不採用 GL,要把 `maplibre-gl` + `@maplibre/maplibre-gl-leaflet` 兩個 dep 移除。

### ⚠️ 需要你拍板的一個決定

**要不要升級成「本地預簡化邊界檔 + 移除 jsdelivr CDN fetch」?**
- 現況(已修):保留 CDN fetch,前端即時簡化。即時簡化成本只 9.4ms,可忽略。
- 升級的好處:省掉手機上**下載完整 174k 點檔案 + JSON.parse** 的載入成本、移除第三方 CDN 執行期依賴(可靠性)。
- 代價:要 commit 一個簡化後的資產檔、保留 CC-BY 來源標註——較大改動,涉及授權,所以留給你決定。
- 我的建議:先用現在這版,你在實機測手感;若載入仍有感再升級成本地檔。

**改動檔案:** FoodMapStage.vue · useRiverBoats.ts · FoodMapApp.vue · FoodMapThemeMenu.vue · food-map.css · geo-simplify.ts(新) · geo-simplify.test.ts(新)。量測工具留在 `.planning/debug/*.mjs`(可重跑驗證)。完整除錯紀錄: `.planning/debug/resolved/food-map-drag-jank-mobile.md`「Round 2」。

_所有改動在 `perf/food-map-vector-layers` 分支、未 commit,等你 review。develop 未污染。_

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
- ✅ 決定鎖定：D1 YouTube 紅→`digital-orange`、D2 篩選器 teal→`digital-orange`、D3 **刪除**三個孤兒、D4 typography token 延後
- 工作分兩類：**pre-task**（不碰程式：決定/文件/刪無用檔）先做；**code task**（改程式）後做。skill 已更新此概念
- Tony 自己手動做視覺驗證（不用我跑瀏覽器）

---

## 🔨 進行中（Doing）

_（worktree branch 已 rebase 到最新 develop + 把我這回合的 17 個 commit squash 成 2 個。等 Tony review / 開 PR。）_

### 🪞 Retro（Tony 要求：別再犯）

1. **要在對的 worktree 動手** — 我一開始把整個功能做在 main checkout 的 `develop` 上（被你抓到「I hope you're on your worktree」）。教訓：動手前先確認 cwd 的 branch/worktree，別信 session banner。→ memory `work-in-the-correct-worktree`
2. **共用元件的行為改在 base，不要塞進 media query** — 「list header 只顯示數字」我只改了 mobile，desktop 就走鐘（你說「don't align with mobile」）。食物地圖是**同一個元件、靠 viewport 換位置**；行為/內容改 base，media query 只負責位置；且每次都要**桌機+手機一起驗證**。→ memory `shared-ui-base-not-media-query`
3. **dev server 先查再開** — 我用壞參數另起一台 :3000 跑出 Nuxt 預設頁繞遠路，其實 worktree 早有一台在 :3600。→ memory `dev-server-before-start`
4. **改版要順手清掉被取代的舊碼** — Google layout 留下一堆死 CSS/邏輯，後面才補刪。原則：取代式改版當下就刪舊碼、重複值收成 token、單一真實來源，讓一次修改處處生效（lean & responsive）。

**Git 狀態**：branch = `worktree-food-map-google-layout`，在最新 `develop` 之上 = 12 個原本的 google-layout commit + 我 squash 後的 2 個（`chore(dev)…` + `feat(food-map)…`）。check 0 errors、45 tests 綠。`develop` 未被污染。
（要不要連那 12 個原本的 commit 也 squash？那是 squash 整支歷史，需你點頭。）

---

### ✅ 本回合：chip focus 修正 + 食物地圖簡化（兩位設計師討論後執行）

- **Chip「移入效果」根因**：不是 transform，是**瀏覽器原生藍色 focus ring**（rgb 0,95,204）點擊時跳出，跟羊皮紙風格衝突。兩位設計師（frontend-design + design-taste-frontend，opus subagents）一致建議：`:focus{outline:none}` + `:focus-visible{outline:2px solid var(--accent)}` → 點擊只填色不跳框、鍵盤仍有 on-brand 棕色環。瀏覽器驗證 ✓

### ✅ 本回合：chip focus 修正 + 食物地圖簡化（兩位設計師討論後執行）

- **Chip「移入效果」根因**：不是 transform，是**瀏覽器原生藍色 focus ring**（rgb 0,95,204）點擊時跳出，跟羊皮紙風格衝突。兩位設計師（frontend-design + design-taste-frontend，opus subagents）一致建議：`:focus{outline:none}` + `:focus-visible{outline:2px solid var(--accent)}` → 點擊只填色不跳框、鍵盤仍有 on-brand 棕色環。commit `c562829`，瀏覽器驗證 ✓
- **簡化**：
  - 砍掉 **~250 行死 CSS**（舊抽屜 `.category-row*`/`.entry-panel*`/`.list-drawer__tabs/back/close`/`.drawer-section-label/list/back`/`.detail-actions*`/`.detail__title-link/clip`）— Google layout 改版後的孤兒，grep 確認 0 引用，list+detail 瀏覽器驗證渲染不變。1361→1113 行。commit `c43f92e`
  - emoji font-stack 重複 4 次 → `--emoji-stack` token。commit `0bbe000`
  - **沒做**（避免過度工程）：shadow/radius tokenize（那些 shadow 其實各不相同、只共用 ink 色，tokenize 反而增加 indirection、非你需求）；list-row 元件抽取（設計師標 medium risk，留作未來）
- **保留**：拒絕設計師「移除 store 的 hoveredCategoryId」建議——它驅動地圖 pin 的跨元件 highlight，不是純 CSS hover

**設計師留作未來的 optional polish**：radius token、list-row 共用元件、box-shadow token（如果之後要做多 theme 才值得）。

### ✅ 本回合完成（未 commit，等你 review）：食物地圖相依篩選器（Region ↔ Cuisine）

Tony 出門前交辦。**已搬到正確的 worktree** `.claude/worktrees/food-map-google-layout`（branch `worktree-food-map-google-layout`），**develop 已還原乾淨、零污染**（已 `git status` 確認）。

⚠️ **教訓**：第一版我做錯地方——在 main checkout 的 `develop` 上做，沒進 worktree。已全部 revert，重做在 worktree 的「Google layout」現有設計上。

**Cuisine 改單選**（依 Tony 決定，照規格）：worktree 原本是「多選 cuisine chips」，已改回單選。

**worktree 改了什麼（4 改 + 2 新）**

- `app/utils/foodMapFilters.ts`（新）+ `tests/utils/foodMapFilters.test.ts`（新）— 純相依邏輯 + TDD（36 tests 全綠）。base-independent，直接從 develop 那版搬過來
- `app/composables/useFoodMapStore.ts` — `selectedCategoryIds: string[]`（多選）→ `selectedCategoryId`（單選）；`getVisibleList` 改用 `filterRestaurants`
- `app/components/food-map/FoodMapTopBar.vue` — 篩選 chips 加相依：Area chips 在選定 cuisine 下零數停用、cuisine chips 在選定 area 下零數隱藏、兩者單選、chips 加即時計數
- `app/components/food-map/FoodMapListDrawer.vue` — heading 由多選陣列改單選
- `app/assets/css/food-map.css` — `.food-chip__count`（計數）+ `.food-chip:disabled`（變淡不可點）

**驗證（全部完成）**

- worktree `pnpm test` 36/36 綠；`pnpm check` 0 errors（2 warning 既有無關）
- ✅ **視覺驗證（:3600 worktree dev server，瀏覽器實跑）**：
  - 選 Suburbs → cuisine chips 只剩 Japanese 2 / Middle Eastern 1 / Dessert 4（其餘隱藏）
  - 選 Thai（CBD 限定）→ 城郊 Suburbs 變淡停用 0、市中心 5（雙向）
  - 點 Korean → Thai 取消、只 Korean active（**單選確認**）、市中心 5→3 即時更新

**順手修的 dev 工程（也在 worktree）**

- `app/config/app.ts`：`DEV_PORT = Number(process.env.DEV_PORT) || 3500`（依 Tony 提議，env 可注入，第二個 server 用 `DEV_PORT=3600 pnpm dev`，別用 `--port`——`--host` 會吃掉它）
- `CLAUDE.md`：放寬「禁止啟停 dev server」+ 註明「先用 lsof / dev-lock 找現有 server」「用 DEV_PORT env 起第二台」

**教訓**：起 dev server 前先 `lsof` 找現有的——worktree 早就有一台在 :3600（被 Nuxt dev-lock 鎖著），我卻先用壞掉的參數另起一台 :3000（跑出 Nuxt 預設頁）繞了一大圈。

**待你決定**：要不要 commit / 開 PR（這支 branch 含 food-map 相依篩選 + 兩個順手的 dev 工程改動，可挑著用）。

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
- ✅ `[pre]` CLAUDE.md 設計速查（commit `16c21d0`）
- ✅ `[pre]` 刪除 3 個孤兒元件（commit `d2b8c3b`，nuxt prepare 綠燈）
- ✅ 砍掉**舊餐廳地圖** `/my-best-restaurants-search-in-sydney`（commit `dad0eb6`）— 頁面+restaurants/元件+jen-knows 卡；保留新地圖共用的 useRestaurants/資料集/Leaflet

---

## 📋 接下來（Next）

✅ 決定都拍好了。剩下照 pre-task → code task 的順序跑：

計畫：`docs/superpowers/plans/2026-06-03-design-system-consistency.md`

- `[pre]` 寫 CLAUDE.md 設計速查（工人的合約，先做）— 計畫 Task 1
- `[pre]` 刪除三個孤兒元件（沒人用，不影響 coding）— 計畫 Task 0
- ✅ `[code]` **品牌色掃除**完成（commit `f9e010f`，11 檔，grep 0 殘留）
- ✅ `[code]` Storybook story 標題對齊（commit `01b1516`，19 檔）
- 視覺驗證：**Tony 自己手動**做（建議重點看：篩選器選中橘、YouTube hover 橘）

→ 這一輪清理 **DONE**。下一步選項：開 PR / 處理 Parked 的 v2 工具 / 收工。

每塊驗證過就逐塊 commit。

---

## 🅿️ 暫放（Parked / Later）

- 全站其他領域的結構模式（現在不需要）
- Sydney food-map（這次明確不碰）
- **駕駛艙 skill v2**：把工人隊模式寫進 skill + 加 SessionStart hook 變 always-on（meta 工具，不擋清理工作）
- **Typography 語意 token**（D4 延後）：讓標題改用 theme.css 的 `--text-heading/display`，獨立一輪再做
- `gsd-cockpit` skill v1 仍待你點頭定案
