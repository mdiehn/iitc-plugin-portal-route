# Roadmap

Current release: `1.0.0`

Portal Route has reached its first stable release. The main route-building loop is usable now: add portals, add manual points, add current location, loop back to start, drag/edit points, calculate routes, export to staged Google Maps links, import/export JSON, print, and keep state across reloads.

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
- automatic route calculation after route edits
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

- Save and Load currently use a local route library in this browser.
- JSON import/export now covers individual saved routes and the local route library.
- Cross-device sharing is manual only.
- Browser/device location may be coarse or wrong, especially on desktop.
- Mobile hover behavior is limited because touch devices do not really hover.
- Google Maps export works, but the staging/export flow could be clearer.
- Waypoint dragging and portal snapping need more field testing.

## Current focus: v1.1.0

Theme: **route library and Google Drive shared storage**.

The next release should finish the route library by making it shareable between desktop and phone. Local Save and Load are already working in `1.1.0-dev`; Google Drive is the first external storage target.

Implementation started local and boring. The route model, local backend, JSON portability, and UI are now mostly in place. Next, finish the storage adapter shape and add Google Drive behind it.

Current v1.1.0-dev UI state:

- Actions is the primary route-building control.
- Routes calculate automatically after changes.
- The mini control is `M`, `L`, add/remove, route count, and route menu.
- The route list is the working console for day-to-day route work.
- Route-list row actions live in a right-click/long-press menu.
- The settings panel is a small settings/navigation panel with manual Recalc Route.
- The route library is a separate panel with Save, Load, Import, Export, and Delete.
- Local route-library JSON portability works for single routes and whole libraries.

### v1.1.0-a: route record and local library

Status: mostly done in `1.1.0-dev`.

Goal: save and load named routes in this browser.

Implemented work:

- define a saved route record schema
- save the current route as a named route
- load a saved route into the current route
- overwrite/update an existing saved route via Save with one checked route
- rename saved routes
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
- Loading a saved route should restore stops, map view, route-relevant settings, and then recalculate automatically.
- Avoid OAuth in this first slice, but do not design localStorage in a way that assumes it is the only backend.

### v1.1.0-b: route library UI

Status: mostly done in `1.1.0-dev`.

Goal: make route-library Save and Load useful from the Route Library panel.

Implemented work:

- wire Save to save the current route as a new route when none is checked
- wire Save to overwrite one checked route after confirmation
- wire Load to load exactly one checked route
- support inline rename and delete
- support selected-route JSON export/import
- support whole-library JSON export/import
- show where the route is stored, starting with `This browser`
- keep UI text short enough for mobile

Open UI questions:

- Should there be a separate Save As action later, or is unchecked Save enough?
- Should multi-selected route export use a distinct filename/prompt?
- Should loading a route restore map center/zoom automatically? Current behavior: yes.

### v1.1.0-c: storage adapter shape

Status: started in the current worktree.

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

Status: mostly done in `1.1.0-dev`.

Goal: keep route-library data inspectable and movable even before shared storage is finished.

Implemented work:

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

1. Review and commit the local storage-adapter cleanup.
2. Field-test route library and Actions behavior on desktop and phone.
3. Inspect IITC's existing Google Drive sync code.
4. Add Google Drive backend using a visible user-selected Drive folder.
5. Field-test shared storage on desktop and phone.
6. Polish manual point naming if it stays annoying in use.
7. Cut v1.1.0 when saved routes and shared Drive storage feel boring and reliable.

## Release habits

- Do not update generated `dist/` files unless explicitly asked or preparing a release build.
- Source changes belong in `src/`.
- Changelog entries should go under the correct dev/release version.
- User may ask for tarballs containing only updated source/docs files.
- Release names can use format like `Portal Route 1.1.0`.
