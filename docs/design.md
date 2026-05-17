# Portal Route Design

Current as of: `1.6.0`

Portal Route is a mobile-first IITC plugin for planning practical routes through
Ingress portals, manual map points, current location, and a saved Home location.

This file is the high-level design overview. It describes the shape of the
plugin and the main design decisions. Release history belongs in `CHANGELOG.md`;
future planning belongs in `docs/ROADMAP.md`.

## Product goal

Portal Route helps an agent build, edit, save, and export ordered routes inside
IITC without leaving the map.

The core workflow is:

1. Add portals, manual points, current location, or Home to a route.
2. Reorder, rename, duplicate, drag, remove, loop, or reverse route points.
3. Let the plugin calculate route geometry and timing.
4. Save, load, print, or export the route for field use.

## Current feature model

Portal Route supports:

- ordered route stops from portals, manual map points, current location, and Home
- selectable and editable waypoints
- draggable manual, Add Me, and Home points
- waypoint reordering and duplication
- route loop/unloop
- route reversal
- undo for recent route edits
- per-stop wait time
- default stop time
- route-level travel mode: drive, bike, or walk
- per-mode average speed settings for time estimates
- automatic route recalculation after route-affecting edits
- stale/current route state while recalculation is pending
- route distance, travel time, stop time, trip time, and per-leg details
- configurable route line color, thickness, and style
- current-route JSON import/export
- saved-route and whole-library JSON import/export
- local route library
- Google Drive shared route storage
- staged Google Maps export for long routes
- Apple Maps export
- printable route summary
- current route restore after IITC reloads
- external route import API for other IITC plugins

## Route model

A route is an ordered list of stops.

A stop may come from:

- a selected portal
- a manual map point
- browser geolocation through Add Me / current location
- the saved Home location
- an external plugin handoff

Route stops may carry:

- display name
- latitude and longitude
- portal identity, when available
- stop wait time
- source/type metadata
- marker/display hints such as Home styling

Route geometry is derived from the current stop list and routing settings. Saved
route geometry should not be treated as authoritative; loading a route should
restore stops and recalculate geometry when possible.

## Travel modes and timing

Portal Route currently has route-level travel mode support.

Supported modes:

- drive
- bike
- walk

The selected mode affects:

- travel-time estimates
- Google Maps export mode
- settings carried through saved routes and restored route state

Per-leg travel modes and multi-modal summaries are not part of the current
design. They remain future work.

## UI surfaces

Portal Route uses several focused UI surfaces instead of one large control panel.

### Mini control

The mini control is the compact always-available map control.

It provides quick access to common actions such as:

- map export
- loop/unloop
- add/remove or smart add behavior
- route count / Route List
- menu/settings

The mini control should stay small, mobile-friendly, and usable while viewing the
map.

### Settings panel

The Settings panel holds configuration and navigation to secondary tools.

It is not a separate “main panel.” Route editing belongs mostly in the Route List
and map interactions.

Settings content may scroll, but its action buttons should stay reachable.

### Route List panel

The Route List is the day-to-day route editing console.

It handles:

- route point selection
- route point ordering
- route point edits
- direct route actions such as Del, Undo, Loop, Fit, Reverse, Print, Save, Load,
  and Menu

The waypoint list should scroll independently while the action bar stays pinned.

### Route Library panel

The Route Library handles saved routes and route-library portability.

It handles:

- save
- load
- rename
- overwrite
- delete
- selected-route import/export
- whole-library import/export
- shared storage actions

The saved-route list should scroll independently while action buttons stay
reachable.

### IITC portal/details section

Portal Route adds compact controls to IITC’s portal/details sidebar.

This area should remain conservative. IITC owns the surrounding sidebar behavior,
so Portal Route should avoid fighting its scrolling, sizing, and layout unless
there is a specific bug.

## Storage model

Portal Route uses a route record shape that can be used by local storage, JSON
export/import, and shared storage.

Current storage paths:

- browser local storage for the normal local route library
- JSON files for backup, sharing, and recovery
- Google Drive shared storage for explicit cross-device handoff

Shared storage should remain user-driven unless conflict handling is designed
carefully. Avoid surprising automatic live sync.

## Routing model

Portal Route calculates route geometry after route-affecting edits.

Design rules:

- route edits should queue automatic recalculation when there are enough stops
- stale route state should be visible while recalculation is pending
- manual Recalc should remain available as a fallback
- routing-provider failures should not destroy the route stop list
- routing behavior should preserve existing Google and ORS beta behavior unless a
  change is intentional

Current routing/export behavior includes Google-based routing and opt-in
OpenRouteService beta routing.

## Export model

Portal Route exports routes to external tools, but external tools may not support
all Portal Route behavior.

Design rules:

- explain export limits clearly
- stage long exports when needed
- avoid implying that every waypoint will survive an external handoff when the
  target tool has waypoint limits
- keep map export separate from route library save/load

Known important behavior:

- Google Maps supports a limited number of stops in a single link.
- Portal Route uses staged Google Maps links for long routes.
- Export instructions should be clear enough for mobile field use.

## Home location

Home is a saved location with a name, latitude, and longitude.

Home can be set from:

- a selected portal
- a picked map point

Add Home adds or updates an interactive Home waypoint. Home waypoints should stay
editable like normal route points. The distinct Home marker is a display hint,
not a locked special route type.

## Bulk route creation and plugin handoff

Portal Route can receive route data from other IITC plugins through its external
route import API.

Current direction:

- keep plugin handoff simple and explicit
- preserve existing route-building behavior
- warn before large route operations
- treat route optimization as a separate explicit step, not a hidden side effect

## Design principles

Prefer:

- mobile-first controls
- short UI text
- compact panels
- focused panels with clear jobs
- direct buttons for direct actions
- contextual menus for less common actions
- automatic route calculation with clear stale/fallback behavior
- inspectable storage and recoverable JSON
- conservative integration with IITC

Avoid:

- hover-only controls for core workflows
- wide tables
- tiny mobile-critical buttons
- controls that fight IITC’s own sidebar behavior
- hidden automatic sync
- silent overwrite behavior
- duplicating every action in every panel
- large refactors without a clear reason

## Related docs

- `CHANGELOG.md` — release history and user-visible changes
- `docs/ROADMAP.md` — forward-looking feature plan
- `docs/route-library-design.md` — route library, storage, schema, and shared storage
- `docs/ui-model-and-interaction-notes.md` — UI surfaces and interaction rules
- `docs/usability-and-ux-gaps.md` — current rough edges and small UX polish
- `SESSION.md` — short current handoff notes
- `AGENTS.md` — repo guidance for coding agents

## Credit

Portal Route is a separate implementation inspired in part by the IITC Traveling
Agent plugin by yavidor and the Map Route Planner plugin by DanielOnDiordna.
