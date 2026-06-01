// Sydney Ferries network — the shared route data layer.
//
// Geometry is the single source of truth from Transport for NSW. The committed
// JSON is currently a hand-traced PLACEHOLDER ported from the design prototype;
// running `pnpm sync:ferries` (see scripts/sync-ferries.ts) overwrites it with
// official GTFS geometry. The data shape never changes — map themes only repaint
// it, they never decide which routes exist.

import data from "~/assets/data/ferry-routes.json";

// A wharf along a route. `i` indexes into the route's `path`.
export interface FerryStop {
  name: string;
  i: number;
}

export interface FerryRoute {
  // Service code, e.g. "F1".
  id: string;
  // Human route name, e.g. "Manly".
  name: string;
  // Scheduled minutes between departures — drives how many boats run.
  headwayMin: number;
  // Ordered [lat, lng] points the boat must follow. Wharves are vertices;
  // extra points round headlands to keep boats on open water.
  path: [number, number][];
  // Wharves in travel order. stops[0] and stops[last] are the two terminals.
  stops: FerryStop[];
}

export const FERRY_ROUTES = data.routes as FerryRoute[];

// CC-BY attribution string required when the official data is in use.
export const FERRY_ATTRIBUTION = data.attribution as string;
