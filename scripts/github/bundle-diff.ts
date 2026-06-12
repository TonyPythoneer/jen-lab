// Renders a markdown bundle-size diff for the deploy comment. Columns mirror the
// CLI bundle report; JS+CSS drives the verdict, HTML is informational.
// CLI: jiti scripts/github/bundle-diff.ts <base.json> <current.json>
//   env: BASE_REF, DEPLOY_SHA, DEPLOY_MSG, REPO
import { readFileSync } from "node:fs";

type Metric = "htmlGz" | "jsGz" | "cssGz" | "totalGz";

export interface Row {
  page: string;
  htmlGz?: number;
  jsGz?: number;
  cssGz?: number;
  totalGz: number; // JS + CSS (assets) — the metric the verdict tracks
}

export interface Cell {
  cur: number | null;
  delta: number | null; // null when there is no comparable baseline value
}

export interface DiffRow {
  page: string;
  mark: "" | "🆕" | "➖";
  html: Cell;
  js: Cell;
  css: Cell;
  total: Cell;
  pct: number | null; // this page's assets % change — drives the 🟡 flag
}

export interface Diff {
  rows: DiffRow[];
  totals: Record<"html" | "js" | "css" | "total", Cell>;
  pct: number | null; // overall assets % change — drives the 🔴 flag
  verdict: "🟢" | "🟡" | "🔴";
  hasBaseline: boolean;
}

const field = (r: Row | undefined, k: Metric): number | null => (r && r[k] != null ? r[k]! : null);

const makeCell = (b: Row | undefined, c: Row | undefined, k: Metric): Cell => {
  const cur = field(c, k);
  const base = field(b, k);
  return { cur, delta: base !== null && cur !== null ? cur - base : null };
};

// Pure: join a baseline report against the current one. base === null means the
// baseline build was unavailable (cache/build miss) — show current sizes only.
export function diffBundles(base: Row[] | null, current: Row[]): Diff {
  const hasBaseline = base !== null;
  const baseMap = new Map((base ?? []).map((r) => [r.page, r]));
  const curMap = new Map(current.map((r) => [r.page, r]));

  const rows: DiffRow[] = [];
  for (const page of new Set([...baseMap.keys(), ...curMap.keys()])) {
    const b = baseMap.get(page);
    const c = curMap.get(page);
    let mark: DiffRow["mark"] = "";
    if (hasBaseline && !b) mark = "🆕";
    else if (!c) mark = "➖";
    const total = makeCell(b, c, "totalGz");
    const base0 = field(b, "totalGz");
    const pct = total.delta !== null && base0 ? (total.delta / base0) * 100 : null;
    rows.push({
      page,
      mark,
      html: makeCell(b, c, "htmlGz"),
      js: makeCell(b, c, "jsGz"),
      css: makeCell(b, c, "cssGz"),
      total,
      pct,
    });
  }
  // Heaviest current page first; removed pages (no current size) sink to the end.
  rows.sort((x, y) => (y.total.cur ?? -1) - (x.total.cur ?? -1));

  // Column totals across every page, each with a delta when the baseline carries
  // that metric (a pre-column baseline has no html/js/css → those deltas stay null).
  const colTotal = (k: Metric): Cell => {
    const cur = [...curMap.values()].reduce((a, r) => a + (r[k] ?? 0), 0);
    const base0 = [...baseMap.values()].reduce((a, r) => a + (r[k] ?? 0), 0);
    const comparable = hasBaseline && [...baseMap.values()].some((r) => r[k] != null);
    return { cur, delta: comparable ? cur - base0 : null };
  };
  const totals = {
    html: colTotal("htmlGz"),
    js: colTotal("jsGz"),
    css: colTotal("cssGz"),
    total: colTotal("totalGz"),
  };
  const curTotalSum = totals.total.cur ?? 0;
  const baseTotalSum = totals.total.delta !== null ? curTotalSum - totals.total.delta : 0;
  const pct = baseTotalSum ? ((totals.total.delta ?? 0) / baseTotalSum) * 100 : null;

  let verdict: Diff["verdict"] = "🟢";
  if (hasBaseline) {
    if (pct !== null && pct > 10) verdict = "🔴";
    else if (rows.some((r) => r.pct !== null && r.pct > 5)) verdict = "🟡";
  }
  return { rows, totals, pct, verdict, hasBaseline };
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
const signed = (n: number) => (n >= 0 ? "+" : "") + kb(n);

// "12.8 KB" normally; "12.8 KB (+0.5 KB)" when it moved vs the baseline.
const fmt = (c: Cell, bold = false) => {
  if (c.cur === null) return "—";
  const size = bold ? `**${kb(c.cur)}**` : kb(c.cur);
  if (c.delta === null || c.delta === 0) return size;
  const d = bold ? `**${signed(c.delta)}**` : signed(c.delta);
  return `${size} (${d})`;
};

const name = (p: string) => p.replace(/\.html$/, "");

export interface RenderOpts {
  baseRef: string;
  deploySha: string;
  deployMsg: string;
  repo: string;
}

export function renderMarkdown(diff: Diff, opts: RenderOpts): string {
  const lines: string[] = [];
  lines.push(`### 📦 Bundle size ${diff.verdict} vs \`${opts.baseRef}\``);
  if (opts.deploySha) {
    const short = opts.deploySha.slice(0, 7);
    const link = `[\`${short}\`](https://github.com/${opts.repo}/commit/${opts.deploySha})`;
    lines.push(`Deployed ${link}${opts.deployMsg ? ` — ${opts.deployMsg}` : ""}`);
  }
  lines.push("");
  if (!diff.hasBaseline) {
    lines.push("> baseline unavailable — showing current sizes");
    lines.push("");
  }
  lines.push("| Page | HTML | JS | CSS | JS+CSS |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  for (const r of diff.rows) {
    const page = r.mark ? `${r.mark} ${name(r.page)}` : name(r.page);
    lines.push(`| ${page} | ${fmt(r.html)} | ${fmt(r.js)} | ${fmt(r.css)} | ${fmt(r.total)} |`);
  }
  const t = diff.totals;
  lines.push(
    `| **Total** | ${fmt(t.html)} | ${fmt(t.js)} | ${fmt(t.css)} | ${fmt(t.total, true)} |`,
  );
  lines.push("");
  lines.push("🟢 no significant change · 🟡 >+5% on a page · 🔴 >+10% total");
  return lines.join("\n");
}

if (process.argv[1]?.endsWith("bundle-diff.ts")) {
  const [basePath, curPath] = process.argv.slice(2);
  const read = (p?: string): Row[] | null => {
    if (!p) return null;
    try {
      return JSON.parse(readFileSync(p, "utf8")) as Row[];
    } catch {
      return null;
    }
  };
  const current = read(curPath);
  if (!current) {
    console.error("usage: bundle-diff.ts <base.json> <current.json>");
    process.exit(1);
  }
  process.stdout.write(
    renderMarkdown(diffBundles(read(basePath), current), {
      baseRef: process.env.BASE_REF || "base",
      deploySha: process.env.DEPLOY_SHA || "",
      deployMsg: process.env.DEPLOY_MSG || "",
      repo: process.env.REPO || "",
    }),
  );
}
