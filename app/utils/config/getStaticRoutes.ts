import { readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

// Derive the set of valid static routes from app/pages/ at config-load time.
// Used by the content:file:afterParse hook to validate nav URLs in header.yml.
export function getStaticRoutes(pagesDir: string): Set<string> {
  const routes = new Set<string>();
  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (extname(entry) !== ".vue") continue;
      const rel = relative(pagesDir, full).replace(/\\/g, "/");
      // Skip dynamic segments — they can't appear in a static nav list.
      if (rel.includes("[")) continue;
      // Drop ".vue" and any "index" leaf so the root index.vue maps to "/".
      // "index.vue" → "/", "blogs/index.vue" → "/blogs", "about.vue" → "/about".
      const path = rel.replace(/\.vue$/, "").replace(/(^|\/)index$/, "");
      routes.add("/" + path);
    }
  }
  walk(pagesDir);
  return routes;
}

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const routes = getStaticRoutes(join(ROOT, "app/pages"));
export const VALID_ROUTES = Array.from(routes);
