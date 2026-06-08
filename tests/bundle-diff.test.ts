import { describe, it, expect } from "vite-plus/test";
import { diffBundles, renderMarkdown } from "../scripts/github/bundle-diff";

const base = [
  { page: "index.html", totalGz: 10240, htmlGz: 5120 },
  { page: "blogs.html", totalGz: 20480, htmlGz: 3072 },
  { page: "old.html", totalGz: 5120, htmlGz: 1024 },
];
const current = [
  { page: "index.html", totalGz: 11264, htmlGz: 5632 }, // assets +1KB, html +0.5KB
  { page: "blogs.html", totalGz: 20480, htmlGz: 3072 },
  { page: "new.html", totalGz: 4096, htmlGz: 2048 },
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

  it("tracks HTML size as a separate dimension", () => {
    const d = diffBundles(base, current);
    const index = d.rows.find((r) => r.page === "index.html")!;
    expect(index.htmlCur).toBe(5632);
    expect(index.htmlDelta).toBe(512);
    // Total delta sums every page like the assets total does:
    // current (5632+3072+2048) − base (5120+3072+1024) = 1536.
    expect(d.htmlDeltaTotal).toBe(1536);
  });

  it("leaves htmlDelta null when the baseline predates the HTML column", () => {
    const d = diffBundles(
      [{ page: "a.html", totalGz: 1000 }],
      [{ page: "a.html", totalGz: 1000, htmlGz: 800 }],
    );
    const a = d.rows.find((r) => r.page === "a.html")!;
    expect(a.htmlCur).toBe(800);
    expect(a.htmlDelta).toBeNull();
    expect(d.htmlDeltaTotal).toBeNull();
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

  it("renders an HTML column with its own delta", () => {
    const md = renderMarkdown(diffBundles(base, current), opts);
    expect(md).toContain("| Page | Base | New | Δ | Δ% | HTML |");
    const indexLine = md.split("\n").find((l) => l.includes("index.html"))!;
    expect(indexLine).toContain("5.5KB (+0.5KB)"); // HTML grew while assets diff stays separate
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
