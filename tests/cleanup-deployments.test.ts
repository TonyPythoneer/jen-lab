import { describe, expect, it } from "vite-plus/test";
import { planCleanup, renderReport } from "../scripts/github/cleanup-deployments";

function dep(id: string, branch: string, createdOn: string) {
  return {
    id,
    created_on: createdOn,
    deployment_trigger: { metadata: { branch } },
  };
}

describe("planCleanup", () => {
  it("keeps only the newest deployment of a protected branch", () => {
    const deployments = [
      dep("m1", "main", "2026-01-01T00:00:00Z"),
      dep("m2", "main", "2026-02-01T00:00:00Z"),
      dep("m3", "main", "2026-03-01T00:00:00Z"),
    ];
    const { toDelete, report } = planCleanup(deployments, ["main", "develop"]);
    expect([...toDelete].sort()).toEqual(["m1", "m2"]);
    const main = report.rows.find((r) => r.branch === "main")!;
    expect(main.kept).toBe(1);
    expect(main.keptId).toBe("m3");
    expect(main.deleted).toBe(2);
  });

  it("deletes all deployments of a non-protected branch", () => {
    const deployments = [
      dep("f1", "feat/foo", "2026-01-01T00:00:00Z"),
      dep("f2", "feat/foo", "2026-02-01T00:00:00Z"),
    ];
    const { toDelete } = planCleanup(deployments, ["main", "develop"]);
    expect([...toDelete].sort()).toEqual(["f1", "f2"]);
  });

  it("handles empty input", () => {
    const { toDelete, report } = planCleanup([], ["main", "develop"]);
    expect(toDelete).toEqual([]);
    expect(report.total).toBe(0);
    expect(report.deletedCount).toBe(0);
  });

  it("does not throw on missing created_on or branch", () => {
    const deployments = [
      { id: "x1" },
      { id: "x2", deployment_trigger: { metadata: { branch: "main" } } },
    ];
    const { toDelete, report } = planCleanup(deployments, ["main"]);
    expect(toDelete).toEqual(["x1"]);
    expect(report.deletedCount).toBe(1);
  });

  it("reports correct totals and counts", () => {
    const deployments = [
      dep("m1", "main", "2026-01-01T00:00:00Z"),
      dep("m2", "main", "2026-02-01T00:00:00Z"),
      dep("d1", "develop", "2026-01-01T00:00:00Z"),
      dep("f1", "feat/foo", "2026-01-01T00:00:00Z"),
    ];
    const { report } = planCleanup(deployments, ["main", "develop"]);
    expect(report.total).toBe(4);
    expect(report.deletedCount).toBe(2);
  });
});

describe("renderReport", () => {
  it("renders the fixed message format", () => {
    const deployments = [
      dep("m1", "main", "2026-01-01T00:00:00Z"),
      dep("m2", "main", "2026-02-01T00:00:00Z"),
      dep("f1", "feat/foo", "2026-01-01T00:00:00Z"),
    ];
    const { report } = planCleanup(deployments, ["main", "develop"]);
    const md = renderReport(report);
    expect(md).toContain("You had a total of **3** deployments");
    expect(md).toContain("So, we have deleted **2** deployments.");
    expect(md).toContain("- `main` → kept latest deployment `m2`");
    expect(md).toContain("- `develop` → no deployments found");
  });
});
