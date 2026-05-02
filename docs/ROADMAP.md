# Roadmap

Current release: `1.0.0`

Portal Route has reached its first stable release. The main route-building loop is usable now: add portals, add manual points, add current location, loop back to start, drag/edit points, plot/replot, export to staged Google Maps links, import/export JSON, print, and keep state across reloads.

## Current state: 1.0.0

Done and released:

- portal stops from the IITC portal details panel
- manual map points
- editable manual point names
- selectable map handles and labels
- manual point dragging from handles and labels
- waypoint replacement dragging from numbered labels
  - drop near a loaded portal to replace that waypoint with the portal
  - drop elsewhere to replace it with a manual map point
- waypoint row move/remove controls
- waypoint row drag-and-drop reordering
- per-stop wait times and default stop time
- flexible wait-time inputs such as `15m`, `1.5h`, and `2d`
- stale route tracking after edits
- optional auto-replot after route edits
- explicit Fit Route action
- Start on me
- Add Current Location
- Loop back to start with generated `L` endpoint
- compact mini-control
- optional mini-control and portal info-panel controls
- portal details controls for Add/Remove, Menu, List, Plot/Replot, and Clear
- route summary with drive time, stop time, trip time, and distance
- per-leg segment time/distance in the stop list
- optional segment labels on the map
- Google Maps export
- staged Google Maps links for routes over the practical 11-point limit
- JSON export/import of the current route
- printable route summary
- external route import API used by Fan Fields 2
- persistent current route state across IITC reloads

Known rough edges:

- Save and Load buttons are present but not wired yet.
- Route library does not exist yet.
- JSON import/export is for the current route only, not a saved route collection.
- Cross-device sharing is manual only.
- Browser/device location may be coarse or wrong, especially on desktop.
- Mobile hover behavior is limited because touch devices do not really hover.
- Google Maps export works, but the staging/export flow could be clearer.
- Waypoint dragging and portal snapping need more field testing.

## Current focus: v1.1.0

Theme: **route library and Google Drive shared storage**.

The next release should make Save and Load real. The user-facing goal is a route library that can be shared between desktop and phone, with Google Drive as the first external storage target.

Implementation should still start local and boring. Build the route model, local backend, and UI first so the save/load behavior is reliable. Then add Google Drive behind the same storage shape.

### v1.1.0-a: route record and local library

Goal: save and load named routes in this browser.

Planned work:

- define a saved route record schema
- save the current route as a named route
- load a saved route into the current route
- overwrite/update an existing saved route
- rename saved routes
- duplicate saved routes
- delete saved routes
- show route metadata such as created/updated time and stop count
- save map center/zoom with the route
- decide which route-relevant settings belong in the saved route
- keep current-route persistence separate from the saved route library

Suggested route record fields:

```json
{
  "schemaVersion": 1,
  "pluginVersion": "1.1.0-dev",
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

- Use `localStorage` first as the first backend and test target.
- Save and Load should use the same route record shape that Google Drive will use later.
- Loading a saved route should probably mark plotted route data stale unless route data is explicitly saved and trusted.
- Avoid OAuth in this first slice, but do not design localStorage in a way that assumes it is the only backend.

### v1.1.0-b: route library UI

Goal: make the existing Save and Load buttons useful.

Planned work:

- wire Save to save the current route
- wire Load to show saved routes and load a selected route
- support overwrite/update of an existing route
- support rename, duplicate, and delete if the UI stays simple
- show where the route is stored, starting with `This browser`
- keep UI text short enough for mobile

Open UI questions:

- Should Save overwrite the active saved route or always ask for a name?
- Should Load open inside the existing panel or in a separate dialog?
- Should loading a route restore map center/zoom automatically?

### v1.1.0-c: storage adapter shape

Goal: keep the route library UI mostly independent from the storage backend.

Possible backend shape:

```js
{
  id: 'local',
  label: 'This browser',
  listRoutes: function () {},
  getRoute: function (id) {},
  saveRoute: function (route) {},
  deleteRoute: function (id) {}
}
```

Backends should be able to store the same route record schema:

- local browser storage
- Google Drive visible folder/file
- possible later backends such as WebDAV, Dropbox, or IITC Sync if they fit

### v1.1.0-d: JSON portability

Goal: keep route-library data inspectable and movable even before shared storage is finished.

Planned work:

- export one saved route as JSON
- import one saved route from JSON
- export the whole route library as JSON
- import/merge a route library JSON file
- handle duplicate route IDs safely

Preferred conflict behavior for now:

- do not silently overwrite imported routes
- duplicate/rename on conflict, or ask before overwrite
- keep this simple until real sync exists

### v1.1.0-e: Google Drive shared storage

Goal: let desktop and phone read/write the same route library.

Preferred design:

- Use Google Drive first because IITC/Ingress users already tend to have Google accounts in this workflow.
- Use a visible, user-selected Drive folder, not hidden `appDataFolder` storage.
- Remember the selected Drive folder ID locally on each device.
- Store known JSON files in that folder.

Initial Drive layout:

```text
Google Drive/
  IITC Portal Route/
    route-library.json
```

Later shared-map file:

```text
Google Drive/
  IITC Portal Route/
    current-map.json
```

Before building Drive directly, inspect IITC's existing Google Drive sync implementation to see whether Portal Route can reuse its auth/session/sync machinery, register plugin data with IITC sync, or at least follow IITC's working assumptions.

Likely Drive proof-of-concept goals:

- choose or create a visible Drive folder
- remember the folder ID locally
- find or create `route-library.json` in that folder
- read the route library
- write the route library
- test on desktop and mobile
- avoid silent overwrites when two clients have changed data

## Shared map snapshot

This is useful, but should come after route library storage is working.

Goal: let phone and desktop hand off the current map/route context.

Start manual, not live-sync:

- Save shared view
- Load shared view

Possible snapshot:

```json
{
  "schemaVersion": 1,
  "pluginVersion": "1.1.0-dev",
  "updatedAt": "2026-05-02T12:30:00.000Z",
  "deviceName": "desktop",
  "map": {
    "center": { "lat": 43.642, "lng": -72.251 },
    "zoom": 15
  },
  "selectedPortalGuid": "...",
  "activeRouteId": "route-..."
}
```

Do not start with automatic polling or live sync. Auto-sync adds conflict handling, stale writes, network weirdness, mobile battery concerns, and surprising map jumps.

## External storage notes

Current preference:

- Google Drive first.
- Visible user-selected folder first.
- `appDataFolder` later, only if hidden app-specific storage becomes useful.
- Avoid magic sync behavior until conflicts and stale writes are handled safely.

Why visible Drive storage first:

- easy to inspect
- easy to back up
- understandable to the user
- easier to debug during development
- lets the user decide where shared route files live

Known costs:

- direct Drive integration needs auth/API handling unless IITC's sync layer can be reused
- Drive paths are really folder IDs plus filenames, not POSIX-style paths
- conflict handling matters once desktop and phone can both write

## Post-1.1 route editing polish

Keep these as follow-up polish unless field testing says one is urgent.

Waypoint dragging / snapping:

- tune snap distance threshold
- add better snap-target feedback while dragging
- decide whether snapping should be live during drag or only on drag end
- confirm portal details/selection behavior after waypoint replacement
- confirm manual-to-portal, portal-to-portal, and portal-to-map-point replacement on mobile

Route panel polish:

- review whether compact button labels need more clarity before the next stable release
- possibly separate route-library UI from current-route editing UI if the panel gets crowded
- improve Google Maps stage naming and handoff text if needed

## Later: route-building from selected portals

Feature idea:

- select portals by bookmarks, bounding box, draw-tools polygon, or circle
- designate a start and end
- calculate a route through all selected portals

Open design questions:

- preserve selected order, nearest-neighbor order, or optimized route order?
- how should this integrate with IITC bookmarks and draw-tools?
- how should loops work?
- how should the route preview work before committing?
- how large can a generated route get before the UI/export flow becomes awkward?

## Later: routing/export destinations

Possible future targets:

- Apple Maps links
- Waze links
- copied stop list for external tools
- GPX/KML export if useful
- better Google Maps stage handoff

## Release path

Suggested next path:

1. Start branch `feat/route-library`.
2. Build route record schema and localStorage backend.
3. Wire existing Save/Load buttons to local route-library behavior.
4. Add route-library JSON export/import.
5. Add a storage adapter shape if it is not already present.
6. Inspect IITC's existing Google Drive sync code.
7. Add Google Drive backend using a visible user-selected Drive folder.
8. Field-test route library on desktop and phone.
9. Cut v1.1.0 when saved routes and shared Drive storage feel boring and reliable.

## Release habits

- Do not update generated `dist/` files unless explicitly asked or preparing a release build.
- Source changes belong in `src/`.
- Changelog entries should go under the correct dev/release version.
- User may ask for tarballs containing only updated source/docs files.
- Release names can use format like `Portal Route 1.1.0`.
