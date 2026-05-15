# Route Library Design Notes

Working notes for the Portal Route plugin.

This file records planning decisions, design notes, and implementation context for humans and AI coding assistants working on the project.

## Current target

Version: `1.6.0-dev`

Theme:

Route library with Google Drive shared storage.

The user-facing goal is to save/load named routes and make those routes available from both desktop and mobile. Google Drive is the first external storage target. Implementation should still start with a local backend so the route model and UI can be built safely before adding Drive auth/API work.

Current implementation status:

- Local route records, local storage, Route Library UI, and JSON portability are mostly implemented.
- A synchronous local storage adapter is started.
- IITC Google Drive sync has been inspected.
- Google Drive storage is started as a manual Connect/Pull/Push backend.

Current local-library behavior:

- The Route Library is a separate panel.
- The top row contains whole-library actions: Export Library and Import Library.
- The bottom row contains selected-route actions: Save, Load, Import, Export, Delete.
- With no checked route, Save creates a new saved route.
- With one checked route, Save overwrites that route after confirmation.
- With multiple checked routes, Save and Load are disabled; Export and Delete support multiple routes.
- Route names are edited inline.
- Loading a saved route restores stops, map center/zoom, route-relevant settings, and queues automatic route calculation.

## Guiding decisions

- Keep Route Library Save and Load working while adding shared storage.
- Build the route record schema once and use it for local storage, JSON import/export, and Google Drive.
- Use `localStorage` as the first backend and test harness.
- Keep route storage backend-agnostic where practical.
- Add Google Drive as part of the v1.1.0 target, after the local route library is working.
- Use a visible, user-selected Google Drive folder for the first Drive backend.
- Remember the selected Drive folder ID locally on each device.
- Store known JSON files in that Drive folder.
- Inspect IITC's existing Google Drive sync implementation before building direct Drive integration.
- Treat shared current-map sync as a later subfeature, not the first save/load milestone.
- Avoid automatic polling/live sync until conflict handling is clear.
- Keep changes conservative and avoid making existing large functions larger.

## Route record schema

Saved-route records use `schemaVersion: 1` and look roughly like this:

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

- `schemaVersion` should start at `1`.
- `id` should be stable across saves so overwrite/update works.
- `createdAt` should remain unchanged after the first save.
- `updatedAt` should change whenever the saved record is overwritten.
- `map.center` and `map.zoom` capture the view when the route is saved.
- `route.stops` should contain the same stop data needed by current JSON export/import.
- `settings` should probably include only route-relevant settings, not every UI preference.
- Saved route geometry is not trusted for the local library slice. Loading restores stops and recalculates the route.

Route-relevant settings might include:

```json
{
  "defaultStopMinutes": 5,
  "includeReturnToStart": true,
  "defaultTravelMode": "drive",
  "driveSpeedMph": 30,
  "bikeSpeedMph": 10,
  "walkSpeedMph": 3
}
```

Current implementation note:

- Travel-mode settings now travel with saved routes because they directly affect displayed route timing and export mode.
- Route geometry is still recalculated from stops when a saved route is loaded.

Settings that feel more like user preferences should probably stay global:

```json
{
  "showMiniPanel": true,
  "showLabels": true
}
```

## Storage plan

### Phase 1: local route library

Status: mostly done in `1.1.0-dev`.

Save named routes to browser local storage.

Minimum useful operations:

- Save current route as a named route.
- Load a saved route.
- Overwrite an existing saved route.
- Rename a saved route.
- Delete a saved route.

This is currently handled in the Route Library panel rather than the Settings panel.

The local backend should use the same route record shape planned for Google Drive. Do not let localStorage-only assumptions leak into the route library UI.

### Phase 2: route library UI

Status: mostly done in `1.1.0-dev`.

The UI should expose the useful local library operations without crowding the current route editor.

Likely first behavior:

- Save asks for a route name when saving a new route.
- Save overwrites one checked route after confirmation.
- Load requires exactly one checked route.
- The list shows name, updated time, stop count, and backend label.
- Route library rows use checkboxes. Load and overwrite need exactly one selected route. Export and delete can use one or many.
- Import of one route lives in the selected-route action row.
- Whole-library import/export live in the top action row.

Open questions:

- Do we need Save As separately, or is unchecked Save enough?
- Should selected-route export use a different filename when multiple routes are selected?
- Should library rows eventually support select-all for bulk export/delete?
- Should Drive storage preserve the same checkbox/action model?

### Phase 3: JSON portability

Status: mostly done in `1.1.0-dev`.

Add file-style movement between browsers even before Drive is finished.

Useful operations:

- Export one route.
- Import one route.
- Export the whole route library.
- Import/merge a route library.

Conflict handling can stay simple at first. If an imported route ID already exists, create a duplicate with a changed name rather than silently overwriting.

### Phase 4: storage adapter

Status: started with the local backend; still needs review before Drive.

The route library UI should not talk directly to `localStorage`. Use a small backend interface so other storage backends can be added without replacing the UI.

Approximate shape:

```js
pr.storageBackends = {};

pr.storageBackends.local = {
  id: 'local',
  label: 'This browser',
  loadLibrary: function () {},
  saveLibrary: function (library) {},
  listRoutes: function () {},
  getRoute: function (id) {},
  saveRoute: function (route) {},
  deleteRoute: function (id) {}
};

pr.routeLibraryStorage = function () {
  return pr.storageBackends[pr.state.routeLibraryBackendId] || pr.storageBackends.local;
};
```

Later backends can follow the same shape:

```js
pr.storageBackends.googleDrive = {
  id: 'googleDrive',
  label: 'Google Drive',
  loadLibrary: function () {},
  saveLibrary: function (library) {},
  listRoutes: function () {},
  getRoute: function (id) {},
  saveRoute: function (route) {},
  deleteRoute: function (id) {}
};
```

The current first adapter slice keeps the backend synchronous and local-only. Google Drive may need async behavior later; if so, adapt the UI at the storage boundary rather than spreading Drive-specific code through route-library actions.

### Phase 5: Google Drive shared storage

Google Drive is part of the v1.1.0 target, not merely a distant later idea. Still, build it after the route schema, local backend, and UI behavior are working.

Preferred Drive model:

- User chooses or creates a visible Google Drive folder.
- Plugin remembers the Drive folder ID locally on that device.
- Plugin stores known JSON files in that folder.

Initial layout:

```text
Google Drive/
  IITC Portal Route/
    route-library.json
```

Later layout with shared map handoff:

```text
Google Drive/
  IITC Portal Route/
    route-library.json
    current-map.json
```

Notes:

- In Google Drive, the stable target is a folder ID plus a known file name, not a POSIX-style path.
- Prefer visible Drive files first because they are easier for the user to inspect, copy, back up, and repair.
- Do not start with `appDataFolder`; it may be useful later but is harder to debug and less visible to the user.
- Direct Drive integration likely needs Google auth/API handling unless IITC's existing sync machinery can be reused.
- Avoid silent overwrite behavior when both phone and desktop have changed route data.

### IITC sync reference

Before implementing Drive directly, inspect IITC's existing Google Drive sync code.

Things to learn:

- How IITC authenticates to Google Drive.
- Whether IITC uses visible Drive files or app-specific storage.
- Whether community plugins can register data with IITC sync.
- Whether Portal Route can reuse IITC's auth/session machinery.
- How often IITC syncs.
- Whether sync is full-file replacement or partial updates.
- How IITC handles multiple clients writing near the same time.
- Whether mobile IITC behaves differently from desktop.

Use IITC sync as a reference model, but do not copy unsafe conflict behavior blindly.

Findings from IITC CE `plugins/sync.js`:

- IITC Sync loads Google's `gapi` client directly from `https://apis.google.com/js/api.js`.
- It uses Drive API v3 with `https://www.googleapis.com/auth/drive.file`.
- It stores data in a visible folder named `IITC-SYNC-DATA-V3`.
- It creates one Drive file per registered plugin field, using names like `plugin[field]`.
- Plugins register map-like fields through `plugin.sync.registerMapForSync(...)`.
- Sync checks every 3 minutes.
- Remote updates replace the local registered map when the last update UUID belongs to another client.
- The sync plugin warns developers to treat Drive data as volatile because a Google API client ID change can make old app-created files inaccessible.

Portal Route decision:

- Do not register with IITC Sync for the first Drive slice.
- Reuse the broad working assumptions: `gapi`, Drive v3, `drive.file`, cached folder/file IDs, visible Drive files.
- Keep the route library in a human-readable `route-library.json` file.
- Keep updates manual or action-driven first; do not add timer polling yet.
- Avoid silent conflict resolution until desktop/phone write behavior is tested.

## Shared map snapshot idea

This is a later subfeature, separate from the first route-library save/load flow.

A snapshot could look like this:

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

Initial behavior should be manual:

- Save shared view.
- Load shared view.

Avoid automatic polling or live sync at first. Live sync adds conflicts, stale writes, mobile battery/network concerns, and surprising map jumps.

## Suggested v1.1.0 slices

### Slice 1: route object and local backend

- Define route library schema.
- Add local backend.
- Add helpers such as:
  - `makeRouteRecord()`
  - `serializeCurrentRoute()`
  - `applyRouteRecord()`
  - `loadRouteLibrary()`
  - `saveRouteLibrary()`

No fancy UI required in this slice.

### Slice 2: route library UI

- Save.
- Load.
- Rename.
- Delete.
- Overwrite.
- Multi-select export/delete.

### Slice 3: JSON import/export

- Export selected route or selected routes.
- Import selected route.
- Export whole library.
- Import/merge whole library.

### Slice 4: storage adapter cleanup

- Make local storage conform to the final backend shape.
- Make the UI backend-agnostic.
- Add a backend selector only if useful.

### Slice 5: study IITC sync

- Find the existing IITC Google Drive sync code.
- Document the auth/session model.
- Decide whether Portal Route can reuse it or should build a Drive backend directly.

### Slice 6: Google Drive backend

Use the main v1.1.0 branch if the local route-library pieces are stable. Use a spike branch if the auth or mobile behavior gets uncertain.

Possible branch:

```text
spike/google-drive-route-storage
```

Proof-of-concept goals:

- Choose or create a visible Drive folder.
- Remember the Drive folder ID locally.
- Create or find `route-library.json` in that folder.
- Read it.
- Write it.
- Check desktop and mobile behavior.
- Decide basic conflict behavior.

### Slice 7: shared view snapshot

Start manual first, then consider Drive-backed shared state using `current-map.json`.

## Open questions

- Should route records include all settings, or only route-relevant settings?
- Should loading a route restore map center/zoom automatically? Current behavior: yes.
- Should imported duplicate route IDs overwrite, rename, or create copies?
- Should there be a separate Save As action?
- Should Load remain in the Route Library panel when Drive storage is added?
- Should route library JSON share code with the existing route export/import format?
- Can Portal Route reuse IITC's Google Drive sync credentials or registration hooks?
- What is the safest initial conflict behavior for Drive writes from phone and desktop?

## Notes for AI assistants

- Keep changes conservative.
- Prefer small helpers over enlarging existing large functions.
- Do not implement Drive before the local route model and UI are stable.
- Do not treat Drive as out of scope for v1.1.0; it is part of the release goal once local save/load is working.
- Use visible user-selected Drive storage first unless the user changes direction.
- Do not update generated `dist/` files unless the user asks or the repo workflow requires it.
- Update `CHANGELOG.md` under the correct dev version when user-visible behavior changes.
- Update this file when design decisions change.
