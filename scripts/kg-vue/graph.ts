// Builds the Vue dependency graph (manifests + compiler-sfc AST) and upserts it
// into the understand-anything knowledge-graph.json in the plugin's node/edge shape.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { parseDtsImports, parseRouteFileInfo, resolveManifestPath } from "./manifests";
import { resolveSpecifier } from "./resolve";
import { extractFromTs, extractFromVue } from "./sfc";

// Internal model, before mapping onto the knowledge graph.
export type DepEdgeKind = "import" | "component" | "composable";
export type DepEdge = { from: string; to: string; kind: DepEdgeKind };
export type RouteEdge = { page: string; route: string };
export type DepGraph = { files: string[]; edges: DepEdge[]; routes: RouteEdge[] };

const SCAN_EXT = /\.(vue|ts)$/;

function walkSrc(dirRel: string, root: string, out: string[]): void {
  for (const entry of readdirSync(join(root, dirRel))) {
    const rel = posix.join(dirRel, entry);
    if (statSync(join(root, rel)).isDirectory()) walkSrc(rel, root, out);
    else if (SCAN_EXT.test(rel)) out.push(rel);
  }
}

export function buildDepGraph(root: string): DepGraph {
  const read = (rel: string) => readFileSync(join(root, rel), "utf8");
  const fileExists = (rel: string) => existsSync(join(root, rel));

  // Dictionaries from the generated manifests.
  const components = new Map<string, string>(); // PascalCase tag -> file
  for (const [name, p] of parseDtsImports(read("components.d.ts"))) {
    const file = resolveManifestPath(p, fileExists);
    if (file) components.set(name, file);
  }
  const composables = new Map<string, string>(); // auto-imported name -> file
  for (const [name, p] of parseDtsImports(read("auto-imports.d.ts"))) {
    if (!p.startsWith("./src") && !p.startsWith("~")) continue; // skip npm globals
    const file = resolveManifestPath(p, fileExists);
    if (file) composables.set(name, file);
  }
  const routeInfo = parseRouteFileInfo(read("typed-router.d.ts"));

  const files: string[] = [];
  walkSrc("src", root, files);
  files.sort();

  const edges: DepEdge[] = [];
  const seen = new Set<string>();
  const add = (from: string, to: string, kind: DepEdgeKind) => {
    if (!to || from === to) return;
    const key = `${from}|${to}|${kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to, kind });
  };

  for (const file of files) {
    const content = read(file);
    const ex = file.endsWith(".vue") ? extractFromVue(content, file) : extractFromTs(content);

    for (const spec of ex.importSpecs) {
      const target = resolveSpecifier(spec, file, fileExists);
      if (target) add(file, target, "import");
    }
    for (const name of ex.componentNames) {
      const target = components.get(name);
      if (target) add(file, target, "component");
    }
    for (const name of ex.composableCandidates) {
      const target = composables.get(name);
      if (target) add(file, target, "composable");
    }
  }

  const routes: RouteEdge[] = [];
  for (const [page, routeList] of routeInfo) {
    for (const route of routeList) routes.push({ page, route });
  }

  return { files, edges, routes };
}

// ---- Knowledge-graph upsert ----

type KgNode = {
  id: string;
  type: string;
  name: string;
  filePath?: string;
  summary: string;
  tags: string[];
  complexity: string;
  [k: string]: unknown;
};
type KgEdge = {
  source: string;
  target: string;
  type: string;
  direction: string;
  description?: string;
  weight: number;
  [k: string]: unknown;
};
export type KnowledgeGraph = { nodes: KgNode[]; edges: KgEdge[]; [k: string]: unknown };

export type InjectReport = {
  edgesAdded: number;
  edgesSkippedDup: number;
  nodesCreated: number;
  routesAdded: number;
};

// Prefix on every injected edge's `description`, so re-runs replace exactly their
// own edges. Must live in a schema-valid field — custom fields get stripped on load.
export const KG_VUE_MARKER = "[kg:vue]";

const KIND_TO_EDGE: Record<DepEdgeKind, { type: string; weight: number }> = {
  import: { type: "imports", weight: 0.6 },
  component: { type: "depends_on", weight: 0.8 },
  composable: { type: "calls", weight: 0.7 },
};

function fileId(rel: string): string {
  return `file:${rel}`;
}
function baseName(rel: string): string {
  return rel.slice(rel.lastIndexOf("/") + 1);
}

function minimalFileNode(rel: string): KgNode {
  return {
    id: fileId(rel),
    type: "file",
    name: baseName(rel),
    filePath: rel,
    summary: "Indexed by kg:vue (no LLM summary yet).",
    tags: ["kg:vue"],
    complexity: "simple",
  };
}

export function injectVueEdges(graph: KnowledgeGraph, dep: DepGraph): InjectReport {
  const report: InjectReport = {
    edgesAdded: 0,
    edgesSkippedDup: 0,
    nodesCreated: 0,
    routesAdded: 0,
  };

  // 1. Idempotency — drop any edge we wrote on a previous run.
  graph.edges = graph.edges.filter((e) => !e.description?.startsWith(KG_VUE_MARKER));

  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const ensureNode = (rel: string) => {
    const id = fileId(rel);
    if (!nodeIds.has(id)) {
      graph.nodes.push(minimalFileNode(rel));
      nodeIds.add(id);
      report.nodesCreated++;
    }
  };

  // Existing (source,target,type) pairs — never double-draw an edge the LLM has.
  const edgeKey = (s: string, t: string, ty: string) => `${s}|${t}|${ty}`;
  const existing = new Set(graph.edges.map((e) => edgeKey(e.source, e.target, e.type)));

  // 2. File→file edges (imports / depends_on / calls).
  for (const e of dep.edges) {
    const map = KIND_TO_EDGE[e.kind];
    const source = fileId(e.from);
    const target = fileId(e.to);
    const key = edgeKey(source, target, map.type);
    if (existing.has(key)) {
      report.edgesSkippedDup++;
      continue;
    }
    ensureNode(e.from);
    ensureNode(e.to);
    const description =
      e.kind === "component"
        ? `${KG_VUE_MARKER} renders ${baseName(e.to)} (components.d.ts)`
        : e.kind === "composable"
          ? `${KG_VUE_MARKER} uses ${baseName(e.to)} (auto-imports.d.ts)`
          : `${KG_VUE_MARKER} imports ${baseName(e.to)}`;
    graph.edges.push({
      source,
      target,
      type: map.type,
      direction: "forward",
      weight: map.weight,
      description,
    });
    existing.add(key);
    report.edgesAdded++;
  }

  // 3. Route→page edges as `serves` from the page file to an endpoint node.
  for (const r of dep.routes) {
    ensureNode(r.page);
    const endpointId = `endpoint:${r.page}:${r.route}`;
    if (!nodeIds.has(endpointId)) {
      graph.nodes.push({
        id: endpointId,
        type: "endpoint",
        name: r.route,
        filePath: r.page,
        summary: `Route ${r.route} served by ${baseName(r.page)}.`,
        tags: ["route", "kg:vue"],
        complexity: "simple",
      });
      nodeIds.add(endpointId);
      report.nodesCreated++;
    }
    const source = fileId(r.page);
    const key = edgeKey(source, endpointId, "serves");
    if (existing.has(key)) {
      report.edgesSkippedDup++;
      continue;
    }
    graph.edges.push({
      source,
      target: endpointId,
      type: "serves",
      direction: "forward",
      weight: 0.7,
      description: `${KG_VUE_MARKER} serves route ${r.route}`,
    });
    existing.add(key);
    report.routesAdded++;
  }

  return report;
}
