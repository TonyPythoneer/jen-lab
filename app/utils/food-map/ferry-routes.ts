// Sydney Ferries network — the shared route data layer.
//
// Geometry comes from OpenStreetMap (`route=ferry`), the SAME source the basemaps
// render, so our route lines + boats sit exactly on top of the faint ferry lines
// baked into the tiles instead of drifting off them. Run `pnpm sync:ferries:osm`
// (scripts/sync-ferries-osm.ts) to refresh it via the Overpass API. The data shape
// never changes — map themes only repaint it, they never decide which routes exist.
//
// (scripts/sync-ferries.ts pulls channel-accurate TfNSW GTFS geometry instead; it
// is kept for reference but drifts off the OSM-derived basemap, so it is not used.)

import data from "../../assets/data/ferry-routes.json";

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
