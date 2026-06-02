import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {}, // presence enables oxfmt's vite.config.ts integration — keep even if empty
  lint: { options: { typeAware: true, typeCheck: true } },
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
