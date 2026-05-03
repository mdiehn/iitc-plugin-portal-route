# Phase 1 design

`iitc-plugin-portal-route` helps an IITC user plan a route through selected portals and manual map points.

Phase 1 was the mobile-first manual route planner. It is complete and should be treated as historical design context, not the current todo list.

## Completed feature set

- Add portals to an ordered route from the portal details panel.
- Add manual map points by tapping/clicking the map.
- Rename manual map points from the route list.
- Show route stops on the map.
- Calculate a route through selected stops.
- Show drive time and distance for each route leg.
- Show total drive time, stop time, trip time, and distance.
- Support a global default stop time.
- Support per-stop wait-time overrides.
- Mark route data stale/current after edits.
- Recalculate routes automatically after route changes.
- Show route leg details in the stop list.
- Optionally show segment drive-time labels on the map.
- Persist current route state across IITC reloads.
- Export the current route to Google Maps.
- Split long Google Maps routes into staged links.
- Export and import current-route JSON.
- Open a printable route summary.

## Completed follow-up work

These were deferred in the original Phase 1 notes, but are now implemented:

- Drag-and-drop waypoint reordering.
- Manual map point dragging.
- Waypoint replacement dragging near portals or map locations.
- Start on me.
- Add Current Location.
- Return-to-start routing.
- Saved named routes in the local route library.
- Selected-route and whole-library JSON import/export.

## Mobile-first rules

- No hover-only controls for core workflows.
- Avoid tiny buttons for frequent actions.
- Avoid wide tables.
- Keep route controls compact.
- Keep the map usable while panels are open.
- Use plain labels when glyphs are risky on mobile.

## Route state

The plugin tracks:

- ordered stops
- stop wait times
- settings
- calculated route data
- whether calculated route data is stale

Route data becomes stale when route-affecting data changes. Current behavior queues automatic recalculation when there are enough routeable stops.

## Google Maps export

Observed Google Maps behavior:

- first point is used as the origin
- final point is used as the destination
- up to 9 intermediate stops are included
- more than 11 total route points may export incompletely in one link

Current behavior:

- routes within the practical point limit open directly
- longer routes are split into staged Google Maps links
- the user opens stages in order

## Import, export, and print

Current-route JSON export/import is simple route backup and sharing.

Saved route and route-library JSON export/import live in the Route Library panel.

Imported routes restore stop order and stop timing, then route calculation is queued when possible.

The printable view is meant for quick paper or PDF output, not rich formatting.

## Still deferred

- Google Drive shared route-library storage.
- Better manual point names from street address, place name, or another reverse-geocoding source.
- Route optimization.
- Waze links.
- Turn-by-turn directions inside IITC.
