// v2 enrichment: type-resolved props/emits/slots from vue-component-meta (Volar's
// engine). This is the one thing the manifests + compiler-sfc AST cannot do —
// e.g. Button's `color?: ButtonVariants["color"]` only expands to
// "primary" | "neutral" | "secondary" when a real type-checker reads it.
//
// Expensive: createChecker builds a full TS program over tsconfig (~the cost of
// `vue-tsc --noEmit`), so this runs only behind --meta, never by default.
import { join } from "node:path";
import { createChecker } from "vue-component-meta";
import type { KnowledgeGraph } from "./graph";

export type EnrichReport = { enriched: number; failed: number };

const TYPE_CAP = 300;

function cap(s: string): string {
  return s.length > TYPE_CAP ? s.slice(0, TYPE_CAP) + "…" : s;
}

// Enriches every `.vue` file node already in the graph with a `vueMeta` field.
// Node schema is passthrough, so this survives the plugin's load/save round-trip.
export function enrichVueMeta(graph: KnowledgeGraph, root: string): EnrichReport {
  const report: EnrichReport = { enriched: 0, failed: 0 };
  // schema:false keeps the checker from expanding deep unions (e.g. RouteLocationRaw)
  // into giant trees — the single biggest perf and noise lever.
  const checker = createChecker(join(root, "tsconfig.json"), { schema: false });

  for (const node of graph.nodes) {
    if (node.type !== "file" || !node.filePath?.endsWith(".vue")) continue;
    try {
      const meta = checker.getComponentMeta(join(root, node.filePath));
      node.vueMeta = {
        props: meta.props
          .filter((p) => !p.global)
          .map((p) => ({
            name: p.name,
            type: cap(p.type),
            required: p.required,
            ...(p.default !== undefined ? { default: cap(p.default) } : {}),
          })),
        emits: meta.events.map((e) => ({ name: e.name, signature: cap(e.signature) })),
        slots: meta.slots.map((s) => ({ name: s.name, type: cap(s.type) })),
        generatedBy: "kg:vue",
      };
      report.enriched++;
    } catch {
      report.failed++; // one bad SFC must not abort the whole enrichment pass
    }
  }

  return report;
}
