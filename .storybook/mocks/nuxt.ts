import { ref } from "vue";

// Minimal stand-ins for Nuxt composables. Storybook has no Nuxt runtime,
// so these return just enough shape for components to render.
export const useRoute = () => ({
  path: "/",
  fullPath: "/",
  name: "index",
  params: {} as Record<string, string>,
  query: {} as Record<string, string>,
  hash: "",
  meta: {} as Record<string, unknown>,
  matched: [] as unknown[],
});
export const useRouter = () => ({
  push: async () => {},
  replace: async () => {},
  back: () => {},
  forward: () => {},
});
export const useRuntimeConfig = () => ({ public: {} as Record<string, unknown> });
export const useState = <T>(_key: string, init?: () => T) => ref(init ? init() : undefined);
export const useLazyAsyncData = <T>(_key: string, handler?: () => Promise<T> | T) => {
  const data = ref<T | null>(null);
  void Promise.resolve(handler?.()).then((v) => (data.value = (v as T) ?? null));
  return {
    data,
    pending: ref(false),
    error: ref(null),
    status: ref("success"),
    refresh: async () => {},
  };
};
export const useAsyncData = useLazyAsyncData;
export const navigateTo = async () => {};
export const useHead = () => {};
export const useSeoMeta = () => {};
