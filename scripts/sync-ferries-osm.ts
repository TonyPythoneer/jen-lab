// Sync Sydney Ferries route geometry from OpenStreetMap (Overpass API).
//
// The map's basemaps (CARTO Voyager, OSM Standard, OpenTopoMap) are ALL rendered
// from OpenStreetMap, so the faint ferry lines baked into the tiles come from OSM
// `route=ferry` data. To make our own route layer + boats sit exactly on top of
// those baked lines — same source, no divergence — we pull the SAME geometry here
// instead of TfNSW GTFS (whose channel-accurate paths drift off the OSM tiles).
//
// OSM -> FerryRoute mapping (one representative relation per service code):
//   relation[route=ferry] -> one ferry service. We group by `ref` (F1..F10,
//     CCLC, ...) and keep the richest relation per code (OSM stores both travel
//     directions; one is enough — boats run both ways).
//   member ways           -> stitched in member order into a single ordered
//     `path` of [lat, lng]; each way is flipped when needed so endpoints join.
//   member nodes (role     -> wharves. Each stop's `i` is the nearest path point.
//     "stop"/"stop_*")        Falls back to the two path endpoints if absent.
//
// Run (no API key needed; Overpass is open):
//   pnpm sync:ferries:osm
// The committed JSON is only overwritten on a fully successful run.

import { writeFile } from "node:fs/promises";
import type { FerryRoute, FerryStop } from "../app/utils/ferry-routes.ts";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OUTPUT = new URL("../app/assets/data/ferry-routes.json", import.meta.url);
const ATTRIBUTION = "© OpenStreetMap contributors (ODbL)";

// Sydney Ferries network bbox: Parramatta River (west) to Manly / Watsons Bay.
// Order is Overpass's (south, west, north, east).
const BBOX = "-34.05,150.95,-33.74,151.31";
const QUERY = `[out:json][timeout:60];(relation["route"="ferry"](${BBOX}););out geom;`;

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
  geometry?: { lat: number; lon: number }[];
}
type Member = OverpassNodeMember | OverpassWayMember | { type: string; role: string };

interface OverpassRelation {
  type: "relation";
  id: number;
  tags?: Record<string, string>;
  members: Member[];
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
// node (gap ~0); a multi-hundred-metre gap means the next member is a different
// leg (e.g. the return direction or a branch), which must NOT be bridged — doing
// so is exactly what drew straight lines across the harbour and over land.
const MAX_JOIN_GAP_M = 300;

// Stitch a relation's member ways into ONE continuous polyline. We greedily
// attach, at either end of the growing chain, the unused way whose endpoint is
// nearest — but only while that join stays within MAX_JOIN_GAP_M. Member order
// and per-way direction are ignored, so messy relations no longer produce
// cross-harbour bridges; ways that cannot connect are simply left out.
function stitchWays(ways: OverpassWayMember[]): LatLng[] {
  const segs = ways
    .map((w) => (w.geometry ?? []).map((p) => [p.lat, p.lon] as LatLng))
    .filter((s) => s.length >= 2);
  if (segs.length === 0) return [];

  const used = new Array<boolean>(segs.length).fill(false);
  used[0] = true;
  let chain: LatLng[] = [...segs[0]!];

  for (;;) {
    const head = chain[0]!;
    const tail = chain[chain.length - 1]!;
    let best: { end: "head" | "tail"; gap: number; oriented: LatLng[]; idx: number } | null = null;

    for (let i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      const seg = segs[i]!;
      const rev = [...seg].reverse();
      const last = seg.length - 1;
      const cands: { end: "head" | "tail"; gap: number; oriented: LatLng[] }[] = [
        { end: "tail", gap: metres(tail, seg[0]!), oriented: seg }, // tail → seg start
        { end: "tail", gap: metres(tail, seg[last]!), oriented: rev }, // tail → seg end
        { end: "head", gap: metres(head, seg[last]!), oriented: seg }, // seg end → head
        { end: "head", gap: metres(head, seg[0]!), oriented: rev }, // seg start → head
      ];
      for (const c of cands) {
        if (!best || c.gap < best.gap) best = { ...c, idx: i };
      }
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
  return chain;
}

function stopsFor(path: LatLng[], nodes: OverpassNodeMember[]): FerryStop[] {
  const isStop = (role: string) => role === "stop" || role.startsWith("stop_");
  const wharves = nodes.filter((n) => isStop(n.role));

  const seen = new Set<number>();
  const stops: FerryStop[] = [];
  for (const n of wharves) {
    const i = nearestPointIndex(path, n.lat, n.lon);
    if (seen.has(i)) continue;
    seen.add(i);
    stops.push({ name: "Wharf", i });
  }
  stops.sort((a, b) => a.i - b.i);

  // The renderer needs at least two stops (the terminals). Fall back to the
  // path's own endpoints when a relation has no usable stop nodes.
  if (stops.length < 2) {
    return [
      { name: "Wharf", i: 0 },
      { name: "Wharf", i: path.length - 1 },
    ];
  }
  return stops;
}

// Strip OSM's "Ferry: F4, " prefix and directional noise into a short label.
function cleanName(raw: string): string {
  return raw
    .replace(/^Ferry:\s*[A-Z0-9]+,\s*/i, "")
    .replace(/\s*=>\s*/g, " → ")
    .trim();
}

function buildRoutes(relations: OverpassRelation[]): FerryRoute[] {
  // Group by service code; keep the relation whose stitched path is richest.
  const byRef = new Map<string, { rel: OverpassRelation; path: LatLng[] }>();
  for (const rel of relations) {
    const ways = rel.members.filter((m): m is OverpassWayMember => m.type === "way");
    const path = stitchWays(ways);
    if (path.length < 2) continue;
    const ref = (rel.tags?.ref || rel.tags?.name || `rel-${rel.id}`).trim();
    const current = byRef.get(ref);
    if (!current || path.length > current.path.length) byRef.set(ref, { rel, path });
  }

  const routes: FerryRoute[] = [];
  for (const [ref, { rel, path }] of byRef) {
    const nodes = rel.members.filter((m): m is OverpassNodeMember => m.type === "node");
    routes.push({
      id: ref.startsWith("rel-") ? `osm-${ref}` : ref,
      name: cleanName(rel.tags?.name ?? ref),
      headwayMin: DEFAULT_HEADWAY_MIN,
      path,
      stops: stopsFor(path, nodes),
    });
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

  const data = (await res.json()) as { elements: OverpassRelation[] };
  const relations = (data.elements ?? []).filter((e) => e.type === "relation");
  const routes = buildRoutes(relations);
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
  // built routes in full. Nothing is merged with or appended to the old data, so
  // stale routes can never linger. (On a failed fetch / empty build above we exit
  // before reaching here, leaving the previous file intact.)
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
