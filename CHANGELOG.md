# Changelog

This project is in active development.

Current release: `1.0.0`

## 1.1.0-dev - Unreleased

### Added

- Added route library design notes for the planned v1.1.0 save/load and Google Drive shared storage work.
- Wired Save and Load to a local route library stored in this browser.
- Added schemaVersion 1 saved route records with route metadata, stops, map center/zoom, and route-relevant settings.
- Added inline rename, update, delete, and JSON import/export actions for locally saved routes.
- Added whole-library JSON export and import/merge for the local route library.
- Changed the route library to select rows with checkboxes and use bottom action buttons for selected routes.
- Let route library checkboxes select multiple routes, with Load/Update limited to one route and Export/Delete supporting multiple routes.
- Simplified the mini control, settings panel, route list, and info panel toward the new smart Add workflow.
- Added a shared Add context menu for right-click and long-press actions.
- Moved route-list row actions into a row context menu with delete, rename, set start, and set end.
- Updated remaining route status text for automatic routing.
- Replaced the Settings panel Add button with Recalc Route for manual route refreshes.
- Added Save to the Route Library panel, with confirmation before overwriting a checked saved route.
- Moved single-route Import to the Route Library action row.
- Removed hidden auto-replot and old row-action plumbing after the smart Add refactor.
- Kept the Route Library panel in place while changing row checkbox selection.
- Kept the Route Library panel in place after save, update, delete, and import actions.
- Automatically recalculated routes loaded from the library or restored from saved state.
- Fixed double-clicking a map route handle to open the route list instead of settings.
- Restored the Loop toggle to the mini control under Maps.
- Updated README screenshots for the refreshed controls, route list, settings panel, and route library.
- Set default dialog sizes for settings, route list, and route library panels.
- Updated design docs for smart Add, automatic routing, and current route-library behavior.
- Added an active route-library storage backend helper so the UI can move beyond localStorage.
- Stamped dev build versions with `YYYYMMDDHHMMSS` so userscript updaters notice fresh builds.
- Added an initial Google Drive route-library backend with manual Connect, Pull, and Push actions.
- Added Drive-backed route-library caching with a visible `IITC Portal Route/route-library.json` file.
- Added Route Library panel messages for save/load/import/export and Drive actions.
- Added a shared Route menu for Route, Library, and Settings navigation.

### Changed

- Refactored route panel event handling and map marker rendering into smaller helpers.
- Tightened imported settings handling so only known settings are applied.
- Moved day-to-day route actions onto the route list footer, grouped the footer actions, and shortened route-list labels.
- Tightened the app panel width and added Clear Route to the Data group.
- Moved route summary info to the top of the route list panel and show distance in miles and kilometers.
- Slimmed the settings panel by moving route actions and summary details into the route list workflow.
- Replaced the settings panel Data box with a Route Library button.
- Replaced repeated Route/Library/Settings navigation buttons with a distinct smart menu button.
- Styled the smart route action button separately and renamed smart Add surfaces to Action.
- Kept portal details controls from disappearing after dismissing a context menu.
- Made Action and Menu smart buttons open menus consistently on left-click.

## 1.0.0 - Released - 2026-05-02

### Added

- Manual map point dragging from map handles and numbered labels.
- Waypoint replacement dragging from numbered labels: drop near a loaded portal to replace the waypoint with that portal, or drop elsewhere to replace it with a manual point.
- Portal details panel controls for Add/Remove, Menu, List, Plot/Replot, and Clear.
- Fit Route action for explicitly fitting the plotted route on the map.
- Auto-replot setting for refreshing an existing route after edits.
- Split Google Maps exports into stage links when routes exceed the practical point limit.
- Mini-control and info-panel control visibility settings.

### Changed

- Plotting and replotting no longer move the map automatically.
- Fan Fields 2 imports open the route list.
- Portal details controls sit below the History line and use compact sidebar styling.

## 0.4.0 - Released

### Added

- Start on me option that adds the current browser/device location as the first stop and keeps it first while enabled.
- Add Current Location action for adding the current browser/device location as a normal manual point.
- Loop back to start option with a generated final loop endpoint.
- Generated loop endpoint marker labeled `L`.
- Mini-control `L` button for toggling loop back to start.
- README usage notes and real UI screenshots.

### Changed

- Reorganized the main panel controls into Add, Route, and Data sections.
- Moved route summary information above the action buttons.
- Moved Clear list next to the default stop time control.
- Moved route settings into a single checkbox row.
- Removed the duplicate Close button from the panel body.
- Replaced the duplicate mini-control bottom action with the loop toggle.
- Updated route plotting, labels, Google Maps export, print output, JSON export, and JSON import to handle generated loop endpoints.

### Fixed

- Avoided forcing current location into the route when adding the first portal.
- Kept generated Start on me and loop endpoints from being directly edited, moved, or removed while managed by their settings.

### Known limitations

- Browser/device location may be inaccurate, especially on desktop systems.
- The generated loop endpoint is managed by the loop option, not edited as a normal waypoint.
- Saved route library is planned for a later milestone.

## 0.3.0-dev - Unreleased

### Added

- Manual map points that can be added by tapping/clicking the map.
- Editable names for manual map points.

### Changed

- Renamed the main-panel Add button to Add Portal.

### Fixed

- Manual map-point labels can now be selected from the map.
- The mini-control remove button now removes a selected manual map point.
- Manual map-point names now have a subtle editable-field style.
- Selecting a manual map point now clears IITC portal details instead of leaving the previous portal displayed.

### Known limitations

## 0.2.0-dev - Unreleased

### Added

- Main-panel waypoint editing.
- Add, remove, and move controls for route stops.
- Per-stop wait time editing.
- Flexible duration input such as `15m`, `1.5h`, and `2d`.
- Persistent panel and route state across IITC reloads.
- Stale route tracking after route-affecting edits.
- **Replot** state when the saved route needs recalculation.
- Per-leg route time and distance display in the stop list.
- Optional map labels for per-segment drive times.
- Google Maps export for the current route.
- Warning before Google Maps export when routes exceed the observed 11-point limit.
- JSON route export and import.
- Printable route summary.
- Development version display in the panel.
- Metadata file generation during build.

### Changed

- Renamed the plugin from Driving Route to Portal Route.
- Renamed Calculate behavior and UI language toward Plot/Replot.
- Reworked waypoint rows from table markup to div/grid markup.
- Moved segment time/distance into the stop row to keep the list height stable.
- Let long portal names truncate before segment data truncates.
- Simplified panel styling so it fights IITC and jQuery UI less.
- Improved mobile-oriented panel sizing and controls.
- Switched mobile-unfriendly glyphs and emoji to plain ASCII controls.
- Made route map overlays non-blocking so they do not interfere with portal selection.

### Fixed

- Waypoint markers blocking portal selection.
- Hover labels blocking portal selection.
- Panel recentering itself after clicks.
- Horizontal scrollbar in the route panel.
- Missing or clipped remove-stop button in waypoint rows.
- Yellow badge and border styling regressions in waypoint controls.
- Control centering problems in waypoint rows.
- Blank printable route page in some browsers/WebViews.

### Known limitations

- Hover labels still do not behave especially well on mobile.
- Panel bottom anchoring near IITC mobile nav/status areas may still need refinement.
- Route persistence restores saved data but does not automatically recalculate directions on reload.
- Google Maps export may omit stops after the ninth intermediate stop when routes exceed 11 total points.
- Long Google Maps routes are warned about, but not split yet.

## 0.1.x - Early development

### Added

- Initial mobile-first route planning plugin structure.
- Mini-control for route actions.
- Portal waypoint selection.
- Route plotting through Google directions data.
