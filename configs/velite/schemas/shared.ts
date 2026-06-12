import { readFileSync } from "node:fs";
import { s } from "velite";

// velite's s.path() yields a slash-less path (e.g. "home/jen-knows"); prefix "/"
// so it matches the app's absolute routes (content/home/jen-knows.md -> /home/jen-knows).
export const prefixPath = <T extends { path: string }>(data: T): T => ({
  ...data,
  path: `/${data.path}`,
});

// Build-time icon validation. Lucide is the bundled set (see
// configs/vite/plugins/codegenIcons.ts), so a typo'd i-lucide-* name silently
// renders nothing — verify it exists in the pack and fail the build instead.
// Other sets (simple-icons, tdesign, ...) CDN-load at runtime and only get a format check.
const lucideIconSet = JSON.parse(
  readFileSync("node_modules/@iconify-json/lucide/icons.json", "utf8"),
) as { icons: Record<string, unknown>; aliases?: Record<string, unknown> };
const lucideNames = new Set([
  ...Object.keys(lucideIconSet.icons),
  ...Object.keys(lucideIconSet.aliases ?? {}),
]);

export const iconName = s.string().refine(
  (v) =>
    v.startsWith("i-lucide-")
      ? lucideNames.has(v.slice("i-lucide-".length))
      : /^i-[a-z0-9]+-[a-z0-9-]+$/.test(v) || /^[a-z0-9-]+:[a-z0-9-]+$/.test(v),
  (v) => ({
    message: `Unknown icon "${v}". For lucide, the name must exist in @iconify-json/lucide; otherwise use i-<set>-<name> or <set>:<name>.`,
  }),
);
