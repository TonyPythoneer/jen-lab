#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

// --- Types from vite-bundle-analyzer stats.json ---
interface SourceGroup {
  label: string
  parsedSize: number
  gzipSize: number
  brotliSize?: number
  groups?: SourceGroup[]
  filename?: string
  importedBy?: unknown[]
}

interface Chunk {
  filename: string
  label: string
  parsedSize: number
  gzipSize: number
  brotliSize?: number
  mapSize?: number
  source?: SourceGroup[]
}

// --- Output types ---
interface PackageStat {
  name: string
  gzip_size: number
  parsed_size: number
}

interface ChunkEntry {
  id: string       // normalized: _nuxt/entry.*.css
  name: string     // actual:     _nuxt/entry.CGcEzjfX.css
  category: string
  parsed_size: number
  gzip_size: number
  top_packages: PackageStat[]
}

interface Report {
  summary: {
    total_chunks: number
    total_parsed_size: number
    total_gzip_size: number
  }
  chunks: ChunkEntry[]
}

// --- Helpers ---
function fmt(bytes: number): string {
  if (Math.abs(bytes) < 1024) return `${bytes}B`
  if (Math.abs(bytes) < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

function sign(n: number): string {
  return n > 0 ? `+${fmt(n)}` : fmt(n)
}

function normalizeFilename(filename: string): string {
  // _nuxt/entry.CGcEzjfX.css → _nuxt/entry.*.css
  return filename.replace(/(_nuxt\/[\w-]+)\.[A-Za-z0-9_-]{8,}\.(css|js)$/, '$1.*.$2')
}

function extractPackageName(label: string): string {
  // .pnpm/reka-ui@2.9.6_.../node_modules/reka-ui/... → reka-ui
  const pnpm = label.match(/\.pnpm\/(@?[^@/]+)/)
  if (pnpm) return pnpm[1]
  // node_modules/foo/... → foo
  const nm = label.match(/node_modules\/(@?[^/]+(?:\/[^/]+)?)/)
  if (nm) return nm[1]
  return label
}

function collectPackages(groups: SourceGroup[]): Map<string, { gzip: number; parsed: number }> {
  const map = new Map<string, { gzip: number; parsed: number }>()

  function walk(group: SourceGroup, depth: number) {
    const label = group.label

    // Identify package-level nodes
    const isPnpm = label === '.pnpm' || label.match(/\.pnpm\//)
    const isNodeModules = label === 'node_modules'

    if (!isPnpm && !isNodeModules && depth > 0) {
      const pkg = extractPackageName(label)
      if (pkg && !label.startsWith('virtual:') && !label.startsWith('app')) {
        const existing = map.get(pkg) ?? { gzip: 0, parsed: 0 }
        map.set(pkg, {
          gzip: existing.gzip + (group.gzipSize ?? 0),
          parsed: existing.parsed + (group.parsedSize ?? 0),
        })
        return // don't recurse into sub-packages
      }
    }

    if (group.groups) {
      for (const child of group.groups) walk(child, depth + 1)
    }
  }

  for (const g of groups) walk(g, 0)
  return map
}

function categorize(filename: string): string {
  if (filename.endsWith('.css')) return 'CSS'
  if (filename.match(/_nuxt\/(index|error-\d+|my-best-[\w-]+)\.js$/)) return 'Page'
  if (filename === '_nuxt/entry.js') return 'App entry'
  if (filename.match(/_nuxt\/(leaflet|Badge|embla)[\w.-]*\.js$/)) return 'Vendor'
  return 'Vendor'
}

// --- Core ---
function generateReport(stats: Chunk[]): Report {
  const chunks: ChunkEntry[] = stats.map(chunk => {
    const pkgMap = collectPackages(chunk.source ?? [])
    const top_packages: PackageStat[] = [...pkgMap.entries()]
      .map(([name, s]) => ({ name, gzip_size: s.gzip, parsed_size: s.parsed }))
      .sort((a, b) => b.gzip_size - a.gzip_size)
      .slice(0, 5)

    return {
      id: normalizeFilename(chunk.filename),
      name: chunk.filename,
      category: categorize(chunk.filename),
      parsed_size: chunk.parsedSize,
      gzip_size: chunk.gzipSize,
      top_packages,
    }
  })

  chunks.sort((a, b) => b.gzip_size - a.gzip_size)

  return {
    summary: {
      total_chunks: chunks.length,
      total_parsed_size: chunks.reduce((s, c) => s + c.parsed_size, 0),
      total_gzip_size: chunks.reduce((s, c) => s + c.gzip_size, 0),
    },
    chunks,
  }
}

function printReport(report: Report) {
  const { summary, chunks } = report
  const COL = 48

  console.log('\n=== Bundle Report (client) ===')
  console.log(`Chunks:     ${summary.total_chunks}`)
  console.log(`Total size: ${fmt(summary.total_parsed_size)}  (gzip: ${fmt(summary.total_gzip_size)})`)

  const groups = new Map<string, ChunkEntry[]>()
  for (const c of chunks) {
    if (!groups.has(c.category)) groups.set(c.category, [])
    groups.get(c.category)!.push(c)
  }

  for (const [cat, entries] of groups) {
    const catParsed = entries.reduce((s, c) => s + c.parsed_size, 0)
    const catGzip = entries.reduce((s, c) => s + c.gzip_size, 0)
    console.log(`\n┌─ ${cat}  (${fmt(catParsed)} → gzip ${fmt(catGzip)})`)
    console.log(`│  ${'Filename'.padEnd(COL)} ${'Size'.padStart(9)} ${'Gzip'.padStart(9)}`)
    console.log(`│  ${'─'.repeat(COL + 20)}`)

    for (const c of entries) {
      console.log(`│  ${c.id.padEnd(COL)} ${fmt(c.parsed_size).padStart(9)} ${fmt(c.gzip_size).padStart(9)}`)
      if (c.top_packages.length) {
        for (const p of c.top_packages) {
          console.log(`│    ↳ ${p.name.padEnd(COL - 4)} ${fmt(p.parsed_size).padStart(9)} ${fmt(p.gzip_size).padStart(9)}`)
        }
      }
    }
  }
}

// --- Compare ---
interface MergedChunk {
  id: string
  category: string
  status: 'added' | 'removed' | 'changed' | 'unchanged'
  current: { parsed_size: number; gzip_size: number; top_packages: PackageStat[] } | null
  baseline: { parsed_size: number; gzip_size: number } | null
  parsed_diff: number
  gzip_diff: number
}

function compareReports(current: Report, baseline: Report): { summary: Record<string, number>; chunks: MergedChunk[] } {
  // Match by id (normalized filename)
  const baseMap = new Map(baseline.chunks.map(c => [c.id, c]))
  const currMap = new Map(current.chunks.map(c => [c.id, c]))
  const merged: MergedChunk[] = []

  for (const [id, c] of currMap) {
    const b = baseMap.get(id)
    const pd = c.parsed_size - (b?.parsed_size ?? 0)
    const gd = c.gzip_size - (b?.gzip_size ?? 0)
    merged.push({
      id,
      category: c.category,
      status: !b ? 'added' : (pd === 0 && gd === 0 ? 'unchanged' : 'changed'),
      current: { parsed_size: c.parsed_size, gzip_size: c.gzip_size, top_packages: c.top_packages },
      baseline: b ? { parsed_size: b.parsed_size, gzip_size: b.gzip_size } : null,
      parsed_diff: pd,
      gzip_diff: gd,
    })
  }
  for (const [id, b] of baseMap) {
    if (!currMap.has(id)) {
      merged.push({
        id,
        category: b.category,
        status: 'removed',
        current: null,
        baseline: { parsed_size: b.parsed_size, gzip_size: b.gzip_size },
        parsed_diff: -b.parsed_size,
        gzip_diff: -b.gzip_size,
      })
    }
  }

  merged.sort((a, b) => (b.current?.gzip_size ?? 0) - (a.current?.gzip_size ?? 0))

  return {
    summary: {
      total_parsed_diff: current.summary.total_parsed_size - baseline.summary.total_parsed_size,
      total_gzip_diff: current.summary.total_gzip_size - baseline.summary.total_gzip_size,
      added: merged.filter(c => c.status === 'added').length,
      removed: merged.filter(c => c.status === 'removed').length,
      changed: merged.filter(c => c.status === 'changed').length,
    },
    chunks: merged,
  }
}

function pct(diff: number, base: number): string {
  if (base === 0) return 'new'
  return `${diff >= 0 ? '+' : ''}${((diff / base) * 100).toFixed(1)}%`
}

function printCompare(compare: ReturnType<typeof compareReports>) {
  const { summary, chunks } = compare
  const COL = 44

  console.log('\n=== Bundle Size Comparison ===')
  console.log(`Total: ${sign(summary.total_parsed_diff)} size  (gzip: ${sign(summary.total_gzip_diff)})`)
  console.log(`Added: ${summary.added}  Removed: ${summary.removed}  Changed: ${summary.changed}`)

  const groups = new Map<string, MergedChunk[]>()
  for (const c of chunks) {
    if (!groups.has(c.category)) groups.set(c.category, [])
    groups.get(c.category)!.push(c)
  }

  const HDR1 = 'current'.padStart(19)
  const HDR2 = 'baseline'.padStart(19)
  const HDR3 = 'diff'

  for (const [cat, entries] of groups) {
    const currGzip = entries.reduce((s, c) => s + (c.current?.gzip_size ?? 0), 0)
    const baseGzip = entries.reduce((s, c) => s + (c.baseline?.gzip_size ?? 0), 0)
    console.log(`\n┌─ ${cat}  (gzip: ${fmt(currGzip)} → was ${fmt(baseGzip)})`)
    console.log(`│  ${'Filename'.padEnd(COL)} ${HDR1} ${HDR2}  diff (gzip)`)
    console.log(`│  ${'─'.repeat(COL + 55)}`)

    for (const c of entries) {
      const curr = c.current ? `${fmt(c.current.parsed_size).padStart(9)} ${fmt(c.current.gzip_size).padStart(9)}` : '        —         —'
      const base = c.baseline ? `${fmt(c.baseline.parsed_size).padStart(9)} ${fmt(c.baseline.gzip_size).padStart(9)}` : '        —         —'
      const baseGzip = c.baseline?.gzip_size ?? 0
      const diffStr = c.status === 'unchanged' ? '—' : `${sign(c.gzip_diff)} (${pct(c.gzip_diff, baseGzip)})`
      const statusTag = c.status === 'added' ? '[+]' : c.status === 'removed' ? '[-]' : c.status === 'changed' ? '[~]' : '   '
      console.log(`│ ${statusTag} ${c.id.padEnd(COL)} ${curr}  ${base}  ${diffStr}`)

      if (c.current?.top_packages.length) {
        for (const p of c.current.top_packages) {
          console.log(`│    ↳ ${p.name.padEnd(COL - 2)} ${fmt(p.parsed_size).padStart(9)} ${fmt(p.gzip_size).padStart(9)}`)
        }
      }
    }
  }
}

// --- CLI ---
const args = process.argv.slice(2)
const statsPath = args[0] ?? 'node_modules/.cache/nuxt/.nuxt/dist/client/stats.json'
const outputPath = args[1] ?? 'bundle-report.json'
const baselinePath = args[2]

if (!existsSync(statsPath)) {
  console.error(`Stats file not found: ${statsPath}`)
  console.error('Run `pnpm build` first to generate stats.json')
  process.exit(1)
}

const stats: Chunk[] = JSON.parse(readFileSync(statsPath, 'utf-8'))
const report = generateReport(stats)
writeFileSync(outputPath, JSON.stringify(report, null, 2))
console.log(`Report saved to ${outputPath}`)
printReport(report)

if (baselinePath) {
  if (!existsSync(baselinePath)) {
    console.warn(`Baseline not found: ${baselinePath} — skipping comparison`)
  } else {
    const baseline: Report = JSON.parse(readFileSync(baselinePath, 'utf-8'))
    const compare = compareReports(report, baseline)
    const diffPath = outputPath.replace('.json', '-diff.json')
    writeFileSync(diffPath, JSON.stringify(compare, null, 2))
    console.log(`\nDiff saved to ${diffPath}`)
    printCompare(compare)

    if (compare.chunks.some(f => f.gzip_diff > 50 * 1024)) {
      console.error('\n🚨 Large bundle size increase detected!')
      process.exit(1)
    }
  }
}
