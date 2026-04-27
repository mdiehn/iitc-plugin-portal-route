# IITC plugin: Driving Route

Driving Route is an IITC plugin for planning a driving route through selected Ingress portals.

The plugin is being built for mobile-first use, but it also works on desktop IITC. It focuses on selecting portals as stops, plotting the driving route, tracking stop time, and exporting the waypoint route to Google Maps.

## Current status

Current milestone: `0.2.0-dev`

This project is still in active development. The current code is usable enough for local testing, but release tracking and public packaging are still being built out.

## Main features

- Add selected portals as route waypoints.
- Edit waypoints in the main route panel.
- Remove and reorder waypoint stops.
- Set a default stop time per portal.
- Override stop time per waypoint.
- Accept flexible stop-time input like `15m`, `1.5h`, and `2d`.
- Plot a driving route through the waypoint list.
- Show total driving time, stop time, trip time, and distance.
- Show route leg details between the two waypoint rows they describe.
- Mark route state stale after route-affecting edits.
- Show Replot when the saved route needs recalculation.
- Persist waypoints and plotted route data across IITC reloads.
- Optionally show per-segment drive-time labels on the map.
- Export the waypoint route to Google Maps.

## Development build

The userscript is built by concatenating files from `src/`.

```bash
./build.sh
```

Generated files are expected under `dist/`, including:

```text
dist/iitc-plugin-driving-route.user.js
dist/iitc-plugin-driving-route.meta.js
```

The generated userscript should be treated as build output. Source changes should be made in `src/`.

## Versioning

The current version is stored in:

```text
VERSION
```

The userscript metadata version is stored in:

```text
src/banner.js
```

For now, keep those in sync manually.

## Project notes

Design notes and the active roadmap are tracked in:

```text
docs/DESIGN.md
```

Changes by milestone are tracked in:

```text
CHANGELOG.md
```
