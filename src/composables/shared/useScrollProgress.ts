/**
 * 0→1 progress for a scroll-pinned (sticky) section. `target` is the TALL outer
 * wrapper (the runway), not the sticky child that pins inside it:
 *
 * ```vue
 * <section ref="wrap" class="h-[200vh]">
 *   <div class="sticky top-0 h-screen"><slot /></div>
 * </section>
 * ```
 *
 * sticky silently breaks if any ancestor sets overflow; progress is 0 until mount.
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
