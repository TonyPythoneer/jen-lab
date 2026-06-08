import { readFileSync, writeFileSync } from "node:fs";
import type { RawDeployment } from "./fetch-deployments";

// main is the live production domain; develop is the long-lived staging preview.
const DEFAULT_PROTECTED = ["main", "develop"];
// GitHub's hard comment limit is 65536 chars; stay comfortably under it.
const DEFAULT_MAX_CHARS = 60000;
const UNKNOWN_BRANCH = "(unknown)";
// Keep one commit title on one line so the tree stays scannable.
const MSG_MAX = 60;

export type TreeOpts = {
  // ISO timestamp used for the "X ago" math — passed in so the function is pure.
  generatedAt: string;
  protectedBranches?: string[];
  maxChars?: number;
};

// ISO date -> sortable number. Missing/bad dates sort oldest.
function toTime(createdOn?: string): number {
  const t = createdOn ? Date.parse(createdOn) : Number.NaN;
  return Number.isNaN(t) ? 0 : t;
}

function statusIcon(status?: string): string {
  if (status === "success") return "✅";
  if (status === "failure") return "❌";
  return "🏗️";
}

// ISO -> "2026-06-08 08:10" (drop seconds and the T).
function stamp(iso?: string): string {
  return (iso ?? "").slice(0, 16).replace("T", " ");
}

function relativeAge(createdOn: string | undefined, nowMs: number): string {
  const t = toTime(createdOn);
  if (!t || !nowMs) return "unknown";
  const mins = Math.floor(Math.max(0, nowMs - t) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Render one branch as a self-contained tree block with valid ├─/└─ connectors.
function renderBranch(branch: string, list: RawDeployment[], nowMs: number): string {
  const alias = list[0]?.aliases?.[0] ?? "—";
  const lines = ["", `📦 ${branch} · alias: ${alias} · ${list.length} deployments`];
  list.forEach((d, i) => {
    const last = i === list.length - 1;
    const tee = last ? "  └─" : "  ├─";
    const cont = last ? "        " : "  │     ";
    const icon = statusIcon(d.latest_stage?.status);
    const hash = (d.deployment_trigger?.metadata?.commit_hash ?? "").slice(0, 7) || "(no hash)";
    const msg = truncate(
      (d.deployment_trigger?.metadata?.commit_message ?? "").split("\n")[0] ?? "",
      MSG_MAX,
    );
    const env = d.environment === "production" ? "prod" : "preview";
    const when = `${relativeAge(d.created_on, nowMs)} (${stamp(d.created_on)})`;
    lines.push(`${tee} ${icon} ${hash}  ${msg} · ${env} · ${when}`);
    if (d.url) lines.push(`${cont}${d.url}`);
  });
  return lines.join("\n");
}

export function renderDeploymentTree(deployments: RawDeployment[], opts: TreeOpts): string {
  const protectedBranches = opts.protectedBranches ?? DEFAULT_PROTECTED;
  const maxChars = opts.maxChars ?? DEFAULT_MAX_CHARS;
  const nowMs = toTime(opts.generatedAt);

  // Group by branch, newest deployment first within each branch.
  const groups = new Map<string, RawDeployment[]>();
  for (const d of deployments) {
    const branch = d.deployment_trigger?.metadata?.branch ?? UNKNOWN_BRANCH;
    const list = groups.get(branch) ?? [];
    list.push(d);
    groups.set(branch, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => toTime(b.created_on) - toTime(a.created_on));
  }

  // Order branches: protected first (in given order), then by most recent.
  const order = new Map(protectedBranches.map((b, i) => [b, i]));
  const branches = [...groups.keys()].sort((a, b) => {
    const pa = order.get(a) ?? Number.POSITIVE_INFINITY;
    const pb = order.get(b) ?? Number.POSITIVE_INFINITY;
    if (pa !== pb) return pa - pb;
    return toTime(groups.get(b)![0]?.created_on) - toTime(groups.get(a)![0]?.created_on);
  });

  const header =
    `## 🚀 Cloudflare deployments — jen-lab\n\n` +
    `Total **${deployments.length}** deployments across **${branches.length}** branches. ` +
    `Generated ${stamp(opts.generatedAt)} UTC.\n`;

  if (deployments.length === 0) {
    return `${header}\n_No deployments found._`;
  }

  // Build branch blocks, then drop whole branches from the end until the body
  // fits. Dropping whole blocks keeps every branch's connectors valid.
  const entries = branches.map((b) => ({
    block: renderBranch(b, groups.get(b)!, nowMs),
    depCount: groups.get(b)!.length,
  }));

  let omittedBranches = 0;
  let omittedDeps = 0;
  const assemble = (kept: typeof entries): string => {
    const note =
      omittedBranches > 0
        ? `\n\n> … ${omittedBranches} branch(es) / ${omittedDeps} deployment(s) ` +
          `omitted (comment size limit) — full tree in the workflow artifact.`
        : "";
    return `${header}\n\`\`\`text\n${kept.map((e) => e.block).join("\n")}\n\`\`\`${note}`;
  };

  const kept = [...entries];
  while (kept.length > 1 && assemble(kept).length > maxChars) {
    const dropped = kept.pop()!;
    omittedBranches += 1;
    omittedDeps += dropped.depCount;
  }
  return assemble(kept);
}

// CLI: `node --experimental-strip-types scripts/github/render-deployment-tree.ts <json-file>`
// Prints the (size-capped) tree to stdout and writes the full tree to
// deployments-tree.md for upload as a workflow artifact.
if (process.argv[1]?.endsWith("render-deployment-tree.ts")) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("usage: render-deployment-tree.ts <json-file>");
    process.exit(1);
  }
  const deployments = JSON.parse(readFileSync(jsonPath, "utf8")) as RawDeployment[];
  const generatedAt = new Date().toISOString();
  writeFileSync(
    "deployments-tree.md",
    renderDeploymentTree(deployments, { generatedAt, maxChars: Number.POSITIVE_INFINITY }),
  );
  process.stdout.write(renderDeploymentTree(deployments, { generatedAt }));
}
