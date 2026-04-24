# IITC Driving Route

Mobile-first IITC plugin for planning a driving route through selected portals.

The plugin is intended to help agents build a portal route, show the route order on the map, estimate drive time for each segment, include expected stop time at portals, and open the route in an external navigation app.

## Status

Early first-pass implementation.

Phase 1 is focused on a manual route planner:

- add portals to a route
- preserve manual route order
- label stops on the map
- calculate a driving route
- show per-leg drive time and distance
- show total drive time, stop time, trip time, and distance
- open the route in Google Maps

Route optimization, saved routes, per-portal stop-time overrides, and in-plugin turn-by-turn directions are deferred.

## Mobile-first design

IITC Mobile support is a high priority.

The UI avoids:

- hover-only controls
- tiny buttons
- wide tables
- drag-and-drop-only behavior

The route panel uses stacked rows/cards so it works better on phones.

## Repository layout

```text
build/
  build.sh

dist/
  driving-route.user.js

docs/
  design.md
  design-phase-1.md

src/
  banner.js
  wrapper-start.js
  constants.js
  state.js
  storage.js
  format.js
  portal-actions.js
  route-model.js
  route-google.js
  render-map.js
  render-panel.js
  export-links.js
  ui.js
  wrapper-end.js
```

## Building

From the repository root:

```bash
bash build/build.sh
```

The built userscript is written to:

```text
dist/driving-route.user.js
```

Optional syntax check:

```bash
node --check dist/driving-route.user.js
```

## Installing for testing

Use the raw URL for `dist/driving-route.user.js` after pushing to GitHub, or load the built file directly into your userscript manager.

For local development, a separate dev-loader userscript may be useful later, but this first pass assumes a normal built userscript.

## Phase 1 features

### Route panel

The plugin adds a collapsible route panel with:

- stop count
- default stop-time setting
- ordered stop list
- route totals
- calculate route button
- Google Maps button
- clear route button

### Portal action

Portal details should include:

```text
Add to Driving Route
```

The selected portal is appended to the current route.

### Stop labels

Each portal in the route gets a numbered map label using a Leaflet `L.divIcon()` marker.

### Driving route

The plugin attempts to use Google Maps Directions support when available in IITC.

The route result is normalized into internal leg data containing:

- source stop
- destination stop
- distance
- drive time

### Stop time

The default stop time is 5 minutes per portal.

This is editable from the panel and stored locally.

### External navigation

The plugin can create a Google Maps directions URL using the current route order.

Long routes may exceed external navigation waypoint limits. Better splitting and warnings are planned for later versions.

## Design docs

- [Design overview](docs/design.md)
- [Phase 1 design](docs/design-phase-1.md)

## Development notes

Phase 1 intentionally keeps behavior simple:

- manual order only
- one global stop-time value
- no route optimization
- no saved named routes
- no per-portal stop-time overrides
- no turn-by-turn directions inside IITC

This keeps the first usable version smaller and easier to test on IITC Mobile.

## Credits

This plugin is a separate implementation inspired in part by the IITC Traveling Agent plugin by yavidor.
