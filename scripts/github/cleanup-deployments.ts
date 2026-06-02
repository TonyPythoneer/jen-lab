import { readFileSync, writeFileSync } from "node:fs";

export type Deployment = {
  id?: string;
  created_on?: string;
  deployment_trigger?: { metadata?: { branch?: string } };
};

export type BranchRow = {
  branch: string;
  total: number;
  kept: number;
  deleted: number;
  keptId?: string;
  keptDate?: string;
};

export type CleanupReport = {
  total: number;
  deletedCount: number;
  rows: BranchRow[];
  protectedBranches: string[];
};

// Deployments with no branch metadata land here; never protected.
const UNKNOWN_BRANCH = "(unknown)";

// Turn an ISO date into a sortable number. Missing/bad dates sort oldest.
function toTime(createdOn?: string): number {
  const t = createdOn ? Date.parse(createdOn) : Number.NaN;
  return Number.isNaN(t) ? 0 : t;
}

// Protected branches first (in the order given), then the rest by most deleted.
function sortRows(rows: BranchRow[], protectedBranches: string[]): void {
  const order = new Map(protectedBranches.map((b, i) => [b, i]));
  rows.sort((a, b) => {
    const pa = order.get(a.branch) ?? Number.POSITIVE_INFINITY;
    const pb = order.get(b.branch) ?? Number.POSITIVE_INFINITY;
    if (pa !== pb) return pa - pb;
    return b.deleted - a.deleted;
  });
}

export function planCleanup(
  deployments: Deployment[],
  protectedBranches: string[],
): { toDelete: string[]; report: CleanupReport } {
  // Group every deployment under its branch name.
  const groups = new Map<string, Deployment[]>();
  for (const d of deployments) {
    const branch = d.deployment_trigger?.metadata?.branch ?? UNKNOWN_BRANCH;
    const list = groups.get(branch) ?? [];
    list.push(d);
    groups.set(branch, list);
  }

  const protectedSet = new Set(protectedBranches);
  const toDelete: string[] = [];
  const rows: BranchRow[] = [];

  for (const [branch, list] of groups) {
    // Newest first so the protected branch keeps its latest build.
    const sorted = [...list].sort((a, b) => toTime(b.created_on) - toTime(a.created_on));
    const isProtected = protectedSet.has(branch);
    const keep = isProtected ? sorted.slice(0, 1) : [];
    const drop = isProtected ? sorted.slice(1) : sorted;

    const dropIds = drop.map((d) => d.id).filter((id): id is string => typeof id === "string");
    toDelete.push(...dropIds);

    const kept = keep[0];
    rows.push({
      branch,
      total: list.length,
      kept: keep.length,
      deleted: dropIds.length,
      keptId: kept?.id,
      keptDate: kept?.created_on,
    });
  }

  sortRows(rows, protectedBranches);

  return {
    toDelete,
    report: {
      total: deployments.length,
      deletedCount: toDelete.length,
      rows,
      protectedBranches,
    },
  };
}

export function renderReport(report: CleanupReport): string {
  const lines: string[] = [
    "## Cloudflare deployment cleanup",
    "",
    `You had a total of **${report.total}** deployments in Cloudflare. The detail was the following:`,
    "",
    "| Branch | Total | Kept | Deleted |",
    "| ------ | ----- | ---- | ------- |",
  ];
  for (const r of report.rows) {
    lines.push(`| ${r.branch} | ${r.total} | ${r.kept} | ${r.deleted} |`);
  }
  lines.push("", "---", "", "Except the branches:");
  for (const branch of report.protectedBranches) {
    const row = report.rows.find((r) => r.branch === branch);
    lines.push(
      row?.keptId
        ? `- \`${branch}\` → kept latest deployment \`${row.keptId}\` (${row.keptDate})`
        : `- \`${branch}\` → no deployments found`,
    );
  }
  lines.push("", `So, we have deleted **${report.deletedCount}** deployments.`);
  return lines.join("\n");
}

// CLI: `node --experimental-strip-types scripts/github/cleanup-deployments.ts <json-file> <protected-branch...>`
// Writes ids.txt (one id per line) and report.md (the rendered message).
if (process.argv[1]?.endsWith("cleanup-deployments.ts")) {
  const [, , jsonPath, ...protectedBranches] = process.argv;
  if (!jsonPath || protectedBranches.length === 0) {
    console.error("usage: cleanup-deployments.ts <json-file> <protected-branch...>");
    process.exit(1);
  }
  const deployments = JSON.parse(readFileSync(jsonPath, "utf8")) as Deployment[];
  const { toDelete, report } = planCleanup(deployments, protectedBranches);
  writeFileSync("ids.txt", toDelete.length ? `${toDelete.join("\n")}\n` : "");
  writeFileSync("report.md", renderReport(report));
}
