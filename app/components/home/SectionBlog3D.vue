<script setup lang="ts">
import { fetchPosts, stripHtml } from "~/utils/wpApi";

// ── 固定視覺常數（不對外暴露）─────────────────────────────────────────────
const POST_SIZE_EM = { sm: 14, md: 17.5, lg: 21 } as const;
const POST_TITLE_FS = { sm: "1.5rem", md: "2rem", lg: "2.5rem" } as const;
// perspective = k × radius，固定比值保證景深感恆定，不隨卡片大小或張數改變
const PERSPECTIVE_RATIO = 1.6;
const MASK_FADE = 20; // 側邊淡出 %
const CARD_RADIUS_EM = 1.5; // 卡片圓角 em

// ── Caller-facing props（只有這三個）──────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** 要顯示幾篇文章，同時決定 API 抓取量與圓柱密度 */
    displayCount?: number;
    /** 單篇卡片的視覺大小 */
    postSize?: keyof typeof POST_SIZE_EM;
    /** 自動旋轉一圈的秒數 */
    spinDuration?: number;
    /** 顯示幾何邊線與 hover 資訊，截圖給 AI 分析用 */
    debug?: boolean;
  }>(),
  {
    displayCount: 12,
    postSize: "md",
    spinDuration: 32,
    debug: false,
  },
);

const { debug } = toRefs(props);

// ── 資料 ──────────────────────────────────────────────────────────────────
const { data: postsResult } = useLazyAsyncData(
  "home:blog-3d-carousel",
  () => fetchPosts({ page: 1, perPage: props.displayCount }),
  { server: false },
);

const cards = computed(() =>
  (postsResult.value?.data ?? []).slice(0, props.displayCount).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    image: p.jetpack_featured_media_url,
  })),
);

// ── 幾何派生（全部內部）───────────────────────────────────────────────────
const n = computed(() => cards.value.length || props.displayCount);

const sceneVars = computed(() => {
  const w = POST_SIZE_EM[props.postSize];
  const H = w * (10 / 7);
  const arcRad = 2 * Math.PI; // 固定全圓
  const ba = arcRad / n.value;
  const R = (0.5 * w + 0.5) / Math.tan(ba / 2); // 圓柱半徑（相切模式）
  const P = PERSPECTIVE_RATIO * R; // perspective 跟著半徑等比，景深感恆定

  // scene 最小高度：以 cosθ=0.1（84.26°）截斷，薄片卡片的亞像素裁切可忽略
  const sinThetaCut = Math.sqrt(1 - 0.01);
  const zCut = (w / 2) * sinThetaCut - R * 0.1;
  const sceneH = (H * P) / Math.max(P - zCut, 1);

  return {
    "--n": String(n.value),
    "--w": `${w}em`,
    "--dur": `${props.spinDuration}s`,
    "--title-fs": POST_TITLE_FS[props.postSize],
    "--perspective": `${P.toFixed(1)}em`,
    "--mask-fade": `${MASK_FADE}%`,
    "--card-radius": `${CARD_RADIUS_EM}em`,
    "--scene-min-h": `${sceneH.toFixed(1)}em`,
  } as Record<string, string>;
});
</script>

<template>
  <section
    id="blog-3d"
    class="py-[72px] sm:py-[140px] space-y-6 overflow-hidden"
    :style="sceneVars"
  >
    <div class="px-[max(1rem,calc((100vw-1200px)/2+1rem))]">
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-6xl"
      >
        Stories.
      </h2>
      <p class="mt-2 text-sm text-abyssal-ink/50">自動旋轉 · 點擊閱讀全文</p>
    </div>

    <!-- 3D carousel scene -->
    <div class="scene" :class="{ 'is-debug': debug }" aria-hidden="false">
      <div class="a3d">
        <NuxtLink
          v-for="(card, i) in cards"
          :key="card.id"
          :to="`/blogs/${card.id}?title=${card.slug}`"
          class="card"
          :style="`--i: ${i}`"
          :data-debug-info="debug ? `#${card.id} · ${stripHtml(card.title)}` : undefined"
        >
          <img
            v-if="card.image"
            :src="card.image"
            :alt="stripHtml(card.title)"
            loading="lazy"
            class="card-img"
          />
          <div v-else class="card-fallback">
            <span class="card-fallback-title" v-html="card.title" />
          </div>
          <div class="card-overlay">
            <span class="card-overlay-title" v-html="card.title" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scene,
.a3d {
  display: grid;
}

.scene {
  overflow: hidden;
  perspective: var(--perspective);
  mask: linear-gradient(90deg, #0000, red var(--mask-fade) calc(100% - var(--mask-fade)), #0000);
  -webkit-mask: linear-gradient(
    90deg,
    #0000,
    red var(--mask-fade) calc(100% - var(--mask-fade)),
    #0000
  );
  min-height: var(--scene-min-h);
  place-items: center;
}

.a3d {
  --ba: calc(360deg / var(--n, 12));
  --auto-radius: calc((0.5 * var(--w, 17.5em) + 0.5em) / tan(0.5 * var(--ba)));
  place-self: center;
  transform-style: preserve-3d;
  animation: ry var(--dur, 32s) linear infinite;
}

@keyframes ry {
  to {
    rotate: y 1turn;
  }
}

.a3d:hover {
  animation-play-state: paused;
}

.card {
  grid-area: 1 / 1;
  width: var(--w, 17.5em);
  aspect-ratio: 7 / 10;
  border-radius: var(--card-radius, 1.5em);
  backface-visibility: hidden;
  transform: rotatey(calc(var(--i) * var(--ba))) translatez(calc(-1 * var(--auto-radius)));
  overflow: hidden;
  border: 2px solid var(--color-abyssal-ink, #1a1a2e);
  position: relative;
  text-decoration: none;
  display: block;
  cursor: pointer;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-fallback {
  width: 100%;
  height: 100%;
  background: var(--color-cyber-violet, #6c4be8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.card-fallback-title {
  font-family: var(--font-display, "Bebas Neue", sans-serif);
  letter-spacing: 0.02em;
  line-height: 0.95;
  font-size: 1.4rem;
  color: white;
  text-align: center;
}

/* bottom gradient + title overlay */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, transparent 55%);
  display: flex;
  align-items: flex-end;
  padding: 0.75rem;
}

.card-overlay-title {
  font-size: var(--title-fs, 2rem);
  font-weight: 700;
  color: white;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .a3d {
    animation-duration: calc(var(--dur, 32s) * 4);
  }
}

/* dev-only: geometry outlines (?debug3d in URL) */
.is-debug {
  outline: 2px dashed oklch(0.7 0.2 150);
  mask: none !important;
  -webkit-mask: none !important;
}
.is-debug .a3d {
  outline: 2px dashed oklch(0.7 0.2 270);
}
.is-debug .card {
  border: 2px solid oklch(0.7 0.25 30) !important;
  border-radius: 0 !important;
  background: oklch(0.95 0.05 30 / 0.15) !important;
}
.is-debug .card-overlay {
  background: none !important;
}
.is-debug .card:hover::after {
  content: attr(data-debug-info);
  position: absolute;
  inset-inline: 0.5rem;
  top: 0.5rem;
  background: rgba(0, 0, 0, 0.88);
  color: #fff;
  font: 0.65rem/1.4 monospace;
  padding: 0.25rem 0.4rem;
  border-radius: 0.25rem;
  word-break: break-all;
  z-index: 10;
  pointer-events: none;
}
</style>
