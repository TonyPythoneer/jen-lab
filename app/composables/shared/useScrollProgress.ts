/**
 * useScrollProgress — turn an element's scroll position into a 0→1 number.
 *
 * ## What it's for
 * Drives "scroll-pinned" (sticky scrollytelling) sections: a tall outer
 * wrapper provides scroll runway while an inner panel stays `position: sticky`.
 * As the runway scrolls past, this composable reports how far through the pin
 * you are (0 = just pinned, 1 = about to release) so the consumer can map that
 * to any animation it likes (translate, opacity, scale, …).
 *
 * It only returns a number. It does NOT touch the DOM, set styles, or assume a
 * particular animation — that mapping stays in the consuming component, which is
 * the part that changes per use case.
 *
 * ## Required DOM shape
 * The `target` must be the TALL outer wrapper, not the sticky child:
 *
 * ```vue
 * <section ref="wrap" class="h-[200vh]">          <!-- target: the runway -->
 *   <div class="sticky top-0 h-screen">           <!-- pins while runway scrolls -->
 *     <slot />
 *   </div>
 * </section>
 * ```
 *
 * ## Usage
 * ```ts
 * const wrap = useTemplateRef<HTMLElement>("wrap");
 * const { progress } = useScrollProgress(wrap);
 * const style = computed(() => ({ opacity: 1 - progress.value }));
 * ```
 *
 * ## Caveats
 * - `position: sticky` silently breaks if ANY ancestor sets
 *   `overflow: hidden | auto | scroll`. Keep the scroll chain clean.
 * - `progress` is 0 during SSR and until the element mounts (bounding box reads
 *   as 0), so design the rest-state to look correct at progress 0.
 * - The math assumes the sticky child is roughly viewport-tall. If it's much
 *   shorter/taller, progress 1 won't line up exactly with the pin releasing.
 *
 * @param target  Ref/getter to the tall outer wrapper element.
 * @returns `{ progress }` — a readonly computed clamped to [0, 1].
 */
export function useScrollProgress(target: MaybeRefOrGetter<HTMLElement | null>) {
  // `top` is the wrapper's distance from the viewport top (positive above the
  // fold, negative once scrolled past). `height` is the wrapper's full height.
  // useElementBounding re-reads both on scroll/resize, so they stay live.
  const { top, height } = useElementBounding(target);

  // Viewport height: the portion of the wrapper that is NOT scroll runway
  // (it's filled by the pinned child at any moment).
  const { height: viewportH } = useWindowSize();

  const progress = computed(() => {
    // Runway = how many pixels of scrolling happen while the child is pinned.
    // wrapperHeight - viewportHeight. If the wrapper isn't taller than the
    // viewport there's nothing to pin, so progress is flat 0.
    const runway = height.value - viewportH.value;
    if (runway <= 0) return 0;

    // -top grows from 0 (wrapper top at viewport top) to `runway` (wrapper
    // fully scrolled through). Dividing maps that span onto 0→1, clamped so
    // values before/after the pin window stay at the ends.
    return Math.min(Math.max(-top.value / runway, 0), 1);
  });

  return { progress };
}
