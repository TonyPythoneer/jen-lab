import { describe, it, expect } from "vite-plus/test";
import { diffBundles, renderMarkdown } from "../scripts/github/bundle-diff";

// jsGz + cssGz === totalGz, like the real report rows.
const base = [
  { page: "index.html", htmlGz: 5120, jsGz: 8192, cssGz: 2048, totalGz: 10240 },
  { page: "blogs.html", htmlGz: 3072, jsGz: 16384, cssGz: 4096, totalGz: 20480 },
  { page: "old.html", htmlGz: 1024, jsGz: 4096, cssGz: 1024, totalGz: 5120 },
];
const current = [
  { page: "index.html", htmlGz: 5632, jsGz: 9216, cssGz: 2048, totalGz: 11264 }, // assets +1KB (+10%)
  { page: "blogs.html", htmlGz: 3072, jsGz: 16384, cssGz: 4096, totalGz: 20480 }, // unchanged
  { page: "new.html", htmlGz: 2048, jsGz: 2048, cssGz: 2048, totalGz: 4096 },
];

describe("diffBundles", () => {
  it("computes per-page assets delta and percent", () => {
    const index = diffBundles(base, current).rows.find((r) => r.page === "index.html")!;
    expect(index.total.delta).toBe(1024);
    expect(index.pct).toBeCloseTo(10, 5);
  });

  it("tracks every column (HTML/JS/CSS) with its own delta", () => {
    const index = diffBundles(base, current).rows.find((r) => r.page === "index.html")!;
    expect(index.html.delta).toBe(512);
    expect(index.js.delta).toBe(1024);
    expect(index.css.delta).toBe(0);
  });

  it("marks new and removed pages", () => {
    const d = diffBundles(base, current);
    expect(d.rows.find((r) => r.page === "new.html")!.mark).toBe("🆕");
    expect(d.rows.find((r) => r.page === "old.html")!.mark).toBe("➖");
  });

  it("sums each column into totals", () => {
    const t = diffBundles(base, current).totals;
    // current (5632+3072+2048) − base (5120+3072+1024) = 1536
    expect(t.html.delta).toBe(1536);
    expect(t.total.cur).toBe(35840);
  });

  it("flags >+5% page as 🟡", () => {
    expect(diffBundles(base, current).verdict).toBe("🟡");
  });

  it("flags >+10% overall total as 🔴", () => {
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
    expect(d.rows.find((r) => r.page === "index.html")!.total.delta).toBeNull();
  });

  it("leaves deltas null when the baseline predates the HTML/JS/CSS columns", () => {
    const d = diffBundles(
      [{ page: "a.html", totalGz: 1000 }],
      [{ page: "a.html", htmlGz: 800, jsGz: 800, cssGz: 200, totalGz: 1000 }],
    );
    const a = d.rows.find((r) => r.page === "a.html")!;
    expect(a.html.cur).toBe(800);
    expect(a.html.delta).toBeNull(); // baseline had no htmlGz to compare
    expect(d.totals.html.delta).toBeNull();
  });
});

describe("renderMarkdown", () => {
  const opts = {
    baseRef: "develop",
    deploySha: "a1b2c3d4e5f6",
    deployMsg: "fix: thing",
    repo: "TonyPythoneer/jen-lab",
  };

  it("renders the commit link, verdict, the report's columns, and a total row", () => {
    const md = renderMarkdown(diffBundles(base, current), opts);
    expect(md).toContain("📦 Bundle size 🟡 vs `develop`");
    expect(md).toContain(
      "[`a1b2c3d`](https://github.com/TonyPythoneer/jen-lab/commit/a1b2c3d4e5f6) — fix: thing",
    );
    expect(md).toContain("| Page | HTML | JS | CSS | JS+CSS |");
    expect(md).toContain("| **Total** |");
    expect(md).toContain("🆕 new"); // .html stripped, like the report
  });

  it("appends a delta only to cells that moved", () => {
    const md = renderMarkdown(diffBundles(base, current), opts);
    const indexLine = md.split("\n").find((l) => l.startsWith("| index "))!;
    expect(indexLine).toContain("(+1.0 KB)"); // JS and JS+CSS moved
    const blogsLine = md.split("\n").find((l) => l.startsWith("| blogs "))!;
    expect(blogsLine).not.toContain("("); // unchanged row → plain sizes, no deltas
  });

  it("shows the baseline-unavailable note when there is no baseline", () => {
    const md = renderMarkdown(diffBundles(null, current), opts);
    expect(md).toContain("baseline unavailable");
  });
});
