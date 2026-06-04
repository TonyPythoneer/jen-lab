// Sync Sydney Ferries route geometry from Transport for NSW (TfNSW).
//
// TfNSW is the single source of truth for which ferry routes exist and the
// exact path each boat follows. This script fetches the official GTFS static
// "ferries" bundle, extracts one representative trip per route, and rewrites
// app/assets/data/ferry-routes.json so the map renders real geometry instead
// of the hand-traced placeholder.
//
// GTFS -> FerryRoute mapping (one representative trip per route):
//   routes.txt    -> route_type === "4" picks ferries. id = route_short_name
//                    (e.g. "F1"), name = route_long_name / route_desc.
//   trips.txt     -> one trip per route gives us its trip_id and shape_id.
//   shapes.txt    -> points for that shape_id, ordered by shape_pt_sequence,
//                    become `path` as [lat, lng].
//   stop_times +  -> the trip's stops in order; each wharf's `i` is the index
//   stops.txt        of the nearest shape point in `path`.
//   frequencies   -> headwayMin when present, else a 20-minute default.
//
// Run with a free TfNSW API key (https://opendata.transport.nsw.gov.au):
//   TFNSW_API_KEY=... pnpm sync:ferries
// The committed JSON is only overwritten on a fully successful run.

import { writeFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
import type { FerryRoute, FerryStop } from "../app/utils/food-map/ferry-routes.ts";

// Sydney Ferries operator feed. The path is mode/operator: ferries/sydneyferries.
const GTFS_URL = "https://api.transport.nsw.gov.au/v1/gtfs/schedule/ferries/sydneyferries";
const OUTPUT = new URL("../app/assets/data/ferry-routes.json", import.meta.url);

// GTFS route_type for ferries.
const FERRY_ROUTE_TYPE = "4";
// Used when frequencies.txt does not cover a route.
const DEFAULT_HEADWAY_MIN = 20;

const ATTRIBUTION = "© State of New South Wales (Transport for NSW), CC-BY 4.0";

// A parsed GTFS text file: header names plus one record (object) per data row.
interface Table {
  header: string[];
  rows: Record<string, string>[];
}

// Split one CSV line, honouring double-quoted fields that contain commas.
// GTFS escapes a literal quote inside a quoted field by doubling it ("").
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

function parseCsv(text: string): Table {
  // Strip a UTF-8 BOM and normalise line endings before splitting.
  const lines = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.length > 0);
  if (nonEmpty.length === 0) return { header: [], rows: [] };

  const header = parseCsvLine(nonEmpty[0]!);
  const rows = nonEmpty.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) {
      row[header[i]!] = values[i] ?? "";
    }
    return row;
  });
  return { header, rows };
}

// Great-circle distance is overkill for picking the nearest shape point; a
// plain squared lat/lng difference gives the same ordering far more cheaply.
function squaredDistance(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = aLat - bLat;
  const dLng = aLng - bLng;
  return dLat * dLat + dLng * dLng;
}

function nearestPointIndex(path: [number, number][], lat: number, lng: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = squaredDistance(path[i]![0], path[i]![1], lat, lng);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

// frequencies.txt lists a headway in seconds for a time window of a trip.
// Take the smallest (busiest) headway we see for the trip and round to minutes.
function headwayFor(tripId: string, byTrip: Map<string, number>): number {
  const seconds = byTrip.get(tripId);
  if (seconds === undefined || seconds <= 0) return DEFAULT_HEADWAY_MIN;
  return Math.round(seconds / 60);
}

function readTable(files: Record<string, Uint8Array>, name: string): Table {
  const raw = files[name];
  if (!raw) return { header: [], rows: [] };
  return parseCsv(strFromU8(raw));
}

function buildRoutes(files: Record<string, Uint8Array>): FerryRoute[] {
  const routesTable = readTable(files, "routes.txt");
  const tripsTable = readTable(files, "trips.txt");
  const shapesTable = readTable(files, "shapes.txt");
  const stopTimesTable = readTable(files, "stop_times.txt");
  const stopsTable = readTable(files, "stops.txt");
  const freqTable = readTable(files, "frequencies.txt");

  // route_id -> { id, name } for ferry routes only.
  const ferryRoutes = new Map<string, { id: string; name: string }>();
  for (const r of routesTable.rows) {
    if (r["route_type"] !== FERRY_ROUTE_TYPE) continue;
    const routeId = r["route_id"]!;
    const id = (r["route_short_name"] || routeId).trim();
    const name = (r["route_long_name"] || r["route_desc"] || id).trim();
    ferryRoutes.set(routeId, { id, name });
  }

  // Pick one representative trip per ferry route: the first trip we see for the
  // route's lowest direction_id (the outbound direction is fine for drawing).
  const tripByRoute = new Map<string, { tripId: string; shapeId: string; direction: string }>();
  for (const t of tripsTable.rows) {
    const routeId = t["route_id"]!;
    if (!ferryRoutes.has(routeId)) continue;
    const tripId = t["trip_id"]!;
    const shapeId = t["shape_id"] ?? "";
    if (!shapeId) continue;
    const direction = t["direction_id"] ?? "0";
    const chosen = tripByRoute.get(routeId);
    if (!chosen || direction < chosen.direction) {
      tripByRoute.set(routeId, { tripId, shapeId, direction });
    }
  }

  // shape_id -> ordered [lat, lng] path.
  const shapePoints = new Map<string, { seq: number; lat: number; lng: number }[]>();
  for (const s of shapesTable.rows) {
    const shapeId = s["shape_id"]!;
    const arr = shapePoints.get(shapeId) ?? [];
    arr.push({
      seq: Number(s["shape_pt_sequence"]),
      lat: Number(s["shape_pt_lat"]),
      lng: Number(s["shape_pt_lon"]),
    });
    shapePoints.set(shapeId, arr);
  }
  const pathByShape = new Map<string, [number, number][]>();
  for (const [shapeId, pts] of shapePoints) {
    pts.sort((a, b) => a.seq - b.seq);
    pathByShape.set(
      shapeId,
      pts.map((p) => [p.lat, p.lng] as [number, number]),
    );
  }

  // trip_id -> ordered list of { stopId } from stop_times.txt.
  const stopTimesByTrip = new Map<string, { seq: number; stopId: string }[]>();
  for (const st of stopTimesTable.rows) {
    const tripId = st["trip_id"]!;
    const arr = stopTimesByTrip.get(tripId) ?? [];
    arr.push({ seq: Number(st["stop_sequence"]), stopId: st["stop_id"]! });
    stopTimesByTrip.set(tripId, arr);
  }

  // stop_id -> { name, lat, lng }.
  const stopInfo = new Map<string, { name: string; lat: number; lng: number }>();
  for (const s of stopsTable.rows) {
    stopInfo.set(s["stop_id"]!, {
      name: s["stop_name"]!,
      lat: Number(s["stop_lat"]),
      lng: Number(s["stop_lon"]),
    });
  }

  // trip_id -> smallest headway in seconds, from frequencies.txt.
  const headwaySecByTrip = new Map<string, number>();
  for (const f of freqTable.rows) {
    const tripId = f["trip_id"]!;
    const headway = Number(f["headway_secs"]);
    if (!Number.isFinite(headway) || headway <= 0) continue;
    const current = headwaySecByTrip.get(tripId);
    if (current === undefined || headway < current) {
      headwaySecByTrip.set(tripId, headway);
    }
  }

  const result: FerryRoute[] = [];
  for (const [routeId, meta] of ferryRoutes) {
    const trip = tripByRoute.get(routeId);
    if (!trip) continue;
    const path = pathByShape.get(trip.shapeId);
    if (!path || path.length === 0) continue;

    const stopTimes = (stopTimesByTrip.get(trip.tripId) ?? [])
      .slice()
      .sort((a, b) => a.seq - b.seq);
    const stops: FerryStop[] = [];
    for (const st of stopTimes) {
      const info = stopInfo.get(st.stopId);
      if (!info) continue;
      stops.push({ name: info.name, i: nearestPointIndex(path, info.lat, info.lng) });
    }

    result.push({
      id: meta.id,
      name: meta.name,
      headwayMin: headwayFor(trip.tripId, headwaySecByTrip),
      path,
      stops,
    });
  }

  // Stable, human-friendly order by service code (F1, F2, ... F10).
  result.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return result;
}

async function main() {
  const apiKey = process.env.TFNSW_API_KEY;
  if (!apiKey) {
    console.error("[sync-ferries] TFNSW_API_KEY is not set.");
    console.error("[sync-ferries] Get a free key:");
    console.error("[sync-ferries]   1. Register at https://opendata.transport.nsw.gov.au");
    console.error("[sync-ferries]   2. Create an application and add the GTFS API to it");
    console.error("[sync-ferries]   3. Copy the application's API key");
    console.error("[sync-ferries] Then run: TFNSW_API_KEY=<key> pnpm sync:ferries");
    console.error("[sync-ferries] (or put it in .env and run: node --env-file=.env ...)");
    console.error("[sync-ferries] Existing ferry-routes.json left unchanged.");
    process.exit(1);
  }

  console.log(`[sync-ferries] source: ${GTFS_URL}`);
  const res = await fetch(GTFS_URL, {
    headers: { Authorization: `apikey ${apiKey}` },
  });
  if (!res.ok) {
    console.error(`[sync-ferries] fetch failed: HTTP ${res.status} ${res.statusText}`);
    console.error("[sync-ferries] Existing ferry-routes.json left unchanged.");
    process.exit(1);
  }

  console.log("[sync-ferries] unzipping GTFS bundle…");
  const zipBytes = new Uint8Array(await res.arrayBuffer());
  const files = unzipSync(zipBytes);

  const routes = buildRoutes(files);
  if (routes.length === 0) {
    console.error("[sync-ferries] no ferry routes built from the feed — aborting.");
    console.error("[sync-ferries] Existing ferry-routes.json left unchanged.");
    process.exit(1);
  }

  const payload = {
    _source: `Transport for NSW — GTFS schedule/ferries, synced ${new Date().toISOString()}`,
    attribution: ATTRIBUTION,
    routes,
  };
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

  console.log(`[sync-ferries] wrote ${routes.length} routes to ${OUTPUT.pathname}`);
  for (const r of routes) {
    console.log(
      `[sync-ferries]   ${r.id} ${r.name}: ${r.path.length} points, ${r.stops.length} stops`,
    );
  }
  console.log(`[sync-ferries] Attribution required wherever this data is shown:`);
  console.log(`[sync-ferries]   ${ATTRIBUTION}`);
}

main().catch((err) => {
  console.error("[sync-ferries] unexpected error:", err);
  process.exit(1);
});
