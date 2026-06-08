// Renders a markdown bundle-size diff for a deploy comment: each page's gzipped
// JS+CSS ("assets") with delta + percent vs a baseline, a separate HTML column
// (the prerendered document's own gzipped size), and the deployed commit line.
// Assets are the number to keep DOWN — the verdict watches them. HTML is
// expected to GROW as content moves out of JS into prerendered markup, so it is
// informational only and never drives the verdict.
// CLI: jiti scripts/github/bundle-diff.ts <base.json> <current.json>
//   env: BASE_REF, DEPLOY_SHA, DEPLOY_MSG, REPO
import { readFileSync } from "node:fs";

export interface Row {
  page: string;
  totalGz: number; // JS + CSS (assets) — the metric the verdict tracks
  htmlGz?: number; // prerendered .html doc size; absent on pre-HTML-column baselines
}

export interface DiffRow {
  page: string;
  base: number | null;
  cur: number | null;
  delta: number | null;
  pct: number | null;
  htmlCur: number | null;
  htmlDelta: number | null;
  mark: "" | "🆕" | "➖";
}

export interface Diff {
  rows: DiffRow[];
  baseTotal: number;
  curTotal: number;
  delta: number;
  pct: number | null;
  htmlCurTotal: number;
  htmlDeltaTotal: number | null;
  verdict: "🟢" | "🟡" | "🔴";
  hasBaseline: boolean;
}

// Pure: join a baseline report against the current one. base === null means the
// baseline build was unavailable (cache/build miss) — show current sizes only.
export function diffBundles(base: Row[] | null, current: Row[]): Diff {
  const hasBaseline = base !== null;
  const baseMap = new Map((base ?? []).map((r) => [r.page, r]));
  const curMap = new Map(current.map((r) => [r.page, r]));

  const rows: DiffRow[] = [];
  for (const page of new Set([...baseMap.keys(), ...curMap.keys()])) {
    const bRow = baseMap.get(page);
    const cRow = curMap.get(page);
    const b = bRow ? bRow.totalGz : null;
    const c = cRow ? cRow.totalGz : null;
    let mark: DiffRow["mark"] = "";
    if (hasBaseline && b === null) mark = "🆕";
    else if (c === null) mark = "➖";
    const delta = b !== null && c !== null ? c - b : null;
    const pct = delta !== null && b ? (delta / b) * 100 : null;

    // HTML is a separate dimension. A baseline that predates the HTML column has
    // no htmlGz, so htmlDelta stays null (show the current size without a delta).
    const htmlCur = cRow?.htmlGz ?? null;
    const htmlBase = bRow?.htmlGz ?? null;
    const htmlDelta = htmlBase !== null && htmlCur !== null ? htmlCur - htmlBase : null;

    rows.push({ page, base: b, cur: c, delta, pct, htmlCur, htmlDelta, mark });
  }
  // Biggest current page first; removed pages (no current size) sink to the end.
  rows.sort((x, y) => (y.cur ?? -1) - (x.cur ?? -1));

  const sumTotal = (m: Map<string, Row>) => [...m.values()].reduce((a, r) => a + r.totalGz, 0);
  const sumHtml = (m: Map<string, Row>) => [...m.values()].reduce((a, r) => a + (r.htmlGz ?? 0), 0);
  const baseTotal = sumTotal(baseMap);
  const curTotal = sumTotal(curMap);
  const delta = curTotal - baseTotal;
  const pct = hasBaseline && baseTotal ? (delta / baseTotal) * 100 : null;

  const htmlCurTotal = sumHtml(curMap);
  const htmlBaseTotal = sumHtml(baseMap);
  // null when the baseline carries no HTML sizes — nothing comparable to diff
  const htmlDeltaTotal = hasBaseline && htmlBaseTotal > 0 ? htmlCurTotal - htmlBaseTotal : null;

  let verdict: Diff["verdict"] = "🟢";
  if (hasBaseline) {
    if (pct !== null && pct > 10) verdict = "🔴";
    else if (rows.some((r) => r.pct !== null && r.pct > 5)) verdict = "🟡";
  }
  return {
    rows,
    baseTotal,
    curTotal,
    delta,
    pct,
    htmlCurTotal,
    htmlDeltaTotal,
    verdict,
    hasBaseline,
  };
}

const kb = (n: number) => (n / 1024).toFixed(1) + "KB";
const signed = (n: number) => (n >= 0 ? "+" : "") + kb(n);
const signedPct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

// HTML cell: current doc size, with its delta appended when a comparable
// baseline exists and the size actually moved.
const htmlCell = (cur: number | null, delta: number | null) =>
  cur === null ? "—" : delta !== null && delta !== 0 ? `${kb(cur)} (${signed(delta)})` : kb(cur);

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
  lines.push("| Page | Base | New | Δ | Δ% | HTML |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const r of diff.rows) {
    const page = r.mark ? `${r.mark} ${r.page}` : r.page;
    const moved = r.delta !== null && r.delta !== 0;
    lines.push(
      `| ${page} | ${r.base !== null ? kb(r.base) : "—"} | ${r.cur !== null ? kb(r.cur) : "—"} | ${moved ? signed(r.delta!) : "—"} | ${moved && r.pct !== null ? signedPct(r.pct) : "—"} | ${htmlCell(r.htmlCur, r.htmlDelta)} |`,
    );
  }
  const moved = diff.hasBaseline && diff.delta !== 0;
  lines.push(
    `| **Total** | ${kb(diff.baseTotal)} | ${kb(diff.curTotal)} | ${moved ? `**${signed(diff.delta)}**` : "—"} | ${moved && diff.pct !== null ? `**${signedPct(diff.pct)}**` : "—"} | ${htmlCell(diff.htmlCurTotal, diff.htmlDeltaTotal)} |`,
  );
  lines.push("");
  lines.push(
    "Base/New/Δ = JS+CSS (assets). HTML = prerendered doc, expected to grow as content moves into markup.",
  );
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
