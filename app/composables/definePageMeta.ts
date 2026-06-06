// No-op shim: replaces Nuxt's compiler macro in vite-ssg.
// Runtime call is harmless; layout: false is handled via the <route> block.
export function definePageMeta(_meta: Record<string, unknown>): void {}
