# Portal Route UI Model and Interaction Notes

Working UI notes for the Portal Route plugin.

This file describes the current UI model, interaction rules, and known UI polish
areas. It is not a release plan. Completed release work belongs in
`CHANGELOG.md`; larger future feature planning belongs in `docs/ROADMAP.md`.

## Current UI surfaces

Portal Route currently has five main UI surfaces:

- Mini control
- Settings panel
- Route List panel
- Route Library panel
- IITC portal/details section

There is no separate “main panel.” Older notes may use that phrase, but the
Settings panel is now the primary full panel.

## Mini control

The mini control is the compact, always-available control surface, especially on
mobile.

Current role:

- provide quick access to map/export actions
- provide quick access to loop/unloop
- provide quick add/remove behavior
- show the current waypoint count
- open the Route List
- open the Settings/Menu panel

Design rules:

- keep it compact
- avoid duplicate controls that already live in larger panels
- keep tap behavior fast and predictable
- keep long-press/right-click behavior reserved for contextual menus where useful
- avoid tooltips on mobile controls because they obscure the UI

## Settings panel

The Settings panel holds configuration and secondary navigation.

Current role:

- route behavior settings
- routing engine/settings
- travel mode and speed settings
- route line appearance settings
- Home location settings
- access to Route List
- access to Route Library
- manual recalculation fallback

Design rules:

- Settings is not the main route editing console.
- Settings may be taller than the screen on mobile.
- Settings content should scroll independently while action buttons remain
  reachable.
- Direct route-editing actions should generally live in the Route List or map UI,
  not as a growing pile of buttons in Settings.

## Route List panel

The Route List is the working console for the active route.

Current role:

- show route waypoints in order
- select route points
- reorder route points
- rename/edit route points
- remove route points
- duplicate route points
- access route-level actions such as Undo, Loop, Fit, Reverse, Print, Save,
  Load, and Menu

Current button order:

```text
Del  Undo  Loop  Fit  Reverse  |  Print  Save  Load  Menu
```

Design rules:

- waypoint rows should scroll independently
- the action bar should stay visible
- avoid crowding the main button bar with every possible selected-waypoint action
- mobile behavior matters as much as desktop behavior
- explicit Set Start and Set End are future convenience actions, not a new route
  editing model

## Route Library panel

The Route Library manages saved routes.

Current role:

- save the current route
- load a saved route
- rename saved routes
- delete saved routes
- import/export route JSON
- import/export the whole route library
- interact with shared storage where available

Design rules:

- saved-route rows should scroll independently
- library action buttons should stay visible
- library/storage actions should remain distinct from map/export actions
- shared storage should be explicit and user-driven unless conflict handling is
  improved
- avoid surprising overwrite behavior

## IITC portal/details section

Portal Route also appears inside IITC’s portal/details sidebar.

Current role:

- show Portal Route actions related to the currently selected portal
- provide compact access to route controls in the context of portal selection

Design rules:

- do not fight IITC’s own portal/details scrolling or layout behavior
- keep this section compact
- avoid adding pinned footers or custom scroll behavior inside IITC-owned UI
- prefer simple links/buttons styled consistently with IITC details plugins
- make changes here cautiously because it shares space with other IITC plugin UI

## Interaction model

### Primary actions

Tap/click should perform the most likely direct action.

Examples:

- tap the waypoint count to open the Route List
- tap Loop to toggle loop/unloop
- tap Fit to fit the route on the map
- tap Add Home to add or update the Home waypoint

### Context menus

Long-press/right-click may expose less common actions.

Useful places for contextual behavior:

- mini control add/remove button
- Route List rows
- map right-click/long-press
- selected waypoint controls

Design rules:

- context menus should not be required for the basic workflow
- context menus should be shared where practical
- prevent browser default context menus only where Portal Route handles the event
- keep mobile long-press behavior tested and intentional

### Selection behavior

Selection is the context for point-specific actions.

Current behavior:

- route points can be selected
- selected points can be edited through existing route workflows
- selected portals can be added to the route
- Home is a normal editable waypoint with distinct marker styling

Design rules:

- selected-waypoint actions should work for portal, manual, Add Me, and Home
  points
- Home should not become a locked special object
- selected-waypoint actions should avoid cluttering always-visible controls

## Route recalculation behavior

Route calculation should be automatic after normal route edits.

Expected recalculation triggers:

- add point
- remove point
- reorder point
- drag point
- loop/unloop
- reverse route
- change route-relevant routing settings

Manual Recalc Route remains useful as a fallback, especially when routing service
behavior is uncertain or a route becomes stale.

Design rules:

- do not bring back Plot/Replot as the main workflow
- debounce route recalculation where needed
- clearly show stale route state when route geometry no longer matches stops
- keep manual Recalc available but secondary

## Map/export versus Library

Map/export actions and Library actions are separate concepts.

Map/export means sending or presenting the active route somewhere else, such as:

- Google Maps staged links
- Apple Maps
- print output
- future export destinations

Library means saving and loading Portal Route records, such as:

- local saved routes
- route JSON files
- full library JSON
- shared storage route library

Design rules:

- do not hide map/export under Library
- do not make Library responsible for external navigation handoff
- export warnings should explain what the target can and cannot represent

## Known UI gaps

### Set Start and Set End

Current state:

- a waypoint can already become the start or end by reordering it in the Route
  List

Planned convenience actions:

- Set Start: move the selected waypoint to the first route position
- Set End: move the selected waypoint to the last route position

Design notes:

- these should work for portal, manual, Add Me, and Home waypoints
- these should probably appear only when a waypoint is selected
- these may belong in a selected-waypoint contextual menu or row-level controls
- avoid crowding the main Route List action bar

### Map long-press/right-click menu

Possible future actions:

- Add point here
- Add nearby portal
- Set Home here
- Start route here
- End route here

Design notes:

- keep this optional; basic route building should not require it
- avoid interfering with existing IITC map interactions
- test carefully on mobile

### Route optimization action

Possible future action:

- Optimize order

Design notes:

- route optimization should be explicit
- bulk selection should not automatically optimize unless the user asks
- optimization behavior may depend on travel mode and routing provider

### Export-provider polish

Possible future work:

- clearer staged Google Maps export
- additional export targets if they earn their keep
- provider-specific warnings when a target cannot represent the full route
- better handoff instructions for mobile use

## Completed UI simplification work

- Removed Plot/Replot as the normal route-building workflow.
- Made route calculation automatic after route edits.
- Added the compact mini control.
- Separated Settings, Route List, and Route Library responsibilities.
- Kept Settings as the primary full panel rather than maintaining a separate
  main panel.
- Added Maps/export access outside the Library.
- Improved mobile control behavior.
- Removed mobile tooltips that obscured controls.
- Added route-level travel mode selection.
- Added route engine settings.
- Added per-mode speed settings for estimated travel time.
- Added route line color, thickness, and style settings.
- Added saved Home location settings and Home waypoint behavior.
- Added Loop/Unloop beside Fit in route control surfaces.
- Moved Reverse Route into the Route List controls.
- Pinned action bars in long standalone panels.
- Left IITC portal/details sidebar behavior under IITC control.

## Notes for AI assistants

- Treat this file as current UI guidance, not an old phased implementation plan.
- Do not reintroduce “main panel” language.
- Do not treat Set Start or Set End as already implemented explicit buttons.
- Do not make broad changes to the IITC portal/details section unless the user
  asks for that specifically.
- Prefer small UI changes that preserve the current mobile workflow.
- Keep `CHANGELOG.md` for release history and `docs/ROADMAP.md` for larger
  forward planning.
