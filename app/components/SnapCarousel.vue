<script setup lang="ts" generic="T extends Record<string, unknown>">
/**
 * SnapCarousel — lightweight horizontal carousel built on native CSS scroll-snap.
 * ============================================================================
 *
 * Why not embla / UCarousel
 * -------------------------
 * The JS-driven embla path adds resize observers, RAF animation loops, and a
 * state machine that introduces perceptible click latency on lower-end devices
 * (~150–250 ms per arrow click). This component leans on the platform:
 *
 *   `overflow-x: auto` + `scroll-snap-type` + `scrollBy({ behavior: 'smooth' })`
 *
 * The browser handles the smooth animation, the snap alignment, the touch
 * dragging, and the keyboard / wheel scroll for free. Per-frame cost when
 * idle is essentially zero.
 *
 *
 * Visual goals
 * ------------
 * Reproducing the Caldera-style blog row, where:
 *   - The carousel viewport spans the full window (extends past the page's
 *     1200 px content container on both sides).
 *   - The *snapped* card aligns flush with the parent container's inner
 *     left edge (same vertical line as the section heading).
 *   - The preceding card peeks in from the bleed zone on the left and is
 *     visibly clipped by the viewport edge.
 *
 *      viewport ┃ container                                            ┃ viewport
 *               ┃← peek →┃                                             ┃
 *      [prev   ]┃[snapped card] [next card] [next card] [next card  ]→┃[next…]
 *                ↑
 *                snap target = container's inner left edge
 *
 *
 * Three layered mechanisms
 * ------------------------
 * 1. **Bleed wrapper (CSS):** `margin-{left,right}: calc(50% - 50vw)` pulls
 *    the track to the viewport edges regardless of how narrow the parent
 *    container is. Toggle via the `bleed` prop.
 *
 * 2. **Peek (`scroll-padding-left`):** tells the snap engine to land card
 *    starts at this offset from the viewport's left edge, so the snapped
 *    card aligns with the container's inner left edge instead of the
 *    viewport edge. Configured via the `peek` prop (CSS length string,
 *    typically a `calc()` matching the parent container geometry).
 *
 * 3. **Infinite loop (JS, light):**
 *      a. Items are rendered ×3 (`renderItems` computed) so the user can
 *         scroll freely in either direction without ever hitting an end.
 *      b. On mount, `scrollLeft` is anchored to the middle copy's snap
 *         point (`oneSetWidth() - peekPx()`).
 *      c. **Pre-emptive wrap** in `scrollPrev` / `scrollNext`: before the
 *         smooth scroll runs, if the target position would cross into copy
 *         1 or copy 3, the function instant-jumps `scrollLeft` by ±oneSet
 *         first so the smooth animation itself stays inside the middle/
 *         adjacent copy. Without this, scrolling left from the first
 *         visible card would animate the full width of the previous copy
 *         (the "big rewind" effect) before the scrollend wrap fired.
 *      d. **Safety-net wrap** via `scrollend` listener catches native swipe
 *         / wheel scrolls that bypass `scrollPrev` / `scrollNext`. Fires
 *         after smooth scroll settles in modern Chrome / Firefox / Safari 18+.
 *
 *
 * Arrow controls
 * --------------
 * This component renders NO arrow UI of its own. The consumer wires its
 * own buttons by template-ref-ing the component and calling the exposed
 * `scrollPrev()` / `scrollNext()` methods. This keeps the visual chrome
 * (button shape, position, dividers, hover styles) entirely up to the
 * consumer's design vocabulary.
 *
 *
 * Common hand-edits
 * -----------------
 *   - Tighter / looser inter-card gap → change the `gap` prop (px).
 *   - Different card widths → override `itemClass` (Tailwind `basis-*`).
 *   - Disable loop → pass `:loop="false"`. Component falls through to a
 *     plain scroll-snap row; arrows will eventually hit the natural end.
 *   - Disable bleed (carousel stays inside parent padding) → `:bleed="false"`.
 *   - Different snap alignment → adjust the `peek` prop's CSS expression.
 *     Set `peek="0px"` (default) to snap to the viewport's left edge.
 *   - Add dots / active-index indicator → expose `activeIndex` via
 *     `defineExpose`. Compute via an IntersectionObserver inside the track
 *     (1 observer, threshold 0.5, modulo `items.length`). Not added by
 *     default because the Caldera-style consumer doesn't need it.
 */

const props = withDefaults(
  defineProps<{
    /** Source items rendered into each slot. */
    items: T[];
    /**
     * Render items ×3 + pre-emptive wrap + scrollend safety net. Default on.
     * When off, component behaves as a plain finite scroll-snap row.
     */
    loop?: boolean;
    /**
     * Apply `margin-{left,right}: calc(50% - 50vw)` so the track escapes
     * the parent container's horizontal padding and spans the viewport.
     * Default on. Disable to keep the carousel inside the container.
     */
    bleed?: boolean;
    /**
     * Class applied to each card wrapper `<article>`. Owns the responsive
     * basis (card width per breakpoint). Override per consumer.
     */
    itemClass?: string;
    /**
     * Gap between cards in px. Mirrored into `gap` CSS and into
     * `cardStride()` so the JS scroll math stays in sync.
     */
    gap?: number;
    /**
     * CSS length applied as `scroll-padding-left` so snap targets land at
     * this offset from the carousel viewport's left edge. Combined with
     * `bleed`, this aligns the snapped card with a parent container's
     * inner edge while the preceding card overflows into the bleed zone.
     *
     * Example for a centred `max-w-[1200px] px-4` container:
     *   peek="max(1rem, calc((100vw - 1200px) / 2 + 1rem))"
     *
     * Set "0px" (default) to snap flush with the viewport's left edge.
     */
    peek?: string;
  }>(),
  {
    loop: true,
    bleed: true,
    itemClass: "basis-[80%] sm:basis-[55%] md:basis-[38%] lg:basis-[28%] xl:basis-[24%]",
    gap: 10,
    peek: "0px",
  },
);

defineSlots<{
  default(props: { item: T; index: number }): unknown;
}>();

// Template ref to the scrolling element. All scroll math reads/writes through
// `track.value`; consumers do NOT touch it directly.
const track = ref<HTMLDivElement | null>(null);

/**
 * When `loop` is on, render the source list three times back-to-back. The
 * three copies are visually indistinguishable from each other; the loop logic
 * exploits that to silently jump `scrollLeft` between copies without the user
 * noticing. When `loop` is off, render the source list as-is.
 */
const renderItems = computed<T[]>(() =>
  props.loop ? [...props.items, ...props.items, ...props.items] : props.items,
);

/**
 * Width of one card + the inter-card gap, in px. Used as the unit for arrow
 * scrolls (`scrollBy(±cardStride)`) and as the building block of
 * `oneSetWidth()`. Reads the first `<article>` in the DOM, so it relies on
 * all cards being the same width (true given `shrink-0` + uniform basis).
 */
function cardStride(): number {
  const card = track.value?.querySelector("article");
  return (card?.offsetWidth ?? 0) + props.gap;
}

/**
 * Width of one full copy of the source list in px = stride × item count.
 * Equals the distance in `scrollLeft` between identical cards across two
 * adjacent copies, which is exactly what the loop wrap jumps by.
 */
function oneSetWidth(): number {
  return cardStride() * props.items.length;
}

/**
 * Resolved `scroll-padding-left` in px. We read the computed style because
 * the consumer can pass `peek` as any CSS length (px / rem / calc / max),
 * but the wrap thresholds and the initial anchor need an exact pixel value
 * to compare against `scrollLeft`. Re-evaluated on every call so it stays
 * correct across viewport resizes.
 */
function peekPx(): number {
  const el = track.value;
  if (!el) return 0;
  const v = getComputedStyle(el).scrollPaddingLeft;
  return parseFloat(v) || 0;
}

/**
 * Scroll left by one card.
 *
 * Pre-emptive wrap (only when `loop` is on):
 *   - The middle copy's "safe zone" of `scrollLeft` starts at
 *     `oneSetWidth - peekPx` (where the middle copy's first card snaps).
 *   - If the target position (`scrollLeft - stride`) would land before
 *     that safe zone, we'd otherwise animate into copy 1's tail — visually
 *     a long rewind across the whole carousel width.
 *   - Instead, instant-jump `scrollLeft += oneSet` first. That puts us at
 *     the equivalent position in the third copy (same content, invisible
 *     teleport). The smooth scrollBy then runs from inside the third copy
 *     back by one card. User perceives a single card-width slide.
 *
 * The `- stride / 2` half-card slack handles the case where snap settled
 * slightly off the exact anchor (e.g. due to native swipe).
 */
function scrollPrev(): void {
  const el = track.value;
  if (!el) return;
  const stride = cardStride();
  if (props.loop && props.items.length) {
    const set = oneSetWidth();
    const anchor = set - peekPx();
    if (el.scrollLeft - stride < anchor - stride / 2) {
      el.scrollLeft += set;
    }
  }
  el.scrollBy({ left: -stride, behavior: "smooth" });
}

/**
 * Scroll right by one card. Mirror of `scrollPrev`.
 *
 * Pre-emptive wrap (only when `loop` is on):
 *   - The middle copy ends at `scrollLeft = anchor + oneSet - stride`
 *     (where the last middle-copy card snaps).
 *   - If the target (`scrollLeft + stride`) would land beyond that, we'd
 *     animate into copy 3's lead.
 *   - Instant-jump `scrollLeft -= oneSet` first → same content in copy 1,
 *     smooth scroll forward by one card stays inside the safe zone.
 */
function scrollNext(): void {
  const el = track.value;
  if (!el) return;
  const stride = cardStride();
  if (props.loop && props.items.length) {
    const set = oneSetWidth();
    const anchor = set - peekPx();
    if (el.scrollLeft + stride > anchor + set - stride / 2) {
      el.scrollLeft -= set;
    }
  }
  el.scrollBy({ left: stride, behavior: "smooth" });
}

/**
 * Safety-net wrap, fired by the `scrollend` event.
 *
 * `scrollPrev` / `scrollNext` already pre-empt the boundary, but native
 * swipe / wheel / keyboard scrolls don't go through them. After any such
 * scroll settles, this listener detects if the user ended up inside copy 1
 * or copy 3 and silently re-anchors back into the middle copy by jumping
 * `scrollLeft` ±oneSet. Same invisible-teleport trick as the pre-emptive
 * wrap: equivalent cards in adjacent copies hold identical content.
 *
 * `scrollend` is well-supported (Chrome / Firefox / Safari 18.2+). Older
 * browsers won't get the safety net, but the natural ends of the ×3 list
 * still let the user scroll quite far before noticing.
 */
function wrap(): void {
  if (!props.loop) return;
  const el = track.value;
  if (!el || !props.items.length) return;
  const set = oneSetWidth();
  const anchor = set - peekPx();
  if (el.scrollLeft < anchor) el.scrollLeft += set;
  else if (el.scrollLeft >= anchor + set) el.scrollLeft -= set;
}

onMounted(() => {
  if (props.loop) {
    // Anchor `scrollLeft` to the middle copy's snap point so the preceding
    // card peeks from the left bleed zone and the user has equal room to
    // scroll left or right before the wrap kicks in.
    //
    // `watch(..., { immediate })` runs once on mount AND again whenever
    // `items` changes — covers the common case where items arrive from
    // an async fetch after the component first mounts.
    watch(
      () => props.items,
      () => {
        nextTick(() => {
          if (!track.value || !props.items.length) return;
          track.value.scrollLeft = oneSetWidth() - peekPx();
        });
      },
      { immediate: true, deep: true },
    );
  }
  track.value?.addEventListener("scrollend", wrap);
});

onBeforeUnmount(() => {
  track.value?.removeEventListener("scrollend", wrap);
});

defineExpose({ scrollPrev, scrollNext });
</script>

<template>
  <div
    ref="track"
    class="snap-carousel flex overflow-x-auto snap-x snap-mandatory"
    :class="bleed && 'snap-carousel-bleed'"
    :style="{ gap: `${gap}px`, scrollPaddingLeft: peek }"
  >
    <!--
      Each item is wrapped in <article snap-start shrink-0> so:
        - snap-start: scroll snap pins the card's left edge to the snap port
          (the carousel viewport with `scroll-padding-left` already applied).
        - shrink-0: cards don't compress when their summed width exceeds
          the carousel viewport.
        - `itemClass` brings the responsive basis (card width per breakpoint).
      `key` mixes the loop index + the item's `id` (or fallback to index) so
      the three copies don't collide in Vue's diff but identical content
      across copies still keys deterministically.
    -->
    <article
      v-for="(item, idx) in renderItems"
      :key="`${idx}-${String((item as Record<string, unknown>)?.id ?? idx)}`"
      class="snap-start shrink-0"
      :class="itemClass"
    >
      <slot :item="item" :index="idx % (items.length || 1)" />
    </article>
  </div>
</template>

<style scoped>
/*
 * Track styles:
 *   - `scrollbar-width: none` / `::-webkit-scrollbar { display: none }`
 *     hides the native horizontal scrollbar so the row reads as a clean
 *     edge-to-edge band. Scroll behaviour itself is untouched.
 *   - `scroll-behavior: smooth` is a safety net; the arrow handlers also
 *     pass `behavior: 'smooth'` to `scrollBy` for explicit control.
 */
.snap-carousel {
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.snap-carousel::-webkit-scrollbar {
  display: none;
}

/*
 * Bleed: pull the track out to the viewport's left/right edges regardless
 * of the parent container's width / padding. `calc(50% - 50vw)` resolves
 * to a negative value equal to half the difference between the parent's
 * width and the viewport, so the element extends symmetrically past both
 * sides. Works inside any centred container without knowing its width.
 */
.snap-carousel-bleed {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}
</style>
