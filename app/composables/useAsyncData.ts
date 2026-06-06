// Replacements for Nuxt's useAsyncData / useLazyAsyncData. Keyed dedup cache so
// the same key (e.g. "site:blogs" used in the layout AND pages) runs once.
// Sync handlers (Velite content) resolve immediately so they prerender; async
// handlers (WordPress fetch) resolve on the client.
import { ref, type Ref } from "vue";

interface AsyncDataOptions<T> {
  immediate?: boolean;
  default?: () => T;
  transform?: (input: unknown) => T;
  server?: boolean;
  getCachedData?: () => T | null | undefined;
  watch?: unknown[];
}

export interface AsyncData<T> {
  data: Ref<T | null>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  status: Ref<"idle" | "pending" | "success" | "error">;
  refresh: () => Promise<void>;
  execute: () => Promise<void>;
}

const cache = new Map<string, unknown>();

function create<T>(
  key: string,
  handler: () => T | Promise<T>,
  options: AsyncDataOptions<T> = {},
): AsyncData<T> {
  const data = ref<T | null>(options.default ? options.default() : null) as Ref<T | null>;
  const pending = ref(false);
  const error = ref<Error | null>(null);
  const status = ref<"idle" | "pending" | "success" | "error">("idle");

  const apply = (raw: unknown) => (options.transform ? options.transform(raw) : (raw as T));

  async function execute() {
    pending.value = true;
    status.value = "pending";
    error.value = null;
    try {
      const result = apply(await handler());
      data.value = result;
      cache.set(key, result);
      status.value = "success";
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      status.value = "error";
    } finally {
      pending.value = false;
    }
  }

  // Skip on server when caller opted out of SSR execution.
  if (import.meta.env.SSR && options.server === false) {
    return { data, pending, error, status, refresh: execute, execute };
  }

  // Custom cache lookup (e.g. per-page result cache in blog list).
  const customCached = options.getCachedData?.();
  if (customCached !== null && customCached !== undefined) {
    data.value = customCached;
    status.value = "success";
    return { data, pending, error, status, refresh: execute, execute };
  }

  if (cache.has(key)) {
    data.value = cache.get(key) as T;
    status.value = "success";
  } else if (options.immediate !== false) {
    const raw = handler();
    if (raw instanceof Promise) {
      execute(); // async (WordPress) — resolves on the client
    } else {
      const result = apply(raw); // sync (Velite) — set now so it prerenders
      data.value = result;
      cache.set(key, result);
      status.value = "success";
    }
  }

  return { data, pending, error, status, refresh: execute, execute };
}

export function useAsyncData<T>(
  key: string,
  handler: () => T | Promise<T>,
  options?: AsyncDataOptions<T>,
) {
  return create(key, handler, options);
}

export function useLazyAsyncData<T>(
  key: string,
  handler: () => T | Promise<T>,
  options?: AsyncDataOptions<T>,
) {
  return create(key, handler, options);
}
