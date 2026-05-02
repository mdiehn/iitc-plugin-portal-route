# Route Library Design Notes

Working notes for the Portal Route / Driving Route plugin.

This file records planning decisions, design notes, and implementation context for humans and AI coding assistants working on the project.

## Current target

Version: `1.1.0-dev`

Theme:

Route library with Google Drive shared storage.

The user-facing goal is to save/load named routes and make those routes available from both desktop and mobile. Google Drive is the first external storage target. Implementation should still start with a local backend so the route model and UI can be built safely before adding Drive auth/API work.

## Guiding decisions

- Make the existing Save and Load buttons real in v1.1.0.
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

Initial saved-route records should look roughly like this:

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
- Saved plotted route data should probably not be trusted unless explicitly included with enough metadata to know it is still current.

Route-relevant settings might include:

```json
{
  "startOnMe": false,
  "loop": true,
  "stopMinutes": 2
}
```

Settings that feel more like user preferences should probably stay global:

```json
{
  "showMiniPanel": true,
  "showLabels": true
}
```

## Storage plan

### Phase 1: local route library

Save named routes to browser local storage.

Minimum useful operations:

- Save current route as a named route.
- Load a saved route.
- Overwrite an existing saved route.
- Rename a saved route.
- Duplicate a saved route.
- Delete a saved route.

This should wire the existing Save and Load buttons.

The local backend should use the same route record shape planned for Google Drive. Do not let localStorage-only assumptions leak into the route library UI.

### Phase 2: route library UI

The UI should expose the useful local library operations without crowding the current route editor.

Likely first behavior:

- Save asks for a route name when saving a new route.
- If the current route came from a saved record, Save can update/overwrite that record.
- Load opens a list of saved routes.
- The list shows name, updated time, stop count, and backend label.

Open questions:

- Should Save always prompt, or should it update the active saved route by default?
- Do we need Save As separately?
- Should Load live inside the current panel or in a separate dialog?
- Should loading a route restore map center/zoom automatically?

### Phase 3: JSON portability

Add file-style movement between browsers even before Drive is finished.

Useful operations:

- Export one route.
- Import one route.
- Export the whole route library.
- Import/merge a route library.

Conflict handling can stay simple at first. If an imported route ID already exists, create a duplicate with a changed name rather than silently overwriting.

### Phase 4: storage adapter

The route library UI should not talk directly to `localStorage`. Use a small backend interface so other storage backends can be added without replacing the UI.

Approximate shape:

```js
pr.storageBackends = {};

pr.storageBackends.local = {
  id: 'local',
  label: 'This browser',
  listRoutes: function () {},
  getRoute: function (id) {},
  saveRoute: function (route) {},
  deleteRoute: function (id) {}
};
```

Later backends can follow the same shape:

```js
pr.storageBackends.googleDrive = {
  id: 'googleDrive',
  label: 'Google Drive',
  listRoutes: function () {},
  getRoute: function (id) {},
  saveRoute: function (route) {},
  deleteRoute: function (id) {}
};
```

The exact interface can change once implementation starts, but the intent should stay: one route-library UI, multiple storage backends.

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
- Duplicate.
- Overwrite.

### Slice 3: JSON import/export

- Export selected route.
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
- Should loading a route restore map center/zoom automatically?
- Should imported duplicate route IDs overwrite, rename, or create copies?
- Should Save overwrite the active route or always prompt for a name?
- Should there be a separate Save As action?
- Should Load open inside the existing panel or in a separate dialog?
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
