import { describe, it, expect } from "vite-plus/test";
import { diffBundles, renderMarkdown } from "../scripts/bundle-diff";

const base = [
  { page: "index.html", totalGz: 10240 },
  { page: "blogs.html", totalGz: 20480 },
  { page: "old.html", totalGz: 5120 },
];
const current = [
  { page: "index.html", totalGz: 11264 },
  { page: "blogs.html", totalGz: 20480 },
  { page: "new.html", totalGz: 4096 },
];

describe("diffBundles", () => {
  it("computes per-page delta and percent", () => {
    const d = diffBundles(base, current);
    const index = d.rows.find((r) => r.page === "index.html")!;
    expect(index.delta).toBe(1024);
    expect(index.pct).toBeCloseTo(10, 5);
  });

  it("marks new and removed pages", () => {
    const d = diffBundles(base, current);
    expect(d.rows.find((r) => r.page === "new.html")!.mark).toBe("🆕");
    expect(d.rows.find((r) => r.page === "old.html")!.mark).toBe("➖");
  });

  it("sums totals and flags >+5% page as 🟡", () => {
    const d = diffBundles(base, current);
    expect(d.verdict).toBe("🟡");
  });

  it("flags >+10% total as 🔴", () => {
    const d = diffBundles([{ page: "a.html", totalGz: 1000 }], [{ page: "a.html", totalGz: 1200 }]);
    expect(d.verdict).toBe("🔴");
  });

  it("is 🟢 when nothing moved much", () => {
    const d = diffBundles([{ page: "a.html", totalGz: 1000 }], [{ page: "a.html", totalGz: 1010 }]);
    expect(d.verdict).toBe("🟢");
  });

  it("handles a missing baseline (current-only)", () => {
    const d = diffBundles(null, current);
    expect(d.hasBaseline).toBe(false);
    expect(d.verdict).toBe("🟢");
    expect(d.rows.find((r) => r.page === "index.html")!.delta).toBeNull();
  });
});

describe("renderMarkdown", () => {
  const opts = {
    baseRef: "develop",
    deploySha: "a1b2c3d4e5f6",
    deployMsg: "fix: thing",
    repo: "TonyPythoneer/jen-lab",
  };

  it("renders the commit link, heading verdict, and a total row", () => {
    const md = renderMarkdown(diffBundles(base, current), opts);
    expect(md).toContain("📦 Bundle size 🟡 vs `develop`");
    expect(md).toContain(
      "[`a1b2c3d`](https://github.com/TonyPythoneer/jen-lab/commit/a1b2c3d4e5f6) — fix: thing",
    );
    expect(md).toContain("| **Total** |");
    expect(md).toContain("🆕 new.html");
  });

  it("shows the baseline-unavailable note when there is no baseline", () => {
    const md = renderMarkdown(diffBundles(null, current), opts);
    expect(md).toContain("baseline unavailable");
  });

  it("renders unchanged rows as a dash", () => {
    const md = renderMarkdown(diffBundles(base, current), opts);
    const blogsLine = md.split("\n").find((l) => l.includes("blogs.html"))!;
    expect(blogsLine).toContain("| — | — |");
  });
});
