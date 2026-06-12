// Split $attrs into parentClass (the caller's class, merged via cn — never applied
// twice) and restAttrs (forwarded). For components with inheritAttrs:false.
export function useSplitClassAttrs() {
  const attrs = useAttrs();
  const parentClass = computed(() => (attrs.class as string) ?? "");
  const restAttrs = computed(() =>
    Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class")),
  );
  return { parentClass, restAttrs };
}
