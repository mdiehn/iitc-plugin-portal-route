# Portal Route design

Portal Route is a mobile-first IITC plugin for planning routes through selected Ingress portals and manual map points.

The plugin is meant to help an agent:

- build an ordered stop list from portals, map points, or current location
- edit, rename, reorder, reverse, and clear route stops
- include per-stop and default stop time
- choose a route travel mode and per-mode average speed for estimated travel time
- loop back to the first stop when needed
- calculate routes automatically after route changes
- see travel time, stop time, trip time, distance, and per-leg details
- export long routes to staged Google Maps links
- export long routes to staged Apple Maps links
- save and load named routes
- import/export current routes, saved routes, and route libraries as JSON
- print a simple route summary
- restore current route state after an IITC reload

## Design docs

- [Roadmap](ROADMAP.md)
- [Route library design](route-library-design.md)
- [UI refactor plan](ui-refactor-plan.md)
- [Phase 1 design](design-phase-1.md)
- [Usability notes](usability-notes.md)

## Completed phases

### Phase 1: manual route planner

Done in the early releases and stable in `1.0.0`:

- portal stops
- manual map points
- route plotting/calculation
- stop timing
- stale/current route tracking
- persisted current route state
- Google Maps export
- Google Maps export-limit warning
- staged Apple Maps export
- JSON import/export
- printable route summary

### Phase 2: route editing and map polish

Done:

- drag-and-drop waypoint reordering
- manual point dragging
- waypoint replacement dragging
- selectable map labels and handles
- Start on me
- Add Current Location
- loop back to start
- route reversal and clear route
- staged Google Maps links for long routes

### Phase 3: mobile-first UI simplification

Mostly done in `1.2.0`:

- Add/Del for direct selected-point changes, with Menu as the wider route-building/export/navigation menu
- Undo for recent route edits
- shared Menu context menu
- compact mini control
- route list as the day-to-day work panel
- settings panel as a small settings/navigation panel
- portal details controls
- automatic route calculation after edits

### Phase 4: local route library

Mostly done in `1.2.0`:

- schema version 1 saved route records
- local saved-route library
- Save, Load, overwrite, rename, delete
- selected route import/export
- whole-library import/export
- route-library storage adapter shape started

## Current phase: shared route library

The remaining v1.1.0 goal is shared route storage.

Preferred direction:

- inspect IITC's existing Google Drive sync code first
- use a visible, user-selected Google Drive folder
- store `route-library.json` in that folder
- remember the Drive folder ID locally on each device
- keep sync manual at first
- avoid hidden `appDataFolder` storage for the first Drive backend
- avoid automatic polling/live sync until conflict handling is clear

## Current release: travel mode start

Done in `1.5.0`:

- route-level `drive`, `bike`, and `walk` travel modes
- default travel mode setting
- per-mode average speed settings
- travel-time estimates derived from selected mode and configured speed
- Google Maps export mode mapping for `driving`, `bicycling`, and `walking`
- travel-mode settings carried through saved routes, route JSON, restored state, and undo

Notes:

- Distance calculation still follows the current route geometry.
- Stop/wait time behavior is unchanged.
- Per-leg travel modes and alternative routing providers are still later work.

## Remaining polish

Likely useful polish before or after Drive:

- better names for manual map points, possibly by reverse-geocoding a street address or place name
- field-test waypoint replacement dragging on mobile
- improve Google Maps stage handoff text if needed
- improve route calculation failure messages

Later ideas:

- route optimization
- Waze links
- GPX/KML export
- per-leg travel modes
- alternative routing providers
- manual shared map/view handoff with `current-map.json`
- turn-by-turn directions inside IITC, only if it ever feels worth the complexity

## UI direction

Keep the UI small, plain, and mobile-friendly.

Prefer:

- obvious controls for core workflows
- compact rows over wide tables
- stable layout over clever animation
- plain labels when icons render poorly on mobile
- subtle blue-outlined smart buttons for contextual menus or smart flows
- plain buttons for direct actions such as Fit, Print, Save, and Load
- manual, inspectable storage before automatic sync

## Credit

Portal Route is a separate implementation inspired in part by the IITC Traveling Agent plugin by yavidor and the Map Route Planner plugin by DanielOnDiordna
