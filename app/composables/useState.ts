// Replacement for Nuxt's useState — keyed global ref store. Single render per
// route during SSG, so no cross-request pollution concern.
import { ref, type Ref } from "vue";

const states = new Map<string, Ref<unknown>>();

export function useState<T>(key: string, init?: () => T): Ref<T> {
  if (!states.has(key)) states.set(key, ref(init ? init() : undefined) as Ref<unknown>);
  return states.get(key) as Ref<T>;
}
