import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  // typeAware/typeCheck disabled: Nuxt generates tsconfig refs under .nuxt/,
  // vp's standalone tsc can't resolve them. Use `nuxt typecheck` instead.
  lint: { options: { typeAware: false, typeCheck: false } },
  // Mirror the build-time constant injected by nuxt.config.ts so importing
  // wpApi.ts doesn't hit an undefined `__WP_BASE__`.
  define: {
    __WP_BASE__: JSON.stringify("https://example.test/wp-json/wp/v2"),
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
      "@": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
});
