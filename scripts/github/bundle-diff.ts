// Renders a markdown bundle-size diff for a deploy comment: each page's gzipped
// total with delta + percent vs a baseline, plus the deployed commit line.
// CLI: jiti scripts/github/bundle-diff.ts <base.json> <current.json>
//   env: BASE_REF, DEPLOY_SHA, DEPLOY_MSG, REPO
import { readFileSync } from "node:fs";

export interface Row {
  page: string;
  totalGz: number;
}

export interface DiffRow {
  page: string;
  base: number | null;
  cur: number | null;
  delta: number | null;
  pct: number | null;
  mark: "" | "🆕" | "➖";
}

export interface Diff {
  rows: DiffRow[];
  baseTotal: number;
  curTotal: number;
  delta: number;
  pct: number | null;
  verdict: "🟢" | "🟡" | "🔴";
  hasBaseline: boolean;
}

// Pure: join a baseline report against the current one. base === null means the
// baseline build was unavailable (cache/build miss) — show current sizes only.
export function diffBundles(base: Row[] | null, current: Row[]): Diff {
  const hasBaseline = base !== null;
  const baseMap = new Map((base ?? []).map((r) => [r.page, r.totalGz]));
  const curMap = new Map(current.map((r) => [r.page, r.totalGz]));

  const rows: DiffRow[] = [];
  for (const page of new Set([...baseMap.keys(), ...curMap.keys()])) {
    const b = baseMap.has(page) ? baseMap.get(page)! : null;
    const c = curMap.has(page) ? curMap.get(page)! : null;
    let mark: DiffRow["mark"] = "";
    if (hasBaseline && b === null) mark = "🆕";
    else if (c === null) mark = "➖";
    const delta = b !== null && c !== null ? c - b : null;
    const pct = delta !== null && b ? (delta / b) * 100 : null;
    rows.push({ page, base: b, cur: c, delta, pct, mark });
  }
  // Biggest current page first; removed pages (no current size) sink to the end.
  rows.sort((x, y) => (y.cur ?? -1) - (x.cur ?? -1));

  const sum = (m: Map<string, number>) => [...m.values()].reduce((a, n) => a + n, 0);
  const baseTotal = sum(baseMap);
  const curTotal = sum(curMap);
  const delta = curTotal - baseTotal;
  const pct = hasBaseline && baseTotal ? (delta / baseTotal) * 100 : null;

  let verdict: Diff["verdict"] = "🟢";
  if (hasBaseline) {
    if (pct !== null && pct > 10) verdict = "🔴";
    else if (rows.some((r) => r.pct !== null && r.pct > 5)) verdict = "🟡";
  }
  return { rows, baseTotal, curTotal, delta, pct, verdict, hasBaseline };
}

const kb = (n: number) => (n / 1024).toFixed(1) + "KB";
const signed = (n: number) => (n >= 0 ? "+" : "") + kb(n);
const signedPct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

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
  lines.push("| Page | Base | New | Δ | Δ% |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  for (const r of diff.rows) {
    const page = r.mark ? `${r.mark} ${r.page}` : r.page;
    const moved = r.delta !== null && r.delta !== 0;
    lines.push(
      `| ${page} | ${r.base !== null ? kb(r.base) : "—"} | ${r.cur !== null ? kb(r.cur) : "—"} | ${moved ? signed(r.delta!) : "—"} | ${moved && r.pct !== null ? signedPct(r.pct) : "—"} |`,
    );
  }
  const moved = diff.hasBaseline && diff.delta !== 0;
  lines.push(
    `| **Total** | ${kb(diff.baseTotal)} | ${kb(diff.curTotal)} | ${moved ? `**${signed(diff.delta)}**` : "—"} | ${moved && diff.pct !== null ? `**${signedPct(diff.pct)}**` : "—"} |`,
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
