# Route Library Design Notes

Working design notes for Portal Route saved routes, route library storage,
JSON portability, and shared-storage behavior.

## Current state

Portal Route has a local route library with named saved routes. Routes can be
saved, loaded, renamed, deleted, imported, exported, and preserved across reloads.
The route library also supports JSON portability and Google Drive shared route
storage.

The current design goal is to keep local storage reliable, keep JSON files
human-readable and recoverable, and treat shared storage as explicit user-driven
sync rather than live collaboration.

## Current Route Library behavior

- The Route Library is a separate panel.
- Saved routes can be selected from the library.
- Save can create or overwrite route records.
- Load restores the saved route into the active route editor.
- Route names can be edited.
- Routes can be imported/exported as JSON.
- The whole route library can be exported/imported.
- Google Drive shared storage exists as an explicit user action, not automatic
  live sync.
- The saved-route list scrolls independently while Route Library action buttons
  stay visible.

## Route record schema

Saved-route records use `schemaVersion: 1`.

Example:

```json
{
  "schemaVersion": 1,
  "pluginVersion": "1.6.0",
  "id": "route-...",
  "name": "Example route",
  "createdAt": "2026-05-02T12:00:00.000Z",
  "updatedAt": "2026-05-02T12:30:00.000Z",
  "map": {
    "center": { "lat": 43.642, "lng": -72.251 },
    "zoom": 15
  },
  "route": {
    "stops": []
  },
  "settings": {}
}
```

Notes:

- `schemaVersion` should remain stable until the record shape changes.
- `id` should remain stable across saves so overwrite/update works.
- `createdAt` should remain unchanged after the first save.
- `updatedAt` should change when the saved record is overwritten.
- `map.center` and `map.zoom` capture the view when the route is saved.
- `route.stops` contains the stop data needed to restore the active route.
- Saved geometry should not be treated as authoritative; loading a route should
  restore stops and recalculate route geometry.
- `settings` should include route-relevant settings, not every UI preference.

## Route-relevant settings

Route records may include settings that affect the meaning or timing of the
route, such as:

```json
{
  "defaultStopMinutes": 5,
  "includeReturnToStart": true,
  "defaultTravelMode": "drive",
  "driveSpeedMph": 30,
  "bikeSpeedMph": 10,
  "walkSpeedMph": 3,
  "routeLineColor": "#3388ff",
  "routeLineWeight": 5,
  "routeLineStyle": "solid"
}
```

Settings that are mainly UI preferences should usually remain global, such as:

```json
{
  "showMiniPanel": true,
  "showLabels": true
}
```

Open question:

- Should route-line appearance be saved per route, remain global, or support both?

## Storage model

Portal Route should keep storage backend-agnostic where practical.

Current/persistent storage goals:

- Local browser storage remains the reliable default.
- JSON export/import remains the recovery and portability path.
- Google Drive shared storage remains explicit and user-driven.
- Avoid automatic polling/live sync until conflict behavior is clearly designed.

Storage backends should preserve the same route record shape where possible.

## Local storage

Local storage is the default backend.

Expected behavior:

- save named routes
- load saved routes
- overwrite existing routes after confirmation
- rename routes
- delete routes
- preserve route library across reloads

Local storage should not leak assumptions into the route library UI that would
make shared storage harder later.

## JSON portability

JSON import/export is both a user feature and a safety valve.

Supported behavior:

- export one route
- import one route
- export the whole library
- import/merge a route library

Conflict handling should stay conservative:

- never silently overwrite an unrelated local route
- if an imported route ID already exists, create a duplicate or ask before
  replacing
- keep JSON readable enough for manual repair

## Google Drive shared storage

Google Drive shared storage exists to help users move routes between devices,
especially desktop planning and mobile field use.

Design principles:

- user-driven push/pull is safer than automatic live sync
- visible Drive files are easier to inspect, copy, repair, and back up
- conflict handling should be conservative
- do not surprise the user by silently replacing local routes

Preferred layout:

```text
Google Drive/
  IITC Portal Route/
    route-library.json
```

Future possible layout:

```text
Google Drive/
  IITC Portal Route/
    route-library.json
    current-map.json
```

Open questions:

- Should Drive writes include a device/client ID?
- Should Drive load warn when the remote file is older than local state?
- Should Drive save warn when local and remote have both changed?
- Should shared storage eventually support route-level merge instead of whole
  library replacement?

## IITC sync reference findings

IITC CE `plugins/sync.js` was inspected as a reference.

Findings:

- IITC Sync loads Google's `gapi` client from Google's hosted API script.
- It uses Drive API v3.
- It uses the `drive.file` scope.
- It stores data in a visible folder named `IITC-SYNC-DATA-V3`.
- It creates one Drive file per registered plugin field.
- Plugins register map-like fields through `plugin.sync.registerMapForSync(...)`.
- Sync checks periodically.
- Remote updates can replace local registered map data.
- IITC Sync warns that app-created files can become inaccessible if the Google
  API client ID changes.

Portal Route decision:

- Do not depend on IITC Sync for the primary route library behavior.
- Keep Portal Route route libraries in human-readable JSON.
- Keep shared storage explicit unless conflict handling is improved.
- Use IITC Sync behavior as background knowledge, not as a model to copy blindly.

## Shared map snapshot idea

This is separate from the route library itself.

Goal: make it easier to plan on desktop and continue on mobile without creating
surprising live map sync.

Possible manual actions:

- Save shared view.
- Load shared view.

Possible snapshot:

```json
{
  "schemaVersion": 1,
  "pluginVersion": "1.6.0",
  "updatedAt": "2026-05-16T12:00:00.000Z",
  "deviceName": "desktop",
  "map": {
    "center": { "lat": 43.642, "lng": -72.251 },
    "zoom": 15
  },
  "selectedPortalGuid": "...",
  "activeRouteId": "route-..."
}
```

Avoid at first:

- automatic map sync
- frequent polling
- cross-device writes without conflict handling
- anything that unexpectedly moves the user's map

## Future work

Possible route-library polish:

- clearer Drive/local status
- clearer Save versus Save As behavior
- better conflict warnings
- route folders or tags
- route notes
- better route metadata display
- last-used or recently-used sorting
- schema migration notes as route records evolve
- safer shared storage behavior between desktop and mobile

## Notes for AI assistants

- Keep route library changes conservative.
- Preserve existing local save/load behavior when changing shared storage.
- Prefer small helpers over enlarging existing large functions.
- Do not update generated `dist/` files unless preparing a release or asked.
- Update `CHANGELOG.md` when user-visible behavior changes.
- Update this file when storage or route-record design decisions change.
