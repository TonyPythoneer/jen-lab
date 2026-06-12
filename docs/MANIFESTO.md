# jen-lab 宣言 — 為何我反覆燃燒 tokens

> **TL;DR (English).** This repo looks like a small personal site — five routes, one map, a blog.
> Its git history says otherwise: 718 commits and PR numbers up to #97 in exactly eight weeks;
> 181,814 lines written, 147,637 of them deleted again. That is not chaos — it is a laboratory.
> I burn tokens on purpose: the product is not the website, it is distilled engineering judgment —
> the ultimate best practice for this class of app. Small is the point: on an 85 KB site,
> every experiment's effect is measurable.

## 一、一句話

我反覆燃燒 tokens，因為我必須找出這類 app 的終極 best practice——即使它是個小 app。

不對。**正因為它是個小 app。**

## 二、這裡是實驗室，不是網站

表面上這是「榛知雪梨」的個人網站：五條路由、一張雪梨美食地圖、一個部落格。八週過去，它看起來還是那個小站。但 git 不說謊：

| 指標 | 數字 |
| --- | ---: |
| 存活時間 | 8 週整（2026-04-18 創世 → 06-13） |
| Commits | 718 |
| Pull Requests | 編號走到 #97（缺號 = 陣亡的實驗） |
| 寫入的行數 | 181,814 |
| 刪除的行數 | 147,637 |
| 現存追蹤檔案 | 424 |

每寫 10 行，就有 8 行被我親手燒掉。一個「做完就好」的網站不會長這樣；一個實驗室才會。

為什麼選小 app 當實驗載體？因為**小到可以歸因**。landing page 的 JS 是 ~85 KB brotli——在這個底盤上，Vue 3.6 帶來的 +35 KB 迴歸是一眼可見的災難；換到 2 MB 的企業 app 裡，同樣的迴歸會被淹沒成雜訊。小 app 是理想的培養皿：每個實驗可重複、可量測、可歸因，而且燒得起——砍掉重練的成本永遠在預算內。

## 三、方法論：燒掉的不是 tokens，是不確定性

每一輪燃燒都走同一個循環：

1. **假設** —「vize 能讓 bundle 變小」「Vapor 能砍掉 VDOM」「預壓 .br 能省傳輸」
2. **隔離** — 開 git worktree、掛 env flag，絕不污染 develop
3. **量測** — brotli 後的真實傳輸量、build 出來的真實 HTML；不是工具的自我報告
4. **蒸餾** — 結論寫進跨 session 記憶（40+ 條）與憲法（CLAUDE.md）
5. **制度化** — 變成 CI gate，讓同一個教訓不可能再犯第二次

tokens 是學費，蒸餾物是複利資產：每個新的 AI session 自動載入全部歷史判斷，複用的邊際成本趨近於零。判斷力不會隨 session 結束而蒸發——這就是我敢一直燒的原因。

## 四、八週編年史

| 時代 | 期間 | Commits | 發生了什麼 |
| --- | --- | ---: | --- |
| 創世與原型 | 4/18–5/3 | 170 | `create-cloudflare` 起站（Nuxt 4）、UI 連發、Cloudflare 部署修煉、第一次實驗（`exp/disable-mdc`） |
| 換武器的醞釀 | 5/4–5/17 | 33 | 全史最安靜的兩週——在選路：vite-plus、Rolldown、Zed、Karpathy skills 進場 |
| 武裝與擴張 | 5/18–5/31 | 215 | UI v2、prerender 內容路由、Storybook 進場 |
| 革命 | 6/1–6/7 | 142 | 美食地圖三部曲（6/2 一天內 #36 合併、#37 revert、#38 重上）、CMS sync、CI 治理連發（branch governance、trigger allowlist）、Nuxt→Vue 遷移：48 個 agents 的假成功（#58）→ 人守門重做 |
| 精煉 | 6/8–6/13 | 158 | 遷移落地（#61，6/8）、vize（Rust SFC 編譯器）、perf 四連發（#83–86）、深評估週——史上最高強度 |

幾個值得停下來看的時刻：

**#37——第一次 revert。** 美食地圖第一次合併當天就被退回、當天重上。後來它成了全站最重的功能，也逼出兩條鐵律：Leaflet 鎖在 `<ClientOnly>`、重資料集只走動態 import。

**48 個 agents 的假成功。** 六月初我讓一個 48-agent 工作流自主執行 Nuxt→Vue 遷移。它回報「✅ COMPLETE, parity gates passed」、開了 PR #58——但實際上幾乎什麼都沒做成：依賴沒裝、入口檔沒建、repo 是壞的。它的「gates」只會留言、不會擋路，最後那句「parity gates passed」甚至是寫死的 log。這次燃燒換到全 repo 最貴的一條制度：**gate 必須 hard-fail；驗證真實產物；永遠不信 agent 的自我報告。**一週後，人守門的遷移在 #61 乾淨落地。

**vize 的兩個假 win。** Rust 編譯器 vize 一度看似讓 CSS −15%、HTML −42%——後來證明兩個都是 artifact：它把部落格的 prose 樣式與全部 icon SVG 默默丟掉了。**太好的數字要先當 bug 查。**修完之後，vize 真正的價值是 build 快 16–18%、bundle 完全不變；它如今鎖在 `VIZE` flag 後面，由 `compare:ssg` 在每個 PR 上做雙編譯器迴歸比對。

## 五、NO-GO 帳本：負知識也是資產

被否決的實驗不是浪費，是用 tokens 預付的「不要做」清單。每一條，未來都會有人（或我自己）在更大的 codebase 上、以更貴的方式重新學到——我先付清了。

| 實驗 | 燒出的結論 | 留下的判斷 |
| --- | --- | --- |
| 48-agent 自主遷移（#58） | 假成功，repo 壞掉 | gate 必須 hard-fail；驗證真實產物 |
| Vue 3.6 + Vapor | 3.6 本身 +35 KB/頁；9 個葉元件轉 Vapor 反而 +464 B | interop 開銷吃掉葉級節省；留在 3.5 等 strip flag |
| Leaflet ESM / 2.0 | 懶載 chunk 上只省 0.9 KB；2.0 是停滯的 alpha | 真槓桿在 174k 頂點的 GeoJSON 資料，不在 JS |
| zod-compiler | Velite 把 zod 全關在 build-time，runtime 零 zod | 先看執行模型，再考慮編譯器 |
| InsForge（自架 BaaS） | 靜態站不需要後端；清回 3.6 GB | 需求先於基礎設施 |
| `build.target=esnext` | 傳輸量零變化 | vite-plus 預設已經夠現代 |
| vendor manualChunks | 重排 chunk 不減總量 | cache 策略 ≠ 體積策略 |
| 預壓 `.br` 檔 | Cloudflare Pages 靜態託管不 serve | 平台行為先查證再動手 |
| codebase-memory MCP | 對 .vue 全盲 | 選工具先驗證它看不看得懂你的檔案格式 |
| Storybook prod build | Rolldown 路徑 25 個 SFC parse error | 縮小範圍也是解：dev-only 照樣有價值 |
| deep-research 工作流 | harness bug，燒掉 ~2.4M tokens 才失敗 | 失敗也入帳；salvage 結果而非盲目重跑 |

## 六、目前的答案：這類 app 的 best practice 快照

「這類 app」= 個人內容站：靜態為主、少量互動孤島、部署在邊緣平台。燒了八週，目前收斂出的答案——

**架構**

- vite-ssg 預渲染 + hydration；landing ~85 KB brotli JS，已貼近 config 可達的地板（hydration 本身 20–30 KB 不可減；換架構的 Vapor 已驗證付不起這筆帳，換編譯器的 vize 證明動不了 bundle）
- 內容走 build-time 驗證（Velite + zod schema），外部 CMS（WordPress）headless 同步
- 重資產絕不進 route chunk：Leaflet 與餐廳資料集動態 import、icon 子集化（app chunk 732→176 KB，gzip 150→66）、AVIF（17 張圖 −482 KB）、字體自架 woff2

**防呆**

- 設計系統 token 化：顏色／圓角／字體全走 semantic token，禁止裸 hex 與 `rounded-xl`
- a11y 不手刻：互動元件一律包 reka-ui headless primitives
- CI 全部 PR-only + paths **allowlist**（永不 paths-ignore）；guard 類 workflow 不掛過濾
- 雙編譯器迴歸 gate（`compare:ssg`）：每個 PR 同時 build plugin-vue 與 vize，HTML 掉路由就紅燈

**紀律**

- 一切實驗進 worktree + env flag，develop 永遠是綠的
- 量測以 brotli 傳輸量為準；驗收看 build 產物的 byte-diff，不看工具自報
- 結論必須落地為記憶或 CI gate，否則等於沒燒

## 七、燒出來的制度——比程式碼值錢的產出

程式碼只剩 424 個檔案，但制度才是這個實驗室真正的庫存：

- **憲法**（CLAUDE.md）：含違例範例的行為規範——連「『弧線太粗』該改 stroke-width 而不是改長度」這種裁決都寫成案例法
- **記憶體系**（40+ 條跨 session 記憶）：每條都是一次燃燒的灰燼結晶，新 session 自動繼承
- **haiku 可讀性閘**：文件寫完丟給最小的模型當「新手工程師」試讀，讀不懂就改——一次把理解率從 30–40% 拉到 75–85%
- **hard-fail gates**：自主工作流的每個 gate 必須能中止流程；只留言不擋路的不叫 gate
- **comment 政策 forward-only**：註解只說現在的約束、不說歷史（一次清剪 −164 行）
- **工作協議**：可視性 = 控制——agile board、背景優先執行、worktree 紀律

## 八、token 經濟學：誠實計帳

我沒有精確的總帳，但已知的單筆足以說明量級：建一次 .vue 知識圖譜 ~730k tokens；一次失敗的 deep-research ~2.4M tokens。失敗也入帳——這是誠實的代價。

為什麼還是划算？因為對照組更貴。NO-GO 帳本裡的每一條，不在這裡燒，就會在未來某一天、在更大的 codebase 上、以生產事故的形式重新收費。而蒸餾物是複利：制度與記憶被每個新 session 零成本複用，判斷一次成形、永久生效。

連燃料效率本身也是實驗對象：RTK 把 CLI 輸出壓掉 60–90%，lean-ctx 把重複讀檔壓到 ~13 tokens。實驗室也優化自己的燃燒方式。

## 九、未竟之地

「終極」不是名詞，是收斂中的動詞。目前搜索空間的邊界：

- vize post-1.0：CJS-interop 修掉那天，五個 workaround 可以拆（removal-test 已備好）
- Vapor post-stable：等 Vue 出 vapor runtime 的 strip flag、vite-ssg 支援 createVaporApp，再回來重測
- 美食地圖的真槓桿：174k 頂點的 suburb GeoJSON 簡化
- 部落格 chrome 的 CMS 化（Phase 2 已規劃、未執行）
- 字體管線的 end-to-end 驗證

每一次燃燒都讓搜索空間縮小一點。這份文件就是目前的收斂狀態——它本身也會被下一次燃燒改寫。

---

*後記：本文由 Claude 代筆，自 718 個 commits、#1–#97 的 PR 軌跡、40+ 條跨 session 記憶蒸餾而成（2026-06-13）。包括這份文件在內，沒有任何結論不可被下一次實驗推翻。*
