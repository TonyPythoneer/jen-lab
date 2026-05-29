# Storybook 元件預覽 — Design Spec

- **Date:** 2026-05-30
- **Status:** Approved (pending written review)
- **Branch:** 實作於 `feat/storybook` worktree(spec 寫於目前分支)

## 1. 目的

開發時能把任一元件**獨立**叫出來看，不用啟動整個網站、不用湊出真實路由資料。
重點是「本機快速預覽」，不是要部署或分享。

## 2. 選型結論

採用 **standalone `@storybook/vue3-vite`**（Storybook 10.x），**不**走 `@nuxtjs/storybook`。

理由：

1. **避開 rolldown 風險。** 獨立 Storybook 自帶它自己的標準 Vite（需 Vite ≥ 5），不會去讀專案的
   `vite-plus` / `rolldown` 設定。相容性風險只存在於 `@nuxtjs/storybook`（它會吃 Nuxt 的 rolldown config），
   以及它對 Nuxt 4.4 的支援可能落後。
2. **最大依賴可解。** 40 個元件中 23 個用 `@nuxt/ui`。Nuxt UI v4 官方支援純 Vite + Vue：
   `@nuxt/ui/vite` plugin + `@nuxt/ui/vue-plugin` + CSS import + `UApp` 包裹。
3. **剩餘耦合很少。** NuxtImg/NuxtLink 5 個（用 stub）、Nuxt composables 5 個（用 mock）、content 0 個。
   15 個是零依賴純元件。

### 被否決的方案

- **`@nuxtjs/storybook`** — 綁 Nuxt 的 rolldown/vite-plus config，Nuxt 4.4 支援可能落後，啟動風險高。
- **Histoire** — 維護趨緩，且同樣是 Vite builder、與 rolldown 相容性未知。
- **站內 `/dev/components` 畫廊路由** — 零依賴、原生 context，但缺 controls/viewport/addon 生態，需自行維護；
  與使用者「要真・Storybook」的意向不符。

## 3. 元件耦合盤點（決定 story 難度）

| 類別                                      | 數量 | Storybook 對策                                              |
| ----------------------------------------- | ---- | ----------------------------------------------------------- |
| 純元件（零 Nuxt 依賴）                    | 15   | 直接寫 story                                                |
| 用 `@nuxt/ui`（`<U*>`）                   | 23   | `@nuxt/ui/vite` + vue-plugin 後直接可用                     |
| 用 NuxtImg / NuxtLink                     | 5    | 全域 stub：`NuxtLink`→`RouterLink`/`<a>`、`NuxtImg`→`<img>` |
| 用 Nuxt composables（useRoute/useState…） | 5    | preview 提供 mock 或先跳過                                  |
| 用 @nuxt/content                          | 0    | 無                                                          |

（同一元件可能同時屬於多類；數字為各依賴的出現元件數。）

## 4. 架構

獨立的 `.storybook/` 設定，與 Nuxt build 完全分離。

```
.storybook/
  main.ts          # framework、stories glob、addons、viteFinal（接 @nuxt/ui plugin + alias）
  preview.ts       # 全域：載 CSS、註冊 ui vue-plugin、stub NuxtLink/NuxtImg、UApp decorator、viewport
  preview-head.html# 載入 Google fonts（@nuxt/fonts 不會在 Storybook 跑）
```

### 4.1 `main.ts` 要點

- `framework: '@storybook/vue3-vite'`
- `stories`: `['../app/components/**/*.stories.@(ts)']`
- `addons`: Essentials（controls / docs / actions）+ Viewport
- `viteFinal`: 加入 `@nuxt/ui/vite` 的 `ui()` plugin；補上路徑 alias `~` / `@` → `app/`、
  並把 `#imports` 等 Nuxt 虛擬模組指向 mock（見 4.3）。

### 4.2 `preview.ts` 要點

- 載入 `app/assets/css/main.css` + `@import "tailwindcss"` + `@import "@nuxt/ui"`
- `setup((app) => app.use(ui))` 註冊 Nuxt UI vue-plugin
- 全域註冊 stub 元件：`NuxtLink`（包 `RouterLink` 或退化成 `<a>`）、`NuxtImg`（退化成 `<img>`）
- 全域 decorator：把每個 story 包進 `<UApp class="isolate">`
- `parameters.viewport`：定義 **desktop / mobile** 兩個 preset，對齊本專案「只有兩斷點」的規則

### 4.3 Nuxt composables mock（Phase 3）

針對 5 個用 `useRoute`/`useState` 等的元件，提供最小 mock 模組，由 `viteFinal` alias 指過去：

- `useRoute()` → 回傳可在 story 用 args 覆寫的假 route
- `useState()` → 退化成本地 `ref`
- 其餘按實際用到的逐一補；用不到的不補。

## 5. Story 撰寫慣例

- **位置：** 與元件同層 co-locate，`Foo.vue` ↔ `Foo.stories.ts`。
- **title：** 依目錄分組，對齊元件組織規則（如 `home/Product`、`blog/PostCard`、`site/Header`）。
- **內容：** 每個元件至少一個 `Default`；有 props 變化的用 `args` + `argTypes` 讓 controls 可調
  （這就是「即時改 props 看狀態變化」的來源）。
- **`Section*` 整頁組合 story：** 對 `Section*` 這類「整頁區塊」元件，額外寫 full-width、
  放進接近真實頁面容器的 story，讓使用者能看到區塊在頁面脈絡下的樣子，並配合 viewport 看 RWD。

## 6. 交付範圍與順序（方案 1：分階段）

最終覆蓋 = 全部 40 個元件。順序只為「早點看到成果、把難的隔離到最後」：

- **Phase 0 — 骨架**：裝套件、`.storybook/` 設定、scripts、確認 Storybook 能空跑開起來。
- **Phase 1 — 易做的（約 35 個）**：15 純元件 + 能靠 `@nuxt/ui` plugin 直接跑的。可開來用的里程碑。
- **Phase 2 — stub 類（5 個）**：NuxtImg / NuxtLink stub 後補 story。
- **Phase 3 — mock 類（5 個）**：Nuxt composables mock 後補 story。
- **Phase 4 — Section 整頁組合 story**：補上 `Section*` 的整頁脈絡 story。

## 7. Addon 範圍

- **裝：** Essentials（controls / docs / actions）、Viewport（desktop / mobile）。
- **先不裝：** a11y、interaction testing（play function）。與「快速預覽」初衷無關，日後易加。

## 8. 套件與 scripts

- 新增 devDependencies：`storybook`、`@storybook/vue3-vite`，以及 Essentials / Viewport 對應 addon 套件。
  （`@nuxt/ui`、`tailwindcss` 已存在。）
- `package.json` scripts：
  - `"storybook": "storybook dev -p 6006"`
  - `"build-storybook": "storybook build"`

## 9. CLAUDE.md 更新（明確交付項）

實作收尾、scripts 真的存在後，更新 `CLAUDE.md`：

- **Commands** 區塊加上 `pnpm storybook` / `pnpm build-storybook` 與一句說明。
- 新增簡短 **Storybook** 段落：選型理由一句（standalone，避開 rolldown）、story co-locate 慣例、
  `Section*` 整頁組合 story 的慣例。

## 10. 驗證

- Phase 0：Storybook 能開起來（空目錄也能跑）。
- 每個 Phase：用 webwright/Playwright 在背景開 `localhost:6006`，截圖確認代表性元件有正確渲染
  （Tailwind 樣式、@nuxt/ui 元件、字型、viewport 切換）後才算完成。符合 CLAUDE.md 視覺驗證要求。

## 11. 非目標（YAGNI）

- 不部署、不做可分享的 hosted 站。
- 不做 a11y / interaction 自動化測試。
- 不引入 `@nuxtjs/storybook`、不改動 Nuxt 的 vite-plus/rolldown 設定。
- 不為「沒有 props 變化又無視覺意義」的純結構元件硬湊多餘 story。
