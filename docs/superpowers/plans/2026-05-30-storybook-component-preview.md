# Storybook 元件預覽 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在本機用 standalone Storybook 把 40 個 Vue 元件獨立叫出來預覽,含 controls 與 desktop/mobile viewport。

**Architecture:** 獨立的 `.storybook/` 設定,自帶標準 Vite,完全不碰 Nuxt 的 vite-plus/rolldown。用 `@nuxt/ui/vite` 接主題,用 `unplugin-auto-import` + `unplugin-vue-components` 還原 Nuxt 的自動匯入,Nuxt 專屬 API(useRoute/useAppConfig/queryCollection、NuxtLink/NuxtImg)以 mock/stub 補上。分階段交付:先把基礎建設與最容易的元件跑起來,再處理依賴重的。

**Tech Stack:** Storybook 10(`@storybook/vue3-vite`)、Vue 3.5、@nuxt/ui v4、Tailwind 4、unplugin-auto-import、unplugin-vue-components。

> **版本提醒:** Storybook 在 8→9→10 之間調過 API 名稱(viewport parameter 形狀、`setup` 匯入路徑、addon 套件是否內建)。本計畫以 SB10 為基準寫;若安裝到的版本對某段報錯,以該版本 migration note 為準,Task 8 的 webwright 開機測試會抓到。

---

## File Structure

| 路徑                             | 責任                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `app/config/site.ts`             | **新增**。把 `ui` / `blog` / `contacts` 抽成純模組,供 `app.config.ts` 與 Storybook 共用(DRY 主題)。               |
| `app/app.config.ts`              | **改**。改成 import `app/config/site.ts`,內容不變。                                                               |
| `.storybook/main.ts`             | **新增**。framework、stories glob、`viteFinal`(@nuxt/ui plugin、auto-import、vue-components、alias、mock alias)。 |
| `.storybook/preview.ts`          | **新增**。載 CSS、註冊 ui vue-plugin、註冊 NuxtLink/NuxtImg/ClientOnly stub、UApp decorator、viewport。           |
| `.storybook/preview-head.html`   | **新增**。載 Google fonts(@nuxt/fonts 不會在 Storybook 跑)。                                                      |
| `.storybook/mocks/nuxt.ts`       | **新增**。Nuxt composables mock(useRoute/useAppConfig/useLazyAsyncData…)。                                        |
| `.storybook/mocks/content.ts`    | **新增**。`@nuxt/content` 的 `queryCollection` stub。                                                             |
| `app/components/**/*.stories.ts` | **新增**。每個元件一支 story,與元件同層 co-locate。                                                               |
| `package.json`                   | **改**。加 `storybook` / `build-storybook` script 與 devDependencies。                                            |
| `.gitignore`                     | **改**。忽略 `storybook-static/`。                                                                                |
| `CLAUDE.md`                      | **改**。加指令與 Storybook 慣例段落(最後一步)。                                                                   |

---

## Task 1: 安裝套件

**Files:**

- Modify: `package.json`

- [ ] **Step 1: 安裝 Storybook 與 unplugin**

Run:

```bash
pnpm add -D storybook @storybook/vue3-vite unplugin-auto-import unplugin-vue-components
```

Expected: 安裝成功,`package.json` devDependencies 出現這四個。`@nuxt/ui`、`tailwindcss` 已存在不用裝。

備註:Storybook 9+ 已把 controls / actions / viewport 內建進 core,**不需**另裝 `addon-essentials` / `addon-viewport`。

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add Storybook + unplugin deps"
```

---

## Task 2: 抽出共用站台設定(DRY 主題)

`app.config.ts` 的 `ui.colors` 是 @nuxt/ui 主題來源,`blog`/`contacts` 是元件資料來源。standalone Storybook 兩邊都要,所以抽成一份純模組。

**Files:**

- Create: `app/config/site.ts`
- Modify: `app/app.config.ts`

- [ ] **Step 1: 建立 `app/config/site.ts`**

把目前 `app.config.ts` 裡的三塊原封不動搬出來:

```ts
// Plain, framework-free site config.
// Imported by app.config.ts (Nuxt runtime) AND by Storybook (no app.config there).
// Single source of truth so the @nuxt/ui theme never drifts between the two.
export const uiConfig = {
  colors: {
    primary: "digital-orange",
    secondary: "cyber-violet",
    neutral: "abyssal-ink",
  },
  button: {
    compoundVariants: [
      // Caldera ghost: neutral outline -> full fill reverse on hover
      {
        color: "neutral",
        variant: "outline",
        class:
          "shadow-[inset_0_0_0_1.5px_var(--color-abyssal-ink)] ring-0 hover:bg-abyssal-ink hover:text-pure-white hover:shadow-none",
      },
    ],
  },
};

export const blogConfig = {
  title: "榛知部落格",
  brief: "深入淺出的中文澳洲知識庫",
};

export const contacts = [
  {
    label: "Threads",
    url: "https://www.threads.com/@jenknowsau",
    icon: "i-simple-icons-threads",
    hoverClass: "hover:text-gray-800",
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/jenliuau/",
    icon: "i-simple-icons-facebook",
    hoverClass: "hover:text-blue-600",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/jenknowsau/",
    icon: "i-simple-icons-instagram",
    hoverClass: "hover:text-pink-500",
  },
  {
    label: "Wordpress",
    url: "https://jenliu.com.au/",
    icon: "i-simple-icons-wordpress",
    hoverClass: "hover:text-blue-700",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/jenliuau/",
    icon: "i-simple-icons-linkedin",
    hoverClass: "hover:text-blue-700",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@jenliuau",
    icon: "i-simple-icons-youtube",
    hoverClass: "hover:text-red-600",
  },
  {
    label: "Email",
    url: "mailto:jen@jenliu.com.au",
    icon: "i-lucide-mail",
    hoverClass: "hover:text-blue-600",
  },
];
```

- [ ] **Step 2: 改 `app/app.config.ts` 改用共用模組**

```ts
import { uiConfig, blogConfig, contacts } from "./config/site";

export default defineAppConfig({
  ui: uiConfig,
  blog: blogConfig,
  contacts,
});
```

- [ ] **Step 3: 確認 Nuxt 仍正常**

Run: `pnpm check`
Expected: typecheck 通過(`app.config` 型別不變)。

- [ ] **Step 4: Commit**

```bash
git add app/config/site.ts app/app.config.ts
git commit -m "refactor: extract site config to a plain module for reuse"
```

---

## Task 3: Nuxt mock 模組

**Files:**

- Create: `.storybook/mocks/nuxt.ts`
- Create: `.storybook/mocks/content.ts`

- [ ] **Step 1: 建立 `.storybook/mocks/nuxt.ts`**

```ts
import { ref } from "vue";
import { uiConfig, blogConfig, contacts } from "../../app/config/site";

// Minimal stand-ins for Nuxt composables. Storybook has no Nuxt runtime,
// so these return just enough shape for components to render.
export const useRoute = () => ({
  path: "/",
  fullPath: "/",
  name: "index",
  params: {} as Record<string, string>,
  query: {} as Record<string, string>,
  hash: "",
  meta: {} as Record<string, unknown>,
  matched: [] as unknown[],
});

export const useRouter = () => ({
  push: async () => {},
  replace: async () => {},
  back: () => {},
  forward: () => {},
});

export const useAppConfig = () => ({ ui: uiConfig, blog: blogConfig, contacts });

export const useRuntimeConfig = () => ({ public: {} as Record<string, unknown> });

export const useState = <T>(_key: string, init?: () => T) => ref(init ? init() : undefined);

export const useLazyAsyncData = <T>(_key: string, handler?: () => Promise<T> | T) => {
  const data = ref<T | null>(null);
  Promise.resolve(handler?.()).then((v) => (data.value = (v as T) ?? null));
  return {
    data,
    pending: ref(false),
    error: ref(null),
    status: ref("success"),
    refresh: async () => {},
  };
};
export const useAsyncData = useLazyAsyncData;

export const navigateTo = async () => {};
export const useHead = () => {};
export const useSeoMeta = () => {};
```

- [ ] **Step 2: 建立 `.storybook/mocks/content.ts`**

```ts
// Chainable stub for @nuxt/content's queryCollection. Returns empty data
// so content-driven components render their empty/loading branch safely.
export const queryCollection = () => {
  const chain = {
    where: () => chain,
    order: () => chain,
    limit: () => chain,
    path: () => chain,
    select: () => chain,
    all: async () => [] as unknown[],
    first: async () => null,
  };
  return chain;
};
```

- [ ] **Step 3: Commit**

```bash
git add .storybook/mocks/nuxt.ts .storybook/mocks/content.ts
git commit -m "feat(storybook): add Nuxt composable + content mocks"
```

---

## Task 4: `.storybook/main.ts`

**Files:**

- Create: `.storybook/main.ts`

- [ ] **Step 1: 建立 `.storybook/main.ts`**

```ts
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";
import ui from "@nuxt/ui/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { uiConfig } from "../app/config/site";

const appDir = fileURLToPath(new URL("../app", import.meta.url));
const mocksDir = fileURLToPath(new URL("./mocks", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/vue3-vite",
  stories: ["../app/components/**/*.stories.@(ts|js)"],
  addons: [],
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(viteConfig, {
      plugins: [
        // @nuxt/ui outside Nuxt: pass the same theme app.config uses.
        ui({ ui: uiConfig }),
        // Replicate Nuxt's auto-imports (Vue APIs, VueUse, project composables,
        // and Nuxt composables routed to our mock).
        AutoImport({
          dts: false,
          imports: [
            "vue",
            "@vueuse/core",
            {
              [`${mocksDir}/nuxt`]: [
                "useRoute",
                "useRouter",
                "useAppConfig",
                "useRuntimeConfig",
                "useState",
                "useLazyAsyncData",
                "useAsyncData",
                "navigateTo",
                "useHead",
                "useSeoMeta",
              ],
              [`${mocksDir}/content`]: ["queryCollection"],
            },
          ],
          dirs: [`${appDir}/composables`],
        }),
        // Replicate Nuxt's component auto-import naming:
        // home/Sprite.vue -> <HomeSprite>, blog/PostCard.vue -> <BlogPostCard>.
        Components({
          dts: false,
          dirs: [`${appDir}/components`],
          directoryAsNamespace: true,
          collapseSamePrefixes: true,
        }),
      ],
      resolve: {
        alias: [
          { find: /^~\//, replacement: `${appDir}/` },
          { find: /^@\//, replacement: `${appDir}/` },
          { find: /^#imports$/, replacement: `${mocksDir}/nuxt` },
          { find: /^@nuxt\/content$/, replacement: `${mocksDir}/content` },
        ],
      },
    });
  },
};

export default config;
```

> **為何用 regex alias:** `@` 不能用字串 alias(會誤把 `@nuxt/ui`、`@vueuse/core` 也改寫)。元件一律寫 `@/` `~/`(帶斜線),所以 `^@\//`、`^~\//` 安全。

- [ ] **Step 2: Commit**

```bash
git add .storybook/main.ts
git commit -m "feat(storybook): main config with @nuxt/ui + auto-import infra"
```

---

## Task 5: `.storybook/preview.ts`

**Files:**

- Create: `.storybook/preview.ts`

- [ ] **Step 1: 建立 `.storybook/preview.ts`**

```ts
import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import { h } from "vue";
import ui from "@nuxt/ui/vue-plugin";
import "../app/assets/css/main.css";

// Minimal stand-ins for Nuxt's built-in components.
const NuxtLink = {
  props: { to: { type: [String, Object], default: "#" } },
  setup(props: any, { slots }: any) {
    const href = typeof props.to === "string" ? props.to : "#";
    return () => h("a", { href }, slots.default?.());
  },
};
const NuxtImg = {
  inheritAttrs: false,
  props: { src: String, alt: String },
  setup(props: any, { attrs }: any) {
    return () => h("img", { ...attrs, src: props.src, alt: props.alt });
  },
};
const ClientOnly = {
  setup(_: any, { slots }: any) {
    return () => slots.default?.();
  },
};

setup((app) => {
  app.use(ui);
  app.component("NuxtLink", NuxtLink);
  app.component("NuxtImg", NuxtImg);
  app.component("NuxtPicture", NuxtImg);
  app.component("ClientOnly", ClientOnly);
});

const preview: Preview = {
  // Wrap every story in UApp so @nuxt/ui overlays/toasts/theming work.
  decorators: [
    (story) => ({
      components: { story },
      template: '<UApp class="isolate"><story /></UApp>',
    }),
  ],
  parameters: {
    layout: "fullscreen",
    // SB10 viewport shape. If the installed version errors, switch to the
    // version's documented shape (SB8 used `viewport.viewports`).
    viewport: {
      options: {
        mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },
  },
  initialGlobals: {
    viewport: { value: "desktop", isRotated: false },
  },
};

export default preview;
```

- [ ] **Step 2: Commit**

```bash
git add .storybook/preview.ts
git commit -m "feat(storybook): preview with UApp decorator, Nuxt stubs, viewport"
```

---

## Task 6: 字型 + scripts + gitignore

**Files:**

- Create: `.storybook/preview-head.html`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: 建立 `.storybook/preview-head.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: 加 scripts 到 `package.json`**

在 `scripts` 區塊加(放在 `dev` 後面即可):

```json
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
```

- [ ] **Step 3: 忽略 build 產物**

在 `.gitignore` 末尾加一行:

```
storybook-static
```

- [ ] **Step 4: Commit**

```bash
git add .storybook/preview-head.html package.json .gitignore
git commit -m "feat(storybook): fonts, scripts, ignore build output"
```

---

## Task 7: Phase 0 — 冒煙測試(基礎建設可開機)

先用一支不依賴任何專案元件的 story 驗證:@nuxt/ui、主題色、UApp、Tailwind、字型、viewport 都通了。

**Files:**

- Create: `.storybook/Smoke.stories.ts`(暫時,Phase 1 後刪)

- [ ] **Step 1: 建立 `.storybook/Smoke.stories.ts`**

```ts
import type { Meta, StoryObj } from "@storybook/vue3";

const meta: Meta = {
  title: "_smoke/Theme",
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-4 items-start font-sans">
        <h1 class="text-heading font-display">Storybook is up</h1>
        <UButton color="primary">Primary (digital-orange)</UButton>
        <UButton color="neutral" variant="outline">Ghost neutral</UButton>
        <UBadge color="secondary">secondary</UBadge>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
```

- [ ] **Step 2: 開 Storybook**

Run(背景): `pnpm storybook`
Expected: 編譯成功,終端顯示 `Local: http://localhost:6006`,無紅字錯誤。

- [ ] **Step 3: webwright 視覺驗證**

用 webwright 在背景開 `http://localhost:6006/?path=/story/_smoke-theme--default`,截圖後 `Read`。
Expected(計算後預期):

- Primary 按鈕底色為 `#fc5000`(digital-orange),不是預設藍。
- Ghost neutral 按鈕為細黑外框 pill 形(`--radius-caldera-pill` 800px → 膠囊狀)。
- 標題用 Bebas Neue(窄體大寫感)。
  若任一項不符 → 主題或 CSS 沒接好,先修 Task 4/5 再往下。

- [ ] **Step 4: 切 viewport 驗證**

webwright 在 Storybook 工具列把 viewport 切到 Mobile(390px),截圖確認畫面寬度收窄到約 390px。
Expected: 內容容器寬度跟著變窄。

- [ ] **Step 5: Commit**

```bash
git add .storybook/Smoke.stories.ts
git commit -m "test(storybook): smoke story verifies theme + viewport boot"
```

---

## Story 撰寫慣例(Task 8–12 共用)

每支 story 同層 co-locate(`Foo.vue` → `Foo.stories.ts`)。標準模板:

```ts
import type { Meta, StoryObj } from "@storybook/vue3";
import Foo from "./Foo.vue";

const meta = {
  title: "<dir>/Foo", // 例:home/Sprite、blog/PostCard、site/Header
  component: Foo,
} satisfies Meta<typeof Foo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // 打開 Foo.vue 讀 defineProps,把每個必填 prop 給合理值。
    // 有變體的(size/color/variant/狀態)再多開幾個具名 export。
  },
};
```

**每個元件的執行步驟都一樣,故只列一次:**

1. 打開該 `.vue` 讀 `defineProps`(沒有 props 的元件 `args` 留空)。
2. 依模板寫 `Foo.stories.ts`,必填 prop 都給值;有明顯變體的多寫幾個具名 story。
3. `pnpm storybook` 已在跑 → webwright 開該 story 頁截圖 `Read`,確認有正確渲染(無紅色錯誤畫面、樣式正確)。
4. 一個 task 的所有元件都過了再一起 commit。

> 渲染需要外層尺寸的元件(滿版/絕對定位),在 story 用 `render` 包一層容器:
>
> ```ts
> export const Default: Story = {
>   render: (args) => ({
>     components: { Foo },
>     setup: () => ({ args }),
>     template: `<div class="min-h-dvh"><Foo v-bind="args" /></div>`,
>   }),
> };
> ```

---

## Task 8: Phase 1a — 純元件 stories(15 個)

零 Nuxt 依賴,最穩。逐一照「Story 撰寫慣例」處理。

**Files(各自新增同名 `.stories.ts`):**

- `app/components/FilterGroup.vue`
- `app/components/FilterItem.vue`
- `app/components/fx/Aurora.vue`
- `app/components/home/BackgroundDots.vue`
- `app/components/home/BubbleTeaCss.vue`
- `app/components/home/BuyButton.vue`
- `app/components/home/ContentBody.vue`
- `app/components/home/EnvelopeAnimation.vue`
- `app/components/home/GlyphSvg.vue`
- `app/components/home/HarbourBridgeSvg.vue`
- `app/components/home/OperaHouseSvg.vue`
- `app/components/home/SectionDirections.vue`
- `app/components/home/Sprite.vue`
- `app/components/home/WaveSvg.vue`
- `app/components/site/PageContainer.vue`

- [ ] **Step 1:** 依慣例為以上 15 個各寫一支 story(`<dir>/<Name>` 當 title)。
- [ ] **Step 2:** webwright 逐一截圖確認渲染正確。SVG/動畫類確認圖形有出現;`PageContainer` 放點 placeholder 內容看內距。
- [ ] **Step 3: Commit**

```bash
git add "app/components/**/*.stories.ts"
git commit -m "feat(storybook): stories for pure leaf components"
```

---

## Task 9: Phase 1b — 用 @nuxt/ui 的元件 stories(18 個)

用 `<U*>` 但不碰 NuxtLink/composables,基礎建設就緒後可直接渲染。

**Files(各自新增同名 `.stories.ts`):**

- `app/components/CollapsibleSeparator.vue`
- `app/components/MapView.vue` — 用 Leaflet,靠 `ClientOnly` stub 渲染。若 Leaflet 在 Storybook 報錯,先寫 story 但把驗證標為 best-effort 並在 commit message 註記,不要卡關。
- `app/components/RestaurantCard.vue`
- `app/components/ScrollToTopButton.vue`
- `app/components/blog/FilterButton.vue`
- `app/components/blog/PostCardSkeleton.vue`
- `app/components/blog/SearchModal.vue` — modal 類,story 用 `render` 直接把內容打開(`open` 預設 true 或對應 prop)。
- `app/components/home/DirectionPair.vue`
- `app/components/home/ImageCarousel.vue`
- `app/components/home/Product.vue`
- `app/components/home/Profile.vue`
- `app/components/home/SectionHero.vue`
- `app/components/home/SectionNewProduct.vue`
- `app/components/home/SectionNewsletter.vue`
- `app/components/home/SectionSupport.vue`
- `app/components/home/Toc.vue`
- `app/components/home/YoutubeCarousel.vue`
- `app/components/profile/Page.vue`

- [ ] **Step 1:** 依慣例各寫一支 story。
- [ ] **Step 2:** webwright 逐一截圖確認 @nuxt/ui 元件(按鈕/badge/icon)樣式正確、主題色正確。
- [ ] **Step 3: Commit**

```bash
git add "app/components/**/*.stories.ts"
git commit -m "feat(storybook): stories for @nuxt/ui-based components"
```

---

## Task 10: Phase 2 — NuxtImg/NuxtLink 元件(已 worked 範例:PostCard)

這些靠 Task 5 的 stub 渲染。`blog/PostCard.vue` 給完整範例,其餘照辦。

**Files:**

- Create: `app/components/blog/PostCard.stories.ts`
- 另為這些寫 story(同慣例):`app/components/home/Portal.vue`、`app/components/site/Footer.vue`、`app/components/site/Header.vue`
  (`home/SectionBlog3DV2.vue` 同時依賴 composables,放 Task 11。)

- [ ] **Step 1: 寫 `app/components/blog/PostCard.stories.ts`(完整範例)**

PostCard 的 `defineProps`:`post: WpPost`、`to: RouteLocationRaw`、`tagMap: Record<number, string>`。給假資料:

```ts
import type { Meta, StoryObj } from "@storybook/vue3";
import PostCard from "./PostCard.vue";

const meta = {
  title: "blog/PostCard",
  component: PostCard,
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const basePost = {
  id: 1,
  date: new Date().toISOString(),
  title: { rendered: "雪梨最好吃的早午餐清單" },
  excerpt: { rendered: "<p>從 CBD 到內西區,實測過的口袋名單一次整理。</p>" },
  tags: [10, 20, 30],
  jetpack_featured_media_url: "https://picsum.photos/seed/jenlab/640/360",
};

const tagMap = { 10: "早午餐", 20: "雪梨", 30: "美食" };

export const Default: Story = {
  render: (args) => ({
    components: { PostCard },
    setup: () => ({ args }),
    template: `<div class="max-w-sm"><PostCard v-bind="args" /></div>`,
  }),
  args: { post: basePost as any, to: "/blogs/sample", tagMap },
};

// "New!" 角標:7 天內的文章才會亮。
export const NewBadge: Story = {
  ...Default,
  args: { ...Default.args, post: { ...basePost, date: new Date().toISOString() } as any },
};

// 沒有首圖 → 走 fallback 版面。
export const NoImage: Story = {
  ...Default,
  args: { ...Default.args, post: { ...basePost, jetpack_featured_media_url: "" } as any },
};
```

- [ ] **Step 2: 寫 Portal / Footer / Header 的 story**

照慣例,讀各自 `defineProps`。Header/Footer 多半無必填 prop,直接 `Default: {}`;它們內部的 `useRoute`/`useAppConfig` 由 mock 提供。Footer 的 contacts 來自 mock 的 `useAppConfig().contacts`。

- [ ] **Step 3:** webwright 逐一截圖。重點確認:
  - PostCard 圖片有載入(picsum)、NewBadge 角標出現、NoImage 走 icon fallback。
  - Header/Footer 的 NuxtLink 變成 `<a>`、有正確排版、contacts icon 都在。
- [ ] **Step 4: Commit**

```bash
git add "app/components/**/*.stories.ts"
git commit -m "feat(storybook): stories for NuxtImg/NuxtLink components"
```

---

## Task 11: Phase 3 — composable 依賴重的元件

剩下用 Nuxt/VueUse composables 的:`ContactLinks.vue`、`SnapCarousel.vue`、`home/SectionBlog3DV2.vue`。
這些靠 Task 3 mock + auto-import 的 VueUse。逐一寫 story,渲染不出來時先補對應 mock(只補實際用到的)。

**Files:**

- Create: `app/components/ContactLinks.stories.ts`
- Create: `app/components/SnapCarousel.stories.ts`
- Create: `app/components/home/SectionBlog3DV2.stories.ts`

- [ ] **Step 1:** 各寫一支 story。
  - `ContactLinks`:資料來自 mock `useAppConfig().contacts`,`Default: {}` 即可。
  - `SnapCarousel`:用 VueUse 的捲動 composable;若需要 slot 內容,用 `render` 塞幾張 placeholder 卡。
  - `SectionBlog3DV2`:同時用 NuxtLink + composable,可能需要 `post` 類假資料(讀 defineProps 後給)。
- [ ] **Step 2:** webwright 截圖。若某元件因缺某個 composable 報錯 → 在 `.storybook/mocks/nuxt.ts` 補那一個,再驗。補完仍渲染不出的(例:深度依賴執行期捲動量測),story 保留並在 commit message 註記為 best-effort,不卡關。
- [ ] **Step 3: Commit**

```bash
git add "app/components/**/*.stories.ts" .storybook/mocks/nuxt.ts
git commit -m "feat(storybook): stories for composable-heavy components"
```

---

## Task 12: Phase 4 — Section 整頁組合 story

讓 `Section*` 元件用接近真實頁面的容器呈現,搭配 viewport 看 RWD(滿足「看 page 內的變化」)。

**Files(在既有 stories 檔加一個 `InPage` 具名 export):**

- `app/components/home/SectionHero.stories.ts`
- `app/components/home/SectionDirections.stories.ts`
- `app/components/home/SectionNewProduct.stories.ts`
- `app/components/home/SectionNewsletter.stories.ts`
- `app/components/home/SectionSupport.stories.ts`
- `app/components/home/SectionBlog3DV2.stories.ts`

- [ ] **Step 1:** 每個 Section story 加一個整頁脈絡版本:

```ts
export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { SectionHero }, // 換成對應元件
    setup: () => ({ args }),
    // 模擬真實頁:滿高 + 站台底色,讓滿版區塊呈現正確。
    template: `<div class="min-h-dvh bg-[var(--color-basalt-canvas)]"><SectionHero v-bind="args" /></div>`,
  }),
};
```

- [ ] **Step 2:** webwright 在 desktop 與 mobile 兩個 viewport 各截一張,確認區塊在兩斷點都正確(滿版、間距、不溢出)。
- [ ] **Step 3: Commit**

```bash
git add "app/components/home/Section*.stories.ts"
git commit -m "feat(storybook): in-page context stories for Section components"
```

---

## Task 13: 收尾 — 刪冒煙 story、更新 CLAUDE.md、最終驗證

**Files:**

- Delete: `.storybook/Smoke.stories.ts`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 刪掉冒煙 story**

```bash
git rm .storybook/Smoke.stories.ts
```

- [ ] **Step 2: 更新 `CLAUDE.md` 的 Commands 區塊**

在 `pnpm dev` 那段附近加:

```
pnpm storybook        # Component preview at :6006 — standalone Storybook
pnpm build-storybook  # Build static Storybook to storybook-static/
```

- [ ] **Step 3: 在 `CLAUDE.md` 加一段 Storybook 慣例(放在 Architecture 後)**

```markdown
## Storybook

Standalone `@storybook/vue3-vite`(非 `@nuxtjs/storybook`),自帶標準 Vite 以避開
專案的 vite-plus/rolldown。`.storybook/main.ts` 用 `@nuxt/ui/vite` 接主題,並用
`unplugin-auto-import` + `unplugin-vue-components` 還原 Nuxt 的自動匯入;Nuxt 專屬
API(useRoute/useAppConfig/queryCollection、NuxtLink/NuxtImg)在 `.storybook/mocks/` 與
`.storybook/preview.ts` 以 mock/stub 補上。

- Story 與元件同層 co-locate:`Foo.vue` ↔ `Foo.stories.ts`,title 用 `<dir>/<Name>`。
- `Section*` 元件除了 `Default`,另寫一個 `InPage`(滿高容器)看整頁脈絡與 RWD。
- @nuxt/ui 主題的單一來源是 `app/config/site.ts`,改色改主題只改這裡。
```

- [ ] **Step 4: 最終全量驗證**

Run: `pnpm build-storybook`
Expected: build 成功,產出 `storybook-static/`,終端無錯誤、無「failed to resolve」。

再 `pnpm storybook`,webwright 開首頁掃過側邊欄,確認 40 個元件都列出、隨機點 5 個不同類別的 story 都正確渲染(已在前面各 task 逐一驗過,這裡是回歸)。

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md .storybook/Smoke.stories.ts
git commit -m "docs: document Storybook setup + conventions in CLAUDE.md"
```

---

## Self-Review 對照(spec 覆蓋)

- 選型 standalone `@storybook/vue3-vite` → Task 1、4。
- @nuxt/ui 主題接入(DRY)→ Task 2、4。
- 自動匯入還原(spec §4.1 新增需求)→ Task 4。
- Nuxt composables / content mock(spec §4.3)→ Task 3、11。
- NuxtLink/NuxtImg/ClientOnly stub + UApp decorator(spec §4.2)→ Task 5、10。
- 字型(spec §4)→ Task 6。
- 分階段交付 40 個(spec §6)→ Task 7–12。
- Essentials/Viewport,不裝 a11y/interaction(spec §7)→ Task 5(viewport)、Task 1 備註(addon 內建)。
- scripts(spec §8)→ Task 6。
- CLAUDE.md 更新(spec §9)→ Task 13。
- 每階段 webwright 視覺驗證(spec §10)→ 各 task 的截圖步驟。
