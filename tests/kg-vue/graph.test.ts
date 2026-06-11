import { existsSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import {
  buildDepGraph,
  injectVueEdges,
  KG_VUE_MARKER,
  type DepGraph,
  type KnowledgeGraph,
} from "../../scripts/kg-vue/graph";

function baseGraph(): KnowledgeGraph {
  return {
    nodes: [
      {
        id: "file:src/a.vue",
        type: "file",
        name: "a.vue",
        filePath: "src/a.vue",
        summary: "the a component",
        tags: [],
        complexity: "simple",
      },
    ],
    edges: [],
  };
}

const dep: DepGraph = {
  files: ["src/a.vue", "src/b.vue"],
  edges: [{ from: "src/a.vue", to: "src/b.vue", kind: "component" }],
  routes: [{ page: "src/pages/index.vue", route: "/" }],
};

describe("injectVueEdges", () => {
  it("creates a node for an edge target missing from the graph", () => {
    const g = baseGraph();
    injectVueEdges(g, dep);
    const created = g.nodes.find((n) => n.id === "file:src/b.vue");
    expect(created).toBeTruthy();
    expect(created?.tags).toContain("kg:vue");
  });

  it("marks every injected edge with the kg:vue description prefix", () => {
    const g = baseGraph();
    injectVueEdges(g, dep);
    const injected = g.edges.filter((e) => e.description?.startsWith(KG_VUE_MARKER));
    expect(injected.length).toBeGreaterThan(0);
    expect(g.edges.every((e) => e.description?.startsWith(KG_VUE_MARKER))).toBe(true);
  });

  it("is idempotent — running twice equals running once", () => {
    const once = baseGraph();
    injectVueEdges(once, dep);

    const twice = baseGraph();
    injectVueEdges(twice, dep);
    injectVueEdges(twice, dep);

    expect(twice).toEqual(once);
  });

  it("does not duplicate an edge the LLM already drew", () => {
    const g = baseGraph();
    g.edges.push({
      source: "file:src/a.vue",
      target: "file:src/b.vue",
      type: "depends_on",
      direction: "forward",
      weight: 0.9,
    });
    const report = injectVueEdges(g, dep);
    const matches = g.edges.filter(
      (e) =>
        e.source === "file:src/a.vue" && e.target === "file:src/b.vue" && e.type === "depends_on",
    );
    expect(matches.length).toBe(1);
    expect(report.edgesSkippedDup).toBeGreaterThan(0);
  });

  it("adds a serves edge to an endpoint node for each route", () => {
    const g = baseGraph();
    injectVueEdges(g, dep);
    const endpoint = g.nodes.find((n) => n.id === "endpoint:src/pages/index.vue:/");
    expect(endpoint?.type).toBe("endpoint");
    const serves = g.edges.find((e) => e.type === "serves" && e.target === endpoint?.id);
    expect(serves?.source).toBe("file:src/pages/index.vue");
  });
});

const HAS_MANIFESTS =
  existsSync("components.d.ts") &&
  existsSync("auto-imports.d.ts") &&
  existsSync("typed-router.d.ts");

describe.skipIf(!HAS_MANIFESTS)("buildDepGraph (integration, real repo)", () => {
  const g = buildDepGraph(process.cwd());

  it("produces a non-empty graph", () => {
    expect(g.files.length).toBeGreaterThan(50);
    expect(g.edges.length).toBeGreaterThan(50);
  });

  it("captures an auto-import component edge to Button.vue", () => {
    const hit = g.edges.some(
      (e) => e.kind === "component" && e.to === "src/components/ui/element/Button.vue",
    );
    expect(hit).toBe(true);
  });

  it("has no self-edges", () => {
    expect(g.edges.every((e) => e.from !== e.to)).toBe(true);
  });
});
