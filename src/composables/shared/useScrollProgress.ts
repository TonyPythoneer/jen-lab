/**
 * Turns a scroll-pinned (sticky) section's scroll position into a 0→1 progress
 * number. Returns only the number — it never touches the DOM or sets styles.
 *
 * `target` must be the TALL outer wrapper (the scroll runway), not the sticky
 * child that pins inside it:
 *
 * ```vue
 * <section ref="wrap" class="h-[200vh]">
 *   <div class="sticky top-0 h-screen"><slot /></div>
 * </section>
 * ```
 *
 * Caveats: `position: sticky` silently breaks if ANY ancestor sets overflow;
 * progress is 0 during SSR and until mount, so the rest-state must look correct
 * at 0; the math assumes the sticky child is roughly viewport-tall.
 */
export function useScrollProgress(target: MaybeRefOrGetter<HTMLElement | null>) {
  const { top, height } = useElementBounding(target);
  const { height: viewportH } = useWindowSize();

  const progress = computed(() => {
    // Runway = pixels scrolled while the child is pinned; -top covers 0→runway.
    const runway = height.value - viewportH.value;
    if (runway <= 0) return 0;
    return Math.min(Math.max(-top.value / runway, 0), 1);
  });

  return { progress };
}
