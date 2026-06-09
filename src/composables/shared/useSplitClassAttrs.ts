// Split $attrs into `parentClass` (the caller's `class`, merged via cn so it is
// not applied twice) and `restAttrs` (everything else, forwarded to the root).
// Shared by App* components that set `inheritAttrs: false`.
export function useSplitClassAttrs() {
  const attrs = useAttrs();
  const parentClass = computed(() => (attrs.class as string) ?? "");
  const restAttrs = computed(() =>
    Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class")),
  );
  return { parentClass, restAttrs };
}
