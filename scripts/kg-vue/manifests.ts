// Reads the generated manifests (components.d.ts, auto-imports.d.ts,
// typed-router.d.ts) — the compile-time truth for edges auto-import hides from source.

// Matches `Name: typeof import('path')` in both components.d.ts and auto-imports.d.ts.
const DTS_IMPORT_RE = /(\w+):\s*typeof import\('([^']+)'\)/g;

export function parseDtsImports(content: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of content.matchAll(DTS_IMPORT_RE)) {
    if (m[1] && m[2]) out.set(m[1], m[2]);
  }
  return out;
}

const PAGE_KEY_RE = /^\s*'(src\/[^']+\.vue)':\s*\{/;
const SECTION_RE = /^\s*(routes|views|pathParamNames):/;
const UNION_RE = /^\s*\|\s*'([^']+)'/;

export function parseRouteFileInfo(content: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let currentPage: string | null = null;
  let section: string | null = null;
  for (const line of content.split("\n")) {
    const page = line.match(PAGE_KEY_RE);
    if (page?.[1]) {
      currentPage = page[1];
      section = null;
      out.set(currentPage, []);
      continue;
    }
    const sec = line.match(SECTION_RE);
    if (sec?.[1]) {
      section = sec[1];
      continue;
    }
    const union = line.match(UNION_RE);
    if (union?.[1] && currentPage && section === "routes" && union[1] !== "never") {
      out.get(currentPage)!.push(union[1]);
    }
  }
  return out;
}

export function normalizeDtsPath(p: string): string {
  return p.replace(/^\.\//, "");
}

// Resolve a manifest path (e.g. "./src/composables/x" or "./src/.../X.vue") to a real file.
export function resolveManifestPath(
  p: string,
  fileExists: (rel: string) => boolean,
): string | null {
  const base = normalizeDtsPath(p);
  if (fileExists(base)) return base; // already had an extension (.vue)
  for (const ext of [".ts", ".vue", ".js", "/index.ts"]) {
    if (fileExists(base + ext)) return base + ext;
  }
  return null;
}
