// Single source for the pieces the app build and Storybook must agree on.
// Imported by vite.config.ts AND .storybook/vite.config.ts — edit here, never copy.

// ui/<category>/<Name>.vue → bare <Name>. unplugin-vue-components strips EVERY
// folder segment listed here, so ui/overlay/Modal.vue resolves to <Modal>.
// Categories MUST mirror Nuxt UI's component taxonomy — file every ui/
// component under the Nuxt UI category it belongs to (element, navigation,
// overlay, page, utility). Do NOT invent per-component folders or new categories.
export const uiGlobalNamespaces = ["ui", "element", "navigation", "overlay", "page", "utility"];

// Auto-imported API sources. Storybook mirrors these so story code and app code
// resolve the same composables from the same packages. Typed as the preset-name
// literals + imports-map shape unplugin-auto-import accepts.
export const autoImportPresets: (
  | "vue"
  | "vue-router"
  | "@vueuse/core"
  | Record<string, string[]>
)[] = [
  "vue",
  "vue-router",
  "@vueuse/core",
  { "@unhead/vue": ["useHead", "useSeoMeta", "useHeadSafe"] },
];
