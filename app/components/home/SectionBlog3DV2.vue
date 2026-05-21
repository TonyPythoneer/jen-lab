<template>
  <div class="blog3dv2-root" :style="`--n: ${n}; --dur: ${props.spinDuration}s`">
    <div class="blog3dv2-body">
      <main class="blog3dv2-scene">
        <section class="blog3dv2-assembly">
          <article
            v-for="(item, i) in items"
            :key="i"
            :style="`--i: ${i}; --url: url(${item.url})`"
          >
            <header>
              <h3>{{ item.title }}</h3>
              <em>{{ item.subtitle }}</em>
            </header>
            <figure>
              <img :src="item.url" :alt="item.alt" loading="lazy" />
              <figcaption><a :href="item.link" target="_blank">閱讀全文</a></figcaption>
            </figure>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchPosts, stripHtml } from "~/utils/wpApi";

const props = withDefaults(
  defineProps<{
    /** 取出幾篇 WP 文章，同時決定環上卡片數量 */
    postCount?: number;
    /** 自動旋轉一圈的秒數 */
    spinDuration?: number;
  }>(),
  {
    postCount: 18,
    spinDuration: 30,
  },
);

const { data: postsPage } = await useLazyAsyncData("blog3dv2-posts", () =>
  fetchPosts({ perPage: props.postCount }),
);

// ── 圖片尺寸調校（內部參數：手動改下面 PHOTON_FIT 來感受效果與資源消耗）──────
//
// 卡片 <article> 是 2/3 直式，圖片用 object-fit: cover（裁切填滿圖框，來源比例不符
// 時會裁掉溢出的邊，不留白）。圖片走 Jetpack Photon（*.wp.com），用 URL 的
// fit=寬,高 在 CDN 端就回傳縮好的小圖，texture 越小、旋轉時 GPU 記憶體壓力越低。
//
// 卡片尺寸已鎖定桌機最大值（--w: 18em + 字級 1.5em）→ 固定 432×648，不再隨視窗縮。
// 因此圖片需求也固定，PHOTON_FIT 只是「清晰度 vs 資源」的取捨階梯（cover）：
//
//   PHOTON_FIT     對應          說明
//   ───────────    ──────────    ───────────────────
//   "432,648"      1x            最省，HiDPI 螢幕會略糊
//   "640,960"      ~1.5x         目前值，平衡
//   "864,1296"     2x retina     最清晰，最吃傳輸/GPU
//
// fit 越大 → 越清晰但越吃資源；越小 → 越省。手動改下面這行字串即可。
const PHOTON_FIT = "640,960";
function downscalePhoton(url: string): string {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("wp.com")) return url;
    u.searchParams.delete("resize");
    u.searchParams.delete("w");
    u.searchParams.delete("h");
    u.searchParams.set("fit", PHOTON_FIT);
    u.searchParams.set("ssl", "1");
    return u.toString();
  } catch {
    return url;
  }
}

const items = computed(() =>
  (postsPage.value?.data ?? []).map((post) => ({
    title: stripHtml(post.title.rendered),
    subtitle: stripHtml(post.excerpt.rendered).slice(0, 60) + "…",
    url: post.jetpack_featured_media_url
      ? downscalePhoton(post.jetpack_featured_media_url)
      : "https://images.unsplash.com/photo-1583499871880-de841d1ace2a?h=900",
    alt: stripHtml(post.title.rendered),
    link: post.link,
  })),
);

const n = computed(() => Math.max(items.value.length, 1));
</script>

<style scoped>
.blog3dv2-root {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  color: #dedede;
  /* 字級固定為桌機值（原 clamp(.., 3vmin, 1.5em) 會隨視窗縮 → 手機整個旋轉門變小） */
  font:
    1.5em / 1.25 saira,
    sans-serif;
}

.blog3dv2-body {
  position: relative;
  width: 100%;
  height: 100svh;
  display: grid;
  grid-template-rows: 1fr;
}

.blog3dv2-scene {
  display: grid;
  overflow: hidden;
  perspective: 50em;
}

/* ── Assembly: GPU compositor spin, no cascade ────────────────────────────── */
@keyframes blog3dv2-spin {
  to {
    rotate: 0 1 0 -1turn;
  }
}

.blog3dv2-assembly {
  display: grid;
  transform-style: preserve-3d;

  /* 卡片寬鎖定桌機最大值（原 clamp(.., min(50vh,25vw), ..) 會隨視窗縮 → 手機變小） */
  --w: 18em;
  --z: calc(1.25 * -0.5 * var(--w) / tan(0.5turn / var(--n)));
  place-self: center;
  translate: 0 0 var(--z);

  animation: blog3dv2-spin var(--dur) linear infinite;
  &:hover {
    animation-play-state: paused;
  }
}

article {
  --hov: 0;

  display: grid;
  transform-style: preserve-3d;
  width: var(--w);
  aspect-ratio: 2 / 3;
  grid-area: 1 / 1;
  transform: rotatey(calc(var(--i) * 1turn / var(--n))) translatez(var(--z));

  &:hover,
  &:focus-within {
    --hov: 1;
  }
  & header {
    rotate: y calc((1 + var(--hov)) * 0.5turn);
  }
}

article header,
figure {
  display: grid;
  overflow: hidden;
  position: relative;
  border: solid 4px #f48c0640;
  border-radius: 0.5em;
  backface-visibility: hidden;
  box-shadow: 5px 5px 13px #000;
  background: #121212;
  pointer-events: none;
  transition:
    rotate 0.35s ease-out,
    border-color 0.25s ease-out;
  grid-area: 1 / 1;
}

/* 只有 header（背面標題卡）需要圖片底；figure 的圖由 <img> 呈現，
   背景圖會被 img 全蓋而冗餘，移除可省下每張卡一份 GPU texture */
article header {
  background: var(--url) 50% / cover #121212;
}

article:hover header,
article:focus-within header,
article:hover figure,
article:focus-within figure {
  border-color: #f48c06;
}

h3,
em,
figcaption {
  text-shadow: 1px 1px 1px #0006;
}

h3 {
  font-size: 1.125em;
  padding: 0.3em 0.4em 0;
}

figure {
  display: grid;
  grid-area: 1 / 1;
  rotate: y calc(var(--hov) * 0.5turn);
}

h3,
em,
img,
a {
  pointer-events: auto;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  grid-area: 1 / 1;
}

figcaption {
  grid-area: 1 / 1;
  align-self: end;
  padding: 0.5em;
  background: #fff3;
  color: #040404;
  font-size: Max(0.75rem, 0.75em);
  text-align: right;

  a {
    color: #370617;
  }
}
</style>
