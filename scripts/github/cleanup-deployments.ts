import { readFileSync, writeFileSync } from "node:fs";

export type Deployment = {
  id?: string;
  created_on?: string;
  // "production" | "preview" — set by Cloudflare on every deployment.
  environment?: string;
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

// Deployments with no branch metadata are grouped here for the report. They are
// still eligible for the production-environment keep below.
const UNKNOWN_BRANCH = "(unknown)";

// Turn an ISO date into a sortable number. Missing/bad dates sort oldest.
function toTime(createdOn?: string): number {
  const t = createdOn ? Date.parse(createdOn) : Number.NaN;
  return Number.isNaN(t) ? 0 : t;
}

const byNewest = (a: Deployment, b: Deployment) => toTime(b.created_on) - toTime(a.created_on);

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
  // Decide which deployment ids to KEEP. Everything else is deleted.
  const keepIds = new Set<string>();

  // 1. The newest production deployment is the live `main` build. Protect it by
  //    environment, not branch name, so it survives even when a deployment is
  //    missing branch metadata (e.g. a CI deploy made in detached HEAD).
  const newestProd = deployments
    .filter((d) => d.environment === "production" && typeof d.id === "string")
    .sort(byNewest)[0];
  if (newestProd?.id) keepIds.add(newestProd.id);

  // 2. The newest deployment of each protected branch (e.g. develop's preview).
  for (const branch of protectedBranches) {
    const newestOfBranch = deployments
      .filter((d) => d.deployment_trigger?.metadata?.branch === branch && typeof d.id === "string")
      .sort(byNewest)[0];
    if (newestOfBranch?.id) keepIds.add(newestOfBranch.id);
  }

  const toDelete = deployments
    .map((d) => d.id)
    .filter((id): id is string => typeof id === "string" && !keepIds.has(id));

  // Group by branch for the human-readable report.
  const groups = new Map<string, Deployment[]>();
  for (const d of deployments) {
    const branch = d.deployment_trigger?.metadata?.branch ?? UNKNOWN_BRANCH;
    const list = groups.get(branch) ?? [];
    list.push(d);
    groups.set(branch, list);
  }

  const rows: BranchRow[] = [];
  for (const [branch, list] of groups) {
    const kept = list.filter((d) => typeof d.id === "string" && keepIds.has(d.id));
    const keptNewest = [...kept].sort(byNewest)[0];
    rows.push({
      branch,
      total: list.length,
      kept: kept.length,
      // total always equals kept + deleted, even for malformed entries with no id.
      deleted: list.length - kept.length,
      keptId: keptNewest?.id,
      keptDate: keptNewest?.created_on,
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
