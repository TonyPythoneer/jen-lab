// kg:vue — inject source-true Vue edges into the understand-anything knowledge graph.
// Needs fresh manifests (run `pnpm dev` or `pnpm build` first; gated below).
//   pnpm kg:vue [--meta] [--dry-run] [--out dep-graph.json] [--kg <path>]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { buildDepGraph, injectVueEdges, type KnowledgeGraph } from "./graph";
import { enrichVueMeta } from "./vueMeta";

const MANIFESTS = ["components.d.ts", "auto-imports.d.ts", "typed-router.d.ts"];

// Newest mtime of any .vue/.ts under src/ — the bar the manifests must beat.
function newestSrcMtime(root: string): number {
  let newest = 0;
  const walk = (dirRel: string) => {
    for (const entry of readdirSync(join(root, dirRel))) {
      const rel = posix.join(dirRel, entry);
      const abs = join(root, rel);
      if (statSync(abs).isDirectory()) walk(rel);
      else if (/\.(vue|ts)$/.test(rel)) newest = Math.max(newest, statSync(abs).mtimeMs);
    }
  };
  walk("src");
  return newest;
}

// Hard precondition: a stale or missing manifest would feed the graph wrong
// auto-import edges, so abort loudly instead of producing a silently-wrong graph.
function assertManifestsFresh(root: string): void {
  const missing = MANIFESTS.filter((m) => !existsSync(join(root, m)));
  if (missing.length > 0) {
    fail(
      `missing manifest(s): ${missing.join(", ")} — run \`pnpm dev\` or \`pnpm build\` once, then retry.`,
    );
  }
  const newestSrc = newestSrcMtime(root);
  const stale = MANIFESTS.filter((m) => statSync(join(root, m)).mtimeMs < newestSrc);
  if (stale.length > 0) {
    fail(
      `stale manifest(s): ${stale.join(", ")} are older than src/ — run \`pnpm dev\` or \`pnpm build\` once, then retry.`,
    );
  }
}

// Climb until a sibling .understand-anything/knowledge-graph.json appears —
// worktrees under .claude/worktrees/* climb out to the main checkout.
function findKgPath(start: string): string | null {
  let dir = start;
  for (;;) {
    const candidate = join(dir, ".understand-anything", "knowledge-graph.json");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function fail(msg: string): never {
  console.error(`kg:vue: ${msg}`);
  process.exit(1);
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

// Tell the user how to actually read the freshly-injected graph with
// understand-anything. The example lines are ready to paste into /understand-chat.
function printUsageHint(withMeta: boolean): void {
  const lines = [
    "",
    "kg:vue: the graph now holds the Vue relationships auto-import hid. Explore them:",
    "",
    "  /understand-dashboard   see the new edges (components → composables → routes) in the graph",
    "  /understand-chat        ask across the new edges. Try:",
    '      • "Which components render Button.vue?"        (depends_on edges)',
    '      • "What composables does the food map use?"    (calls edges)',
    '      • "What renders on the / route?"               (serves edges)',
    "  /understand-explain <file>   deep-dive one file using its edges" +
      (withMeta ? " + typed props/emits" : ""),
    "",
    withMeta
      ? "  Typed props/emits/slots are on each component node (vueMeta). They show in" +
        ' chat/explain — not the dashboard UI yet. Ask: "What props does FilterButton accept?"'
      : "  Tip: re-run `pnpm kg:vue --meta` to add typed props/emits/slots to every component node.",
  ];
  console.log(lines.join("\n"));
}

function main(): void {
  const args = process.argv.slice(2);
  const withMeta = args.includes("--meta");
  const dryRun = args.includes("--dry-run");
  const outPath = getFlagValue(args, "--out");
  const kgOverride = getFlagValue(args, "--kg");
  const root = process.cwd();

  assertManifestsFresh(root);

  const dep = buildDepGraph(root);
  console.log(
    `kg:vue: scanned ${dep.files.length} files → ${dep.edges.length} edges, ${dep.routes.length} routes`,
  );

  if (outPath) {
    writeFileSync(join(root, outPath), JSON.stringify(dep, null, 2));
    console.log(`kg:vue: wrote debug graph → ${outPath}`);
  }

  const kgPath = kgOverride ? resolve(root, kgOverride) : findKgPath(root);
  if (!kgPath || !existsSync(kgPath)) {
    fail("no knowledge-graph.json found — run `/understand` first (or pass --kg <path>).");
  }

  const graph = JSON.parse(readFileSync(kgPath, "utf8")) as KnowledgeGraph;
  const report = injectVueEdges(graph, dep);
  let metaLine = "";
  if (withMeta) {
    const er = enrichVueMeta(graph, root);
    metaLine = `, ${er.enriched} nodes enriched (${er.failed} failed)`;
  }

  if (!dryRun) {
    writeFileSync(kgPath, JSON.stringify(graph, null, 2));
  }

  console.log(
    `kg:vue: ${dryRun ? "[dry-run] " : ""}+${report.edgesAdded} edges, +${report.routesAdded} routes, ` +
      `+${report.nodesCreated} nodes, ${report.edgesSkippedDup} skipped as duplicate${metaLine}`,
  );
  console.log(`kg:vue: ${dryRun ? "would update" : "updated"} ${kgPath}`);

  if (!dryRun) printUsageHint(withMeta);
}

main();
