// App data layer: keyed async data with a dedup cache, so the same key (e.g.
// "site:blogs", used in the layout AND the blog pages) runs once. Sync handlers
// (Velite content) resolve immediately so they prerender into the SSG HTML;
// async handlers (WordPress fetch) resolve on the client.
import { ref, watch, type Ref } from "vue";

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
      // Async handler (e.g. WordPress fetch): drive through execute so status
      // transitions to pending → success/error and data.value is updated.
      pending.value = true;
      status.value = "pending";
      raw
        .then((v) => {
          data.value = apply(v);
          cache.set(key, data.value);
          status.value = "success";
        })
        .catch((e) => {
          error.value = e instanceof Error ? e : new Error(String(e));
          status.value = "error";
        })
        .finally(() => {
          pending.value = false;
        });
    } else {
      const result = apply(raw); // sync (Velite) — set now so it prerenders
      data.value = result;
      cache.set(key, result);
      status.value = "success";
    }
  }

  // Re-fetch when any watched source changes.
  if (!import.meta.env.SSR && options.watch?.length) {
    watch(options.watch as Parameters<typeof watch>[0], () => {
      const cached = options.getCachedData?.();
      if (cached !== null && cached !== undefined) {
        data.value = cached;
        status.value = "success";
        return;
      }
      execute();
    });
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
