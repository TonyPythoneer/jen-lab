<template>
  <div class="blog3dv2-wrapper">
    <!-- Header -->
    <h2
      class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl shrink-0"
    >
      {{ heading }}
    </h2>

    <div class="blog3dv2-root" :style="`--n: ${n}; --dur: ${props.spinDuration}s`">
      <div class="blog3dv2-body">
        <main class="blog3dv2-scene">
          <section
            ref="assemblyRef"
            class="blog3dv2-assembly"
            :class="{ 'is-paused': activeIndex !== null }"
          >
            <article
              v-for="(item, i) in items"
              :key="i"
              :class="{ 'is-active': activeIndex === i, 'neon-arc': activeIndex === i }"
              :style="`--i: ${i}; --url: url(${item.url})`"
              @click="activateCard(i, $event)"
              @focusin="activateCard(i, $event)"
            >
              <header>
                <h3>{{ item.title }}</h3>
              </header>
              <figure>
                <button
                  v-if="activeIndex === i"
                  type="button"
                  class="card-close"
                  aria-label="關閉"
                  @click.stop="deactivate"
                >
                  ×
                </button>
                <img :src="item.url" :alt="item.alt" loading="lazy" />
                <RouterLink class="card-cta" :to="`/blogs/${item.id}`">{{ ctaLabel }}</RouterLink>
              </figure>
            </article>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchPosts, stripHtml } from "~/utils/blog/wpApi";
// Imported here (not globally) so it ships only in this chunk — via the script,
// not `<style src>`, because vize can't resolve the `~` alias there.
import "~/assets/css/effects/neon-arc.css";

const props = withDefaults(
  defineProps<{
    /** Number of WP posts to fetch; also the card count around the ring */
    postCount?: number;
    /** Seconds for one full rotation */
    spinDuration?: number;
    /** Section heading above the ring */
    heading?: string;
    /** "Read full post" link label on each card */
    ctaLabel?: string;
  }>(),
  {
    postCount: 18,
    spinDuration: 30,
    heading: "My Stories",
    ctaLabel: "閱讀全文",
  },
);

// WP posts fill in client-side after mount (live, not baked at build).
const postsPage = ref<Awaited<ReturnType<typeof fetchPosts>> | null>(null);
onMounted(async () => {
  postsPage.value = await fetchPosts({ perPage: props.postCount });
});

// Jetpack Photon CDN-resizes via fit=W,H: a smaller fit means a smaller GPU
// texture and less spin stutter. Cards max 432x648, so "640,960" ≈ 1.5x density.
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
    id: post.id,
    title: stripHtml(post.title.rendered),
    subtitle: `${stripHtml(post.excerpt.rendered).slice(0, 60)}…`,
    url: post.jetpack_featured_media_url
      ? downscalePhoton(post.jetpack_featured_media_url)
      : "https://images.unsplash.com/photo-1583499871880-de841d1ace2a?h=900",
    alt: stripHtml(post.title.rendered),
  })),
);

const n = computed(() => Math.max(items.value.length, 1));

// CSS 3D hit-testing isn't depth-sorted, so only front cards may flip. "Front" =
// widest projected box under perspective — no fragile angle/sign math.
const assemblyRef = ref<HTMLElement>();
const activeIndex = ref<number | null>(null);

// A card is front (flippable) when its projected width >= widest card × this.
// 1.0 = only the centre card; too low lets side cards flip again.
const FRONT_RATIO = 0.475;

function isFrontCard(card: HTMLElement): boolean {
  const cards = assemblyRef.value?.querySelectorAll<HTMLElement>("article");
  if (!cards?.length) return false;
  let maxWidth = 0;
  for (const c of cards) {
    const width = c.getBoundingClientRect().width;
    if (width > maxWidth) maxWidth = width;
  }
  return card.getBoundingClientRect().width >= maxWidth * FRONT_RATIO;
}

function activateCard(i: number, event: Event) {
  const card = event.currentTarget as HTMLElement;
  if (!isFrontCard(card)) return;
  activeIndex.value = i;
}

function deactivate() {
  activeIndex.value = null;
}

onClickOutside(assemblyRef, deactivate);
onKeyStroke("Escape", deactivate);
</script>

<style scoped>
.blog3dv2-wrapper {
  position: relative;
  width: 100%;
  height: 100svh;
}

.blog3dv2-root {
  width: 100%;
  height: 100svh;
  overflow: hidden;
  color: #dedede;
  /* Fixed desktop font size; a vw/vmin clamp here would shrink the whole ring on mobile */
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

@keyframes blog3dv2-spin {
  to {
    rotate: 0 1 0 -1turn;
  }
}

.blog3dv2-assembly {
  display: grid;
  transform-style: preserve-3d;

  /* Card width locked to desktop max; a vw/vh clamp would shrink it on mobile */
  --w: 18em;
  /* Cylinder radius = regular-polygon apothem: (w/2) / tan(pi/n).
     Negative => convex ring (card fronts face outward); 1.25 widens it a touch. */
  --z: calc(1.25 * -0.5 * var(--w) / tan(0.5turn / var(--n)));
  place-self: center;
  translate: 0 0 var(--z);

  animation: blog3dv2-spin var(--dur) linear infinite;
  &.is-paused {
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
  cursor: pointer;
  transform: rotatey(calc(var(--i) * 1turn / var(--n))) translatez(var(--z));

  /* Only the JS-activated front card flips (see isFrontCard in the script). */
  &.is-active {
    --hov: 1;
    /* Lift the active card toward the camera so neighbours stop occluding its
       edges — otherwise the spinning border arc vanishes where they overlap. */
    transform: rotatey(calc(var(--i) * 1turn / var(--n))) translatez(calc(var(--z) - 6em));
  }
  /* Two-face flip: header (title) and figure (image) sit back-to-back; --hov adds a
     half-turn so hovering swaps which face the viewer sees (figure default, header on hover). */
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

/* Only header needs the image background — figure shows it via <img>, so a
   second background would just cost another GPU texture. */
article header {
  background: var(--url) 50% / cover #121212;
  align-content: end;
}

/* The arc comes from the shared .neon-arc utility; only per-card tuning here.
   The default drop-shadow would paint over the thin arc, so it goes. */
article.is-active {
  --neon-arc-ring: 12px;
}
article.is-active header,
article.is-active figure {
  border-color: transparent;
  box-shadow: none;
}

h3 {
  font-size: 0.9em;
  font-weight: 700;
  padding: 0.4em 1em;
  background: #fff;
  color: #000;
  border-radius: 9999px;
  margin: 0 1em 1em;
  align-self: end;
  justify-self: center;
  max-width: calc(100% - 2em);
  text-align: center;
  text-wrap: balance;
  text-shadow: none;
}

figure {
  /* display/grid-area already set via `article header, figure`; only the flip differs */
  rotate: y calc(var(--hov) * 0.5turn);
}

/* Card content is the hit area; the title face holds hover after the flip so it
   doesn't jitter. Whether a card flips is gated by isFrontCard() in the script. */
h3,
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

.card-cta {
  grid-area: 1 / 1;
  place-self: center;
  padding: 0.5em 1.4em;
  background: #fff;
  color: #000;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.9em;
  text-decoration: none;
  transition: background 0.2s ease-out;

  &:hover {
    background: #f48c06;
    color: #fff;
  }
}

/* Lives inside <header>, which is backface-hidden, so it's only hittable when flipped. */
.card-close {
  position: absolute;
  top: 0.6em;
  right: 0.6em;
  z-index: 2;
  width: 1.8em;
  height: 1.8em;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 9999px;
  background: #fff;
  color: #000;
  font-size: 1em;
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 6px #0006;
  transition:
    background 0.2s ease-out,
    color 0.2s ease-out;

  &:hover {
    background: #f48c06;
    color: #fff;
  }
}
</style>
