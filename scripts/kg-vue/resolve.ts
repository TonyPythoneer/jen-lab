// Resolves an import specifier to a repo-relative path, mirroring vite.config.ts
// resolve.alias. Bare npm specifiers return null — external, not a project edge.
import { posix } from "node:path";

// Known virtual aliases → fixed generated targets (see vite.config.ts resolve.alias).
const ALIAS_TARGETS: Record<string, string> = {
  "#velite": "generated/velite/index.js",
  "#food-map-data": "generated/velite/foodMap.json",
};

const RESOLVE_EXTS = [".ts", ".vue", ".js", ".json", "/index.ts", "/index.js"];

export function resolveSpecifier(
  spec: string,
  fromFileRel: string,
  fileExists: (rel: string) => boolean,
): string | null {
  if (ALIAS_TARGETS[spec]) return ALIAS_TARGETS[spec];

  let base: string;
  if (spec === "~") base = "src";
  else if (spec.startsWith("~/")) base = "src/" + spec.slice(2);
  else if (spec.startsWith("./") || spec.startsWith("../")) {
    base = posix.normalize(posix.join(posix.dirname(fromFileRel), spec));
  } else {
    return null; // bare npm specifier — external, not a project edge
  }

  if (/\.\w+$/.test(base) && fileExists(base)) return base;
  for (const ext of RESOLVE_EXTS) {
    if (fileExists(base + ext)) return base + ext;
  }
  return null;
}
