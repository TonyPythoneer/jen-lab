// Sync Sydney Ferries route geometry from OpenStreetMap (Overpass API).
//
// The map's basemaps (CARTO Voyager, OSM Standard, OpenTopoMap) are ALL rendered
// from OpenStreetMap, and they draw EVERY way tagged `route=ferry`. To make our
// route layer match the faint ferry lines baked into the tiles, we must cover the
// same ways — not just the ones wrapped in a route relation.
//
// OSM -> FerryRoute mapping:
//   relation[route=ferry] -> main services. Grouped by `ref` (F1..F10, CCLC, …);
//     the richest relation per code is kept and its member ways stitched into one
//     ordered `path`. Member `stop` nodes become the wharves.
//   way[route=ferry]      -> any ferry way NOT already covered by a kept relation
//     (services with no relation, e.g. Rose Bay / Shark Island, and dropped
//     direction/variant legs) is added too, stitched by connectivity. This is what
//     keeps us consistent with what the basemap actually paints.
//
// Run (no API key needed; Overpass is open):
//   pnpm sync:ferries:osm
// Force-overwrites ferry-routes.json on a fully successful run; on failure the
// previous file is left untouched.

import { writeFile } from "node:fs/promises";
import type { FerryRoute, FerryStop } from "../app/utils/ferry-routes.ts";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OUTPUT = new URL("../app/assets/data/ferry-routes.json", import.meta.url);
const ATTRIBUTION = "© OpenStreetMap contributors (ODbL)";

// Sydney Ferries network bbox: Parramatta River (west) to Manly / Watsons Bay.
// Order is Overpass's (south, west, north, east). Pull relations AND ways.
const BBOX = "-34.05,150.95,-33.74,151.31";
const QUERY =
  `[out:json][timeout:90];(` +
  `relation["route"="ferry"](${BBOX});` +
  `way["route"="ferry"](${BBOX});` +
  `);out geom;`;

// No GTFS frequencies in OSM; headwayMin is informational only (the renderer
// scales boat count by route length, not headway), so a single default is fine.
const DEFAULT_HEADWAY_MIN = 20;

type LatLng = [number, number];

interface OverpassNodeMember {
  type: "node";
  role: string;
  lat: number;
  lon: number;
}
interface OverpassWayMember {
  type: "way";
  role: string;
  ref: number; // the member way's id
  geometry?: { lat: number; lon: number }[];
}
type Member = OverpassNodeMember | OverpassWayMember | { type: string; role: string };

interface OverpassRelation {
  type: "relation";
  id: number;
  tags?: Record<string, string>;
  members: Member[];
}
interface OverpassWay {
  type: "way";
  id: number;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

const sq = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const dLat = aLat - bLat;
  const dLng = aLng - bLng;
  return dLat * dLat + dLng * dLng;
};

function nearestPointIndex(path: LatLng[], lat: number, lng: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = sq(path[i]![0], path[i]![1], lat, lng);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

// Metres between two [lat, lng] points (equirectangular — accurate enough at
// harbour scale and far cheaper than haversine).
function metres(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const x = (((b[1] - a[1]) * Math.PI) / 180) * Math.cos((((a[0] + b[0]) / 2) * Math.PI) / 180);
  const y = ((b[0] - a[0]) * Math.PI) / 180;
  return R * Math.hypot(x, y);
}

// Largest gap we will bridge when joining two ways. Ways in a clean route share a
// node (gap ~0); a multi-hundred-metre gap means a different leg, which must NOT
// be bridged — that is what drew straight lines across the harbour and over land.
const MAX_JOIN_GAP_M = 300;

// Join a set of way geometries into one or more continuous polylines. Starting
// from each unused segment, we greedily attach (at either end) the nearest unused
// segment while the join stays within MAX_JOIN_GAP_M. Segments that cannot connect
// start a new component — so NO way is ever dropped and none is bridged across a
// gap. Returns one polyline per connected component.
function stitchComponents(segsIn: LatLng[][]): LatLng[][] {
  const segs = segsIn.filter((s) => s.length >= 2);
  const used = new Array<boolean>(segs.length).fill(false);
  const components: LatLng[][] = [];

  for (let seed = 0; seed < segs.length; seed++) {
    if (used[seed]) continue;
    used[seed] = true;
    let chain: LatLng[] = [...segs[seed]!];

    for (;;) {
      const head = chain[0]!;
      const tail = chain[chain.length - 1]!;
      let best: { end: "head" | "tail"; gap: number; oriented: LatLng[]; idx: number } | null =
        null;

      for (let i = 0; i < segs.length; i++) {
        if (used[i]) continue;
        const seg = segs[i]!;
        const rev = [...seg].reverse();
        const last = seg.length - 1;
        const cands: { end: "head" | "tail"; gap: number; oriented: LatLng[] }[] = [
          { end: "tail", gap: metres(tail, seg[0]!), oriented: seg },
          { end: "tail", gap: metres(tail, seg[last]!), oriented: rev },
          { end: "head", gap: metres(head, seg[last]!), oriented: seg },
          { end: "head", gap: metres(head, seg[0]!), oriented: rev },
        ];
        for (const c of cands) if (!best || c.gap < best.gap) best = { ...c, idx: i };
      }

      if (!best || best.gap > MAX_JOIN_GAP_M) break;
      used[best.idx] = true;
      if (best.end === "tail") {
        const shared = metres(tail, best.oriented[0]!) < 1;
        chain.push(...(shared ? best.oriented.slice(1) : best.oriented));
      } else {
        const tip = best.oriented[best.oriented.length - 1]!;
        const shared = metres(head, tip) < 1;
        chain = [...(shared ? best.oriented.slice(0, -1) : best.oriented), ...chain];
      }
    }
    components.push(chain);
  }
  return components;
}

const toSegs = (ways: { geometry?: { lat: number; lon: number }[] }[]): LatLng[][] =>
  ways
    .map((w) => (w.geometry ?? []).map((p) => [p.lat, p.lon] as LatLng))
    .filter((s) => s.length >= 2);

// A relation's member ways form one service: stitch them and take the longest
// connected component (guards against a stray disconnected member).
function stitchRelation(ways: OverpassWayMember[]): LatLng[] {
  const comps = stitchComponents(toSegs(ways)).sort((a, b) => b.length - a.length);
  return comps[0] ?? [];
}

function wharvesFromNodes(path: LatLng[], nodes: OverpassNodeMember[]): FerryStop[] {
  const isStop = (role: string) => role === "stop" || role.startsWith("stop_");
  const seen = new Set<number>();
  const stops: FerryStop[] = [];
  for (const n of nodes.filter((m) => isStop(m.role))) {
    const i = nearestPointIndex(path, n.lat, n.lon);
    if (seen.has(i)) continue;
    seen.add(i);
    stops.push({ name: "Wharf", i });
  }
  stops.sort((a, b) => a.i - b.i);
  return stops.length >= 2 ? stops : endpointStops(path);
}

const endpointStops = (path: LatLng[]): FerryStop[] => [
  { name: "Wharf", i: 0 },
  { name: "Wharf", i: path.length - 1 },
];

// Strip OSM's "Ferry: F4, " prefix and arrow noise into a short label.
function cleanName(raw: string): string {
  return raw
    .replace(/^Ferry:\s*[A-Z0-9]+,\s*/i, "")
    .replace(/\s*=>\s*/g, " → ")
    .trim();
}

function buildRoutes(relations: OverpassRelation[], ways: OverpassWay[]): FerryRoute[] {
  const routes: FerryRoute[] = [];
  // Way ids already drawn by a kept relation — so we don't double-add them below.
  const covered = new Set<number>();

  // 1) Main services from relations: group by ref, keep the richest, stitch it.
  const byRef = new Map<string, { rel: OverpassRelation; path: LatLng[] }>();
  for (const rel of relations) {
    const wayMembers = rel.members.filter((m): m is OverpassWayMember => m.type === "way");
    const path = stitchRelation(wayMembers);
    if (path.length < 2) continue;
    const ref = (rel.tags?.ref || rel.tags?.name || `rel-${rel.id}`).trim();
    const cur = byRef.get(ref);
    if (!cur || path.length > cur.path.length) byRef.set(ref, { rel, path });
  }
  for (const [ref, { rel, path }] of byRef) {
    rel.members.forEach((m) => {
      if (m.type === "way") covered.add((m as OverpassWayMember).ref);
    });
    const nodes = rel.members.filter((m): m is OverpassNodeMember => m.type === "node");
    routes.push({
      id: ref.startsWith("rel-") ? `osm-${ref}` : ref,
      name: cleanName(rel.tags?.name ?? ref),
      headwayMin: DEFAULT_HEADWAY_MIN,
      path,
      stops: wharvesFromNodes(path, nodes),
    });
  }

  // 2) Every ferry way NOT covered by a kept relation — grouped by ref/name so a
  // service split across several ways becomes one route, then stitched into its
  // connected components. This is what closes the gap with the basemap.
  const leftover = ways.filter((w) => !covered.has(w.id) && (w.geometry?.length ?? 0) >= 2);
  const groups = new Map<string, OverpassWay[]>();
  for (const w of leftover) {
    const key = (w.tags?.ref || w.tags?.name || `way-${w.id}`).trim();
    const arr = groups.get(key);
    if (arr) arr.push(w);
    else groups.set(key, [w]);
  }
  for (const [key, gways] of groups) {
    const label = cleanName(gways.find((w) => w.tags?.name)?.tags?.name ?? key);
    for (const path of stitchComponents(toSegs(gways))) {
      if (path.length < 2) continue;
      routes.push({
        id: `osm-${key}`,
        name: label,
        headwayMin: DEFAULT_HEADWAY_MIN,
        path,
        stops: endpointStops(path),
      });
    }
  }

  routes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return routes;
}

async function main() {
  console.log(`[sync-ferries-osm] querying Overpass for route=ferry in ${BBOX}`);
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "jen-lab-foodmap/1.0 (ferry route sync)",
    },
    body: `data=${encodeURIComponent(QUERY)}`,
  });
  if (!res.ok) {
    console.error(`[sync-ferries-osm] fetch failed: HTTP ${res.status} ${res.statusText}`);
    console.error("[sync-ferries-osm] Existing ferry-routes.json left unchanged.");
    process.exit(1);
  }

  const data = (await res.json()) as { elements: (OverpassRelation | OverpassWay)[] };
  const els = data.elements ?? [];
  const relations = els.filter((e): e is OverpassRelation => e.type === "relation");
  const ways = els.filter((e): e is OverpassWay => e.type === "way");
  const routes = buildRoutes(relations, ways);
  if (routes.length === 0) {
    console.error("[sync-ferries-osm] no ferry routes built — aborting.");
    console.error("[sync-ferries-osm] Existing ferry-routes.json left unchanged.");
    process.exit(1);
  }

  const payload = {
    _source: `OpenStreetMap via Overpass API, synced ${new Date().toISOString()}`,
    attribution: ATTRIBUTION,
    routes,
  };
  // Force overwrite: flag "w" truncates any existing file and writes the freshly
  // built routes in full. Nothing is merged with or appended to the old data.
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: "utf-8",
    flag: "w",
  });

  console.log(`[sync-ferries-osm] overwrote ${OUTPUT.pathname} with ${routes.length} routes`);
  for (const r of routes) {
    console.log(
      `[sync-ferries-osm]   ${r.id} ${r.name}: ${r.path.length} points, ${r.stops.length} stops`,
    );
  }
  console.log(`[sync-ferries-osm] Attribution required wherever this data is shown:`);
  console.log(`[sync-ferries-osm]   ${ATTRIBUTION}`);
}

main().catch((err) => {
  console.error("[sync-ferries-osm] unexpected error:", err);
  process.exit(1);
});
