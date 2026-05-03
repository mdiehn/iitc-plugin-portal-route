# Usability notes

Practical UI/UX notes for `iitc-plugin-portal-route`.

This file is current as of `1.1.0-dev`. Older Plot/Replot notes have been folded into the automatic routing model.

## Fixed issues

### Map interaction

- Waypoint markers no longer block portal selection.
- Hover labels no longer block portal selection.
- Route overlays no longer block normal map interaction.
- Manual map points can be dragged from map handles.
- Numbered waypoint labels can be dragged to replace a stop with a nearby portal or manual map point.

### Mini control

- Replaced mobile-unfriendly glyphs and emoji with plain labels.
- Simplified the control around Maps, Loop, Action/add/remove, route count, and the route menu.
- Removed Plot/Replot as a primary control because route calculation is automatic.
- Kept long-press/right-click behavior for the Action context menu.

### Panels and dialogs

- Reduced panel width and font size.
- Removed most custom CSS that fought IITC styles.
- Stopped the panel recentering on every click.
- Removed the horizontal scrollbar.
- Mobile panels stay compact and map-friendly.
- Controls no longer move panels unexpectedly.
- Route list, settings, and route library are separate panels with focused jobs.

### Waypoint editing

- Added manual map points from map tap/click mode.
- Added editable names for manual map points.
- Replaced table-based rows with div/grid rows.
- Fixed the clipped remove-stop button.
- Restored stable numbered badges.
- Added per-stop wait-time editing.
- Added flexible wait-time input such as `15m`, `1.5h`, and `2d`.
- Moved row actions into right-click/long-press menus.
- Added drag-and-drop waypoint reordering.
- Added reverse route, clear route, Start on me, Add Current Location, and loop back to start.

### Route behavior

- Route calculation now queues automatically after route-affecting edits.
- Route data is still marked stale while recalculation is pending.
- Persisted route state across IITC reloads.
- Added optional segment drive-time labels on the map.
- Added staged Google Maps links for long routes.
- Added current-route JSON export and import.
- JSON import only applies known settings and ignores unknown setting keys.
- Added printable route summary output.
- Fixed blank print output in some browsers/WebViews.

### Route library

- Save and Load now use a local route library in this browser.
- Saved routes can be named, renamed, loaded, overwritten, deleted, exported, and imported.
- Multiple saved routes can be selected for export or delete.
- Whole route libraries can be exported and imported as JSON.
- The storage backend shape now has a local adapter and is ready to grow toward Drive.

### Segment display

- Tried segment details between rows.
- Tried segment details on a second line inside the stop row.
- Tried segment details inline with the stop row.
- Current direction: inline segment data, with long portal names truncating first.

## Known limitations

### Mobile hover behavior

Hover labels are still limited on mobile because touch devices do not have reliable hover.

### Browser/device location

Current location depends on browser geolocation. Desktop location may be coarse or wrong.

### Manual point names

Manual points are easy to rename, but their automatic names are still generic. A useful next improvement would be reverse-geocoding a nearby street address or place name.

Possible sources:

- Google Maps/Places or Geocoding API, if auth and quota are acceptable
- another lightweight reverse-geocoding service if it fits IITC/mobile constraints
- coordinates as a better fallback label

### Shared storage

Cross-device route sharing is still manual JSON import/export.

The next major usability improvement is Google Drive shared storage:

- visible user-selected Drive folder
- `route-library.json`
- manual read/write first
- no automatic live sync until conflict behavior is clear

## Remaining polish

- Field-test waypoint replacement dragging on mobile.
- Improve failures when a route cannot be calculated.
- Improve Google Maps stage handoff text if needed.
- Decide whether manual points should fetch a street address, place name, or both.

## Later ideas

- Route optimization.
- Apple Maps and Waze links.
- GPX/KML export.
- Manual shared map/view handoff with `current-map.json`.
- Turn-by-turn directions inside IITC.
