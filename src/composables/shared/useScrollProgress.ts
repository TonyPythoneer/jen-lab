/**
 * useScrollProgress — turn an element's scroll position into a 0→1 number for
 * scroll-pinned (sticky) sections. It returns only the number; the consumer maps
 * it to any animation it likes. It never touches the DOM or sets styles.
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
