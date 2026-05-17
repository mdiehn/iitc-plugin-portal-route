# Usability and UX Gaps

Current as of: `1.6.0`

## Purpose

Track current usability rough edges and small UX improvements for Portal Route.

This is not a changelog and not the main roadmap. Completed release work belongs
in `CHANGELOG.md`. Larger planned features belong in `ROADMAP.md`.

## Current usability baseline

- Route building works from portals, manual points, current location, and Home.
- Route points can be selected, renamed, duplicated, removed, dragged, reordered,
  looped, reversed, saved, loaded, printed, and exported.
- Route calculation is automatic after route-affecting edits, with manual Recalc
  still available as a fallback.
- Route List, Route Library, and Settings are separate panels with focused jobs.
- Long panels keep their action buttons visible while their content scrolls.
- The IITC portal/details section is kept compact and should not fight IITC’s
  own sidebar behavior.

## Active usability gaps

### Mobile field testing

- Field-test waypoint dragging and replacement on mobile.
- Field-test Home picking and Home marker behavior on mobile.
- Field-test pinned action bars in Route List, Route Library, and Settings.
- Watch for panels that are still too tall, too wide, or hard to dismiss.

### Route failure feedback

Current route calculation failures need clearer user-facing messages.

Possible improvements:

- explain when the routing provider failed
- explain when a route segment cannot be calculated
- preserve stale route state clearly
- offer simple recovery actions, such as Retry, Recalc, or switch provider

### Google Maps staged export text

Long-route export works, but the handoff text may need more field testing.

Possible improvements:

- clearer stage numbering
- clearer warning that some external apps cannot represent all stops
- clearer mobile instructions
- better distinction between export stages and saved routes

### Current location accuracy

Browser geolocation can be coarse or wrong, especially on desktop.

Possible improvements:

- show accuracy when available
- warn when accuracy is poor
- make it clear when Add Me used browser location
- avoid treating current location as more precise than it really is

### Manual point names

Manual points are easy to rename, but automatic names are still generic.

Possible improvements:

- use coordinates as a clearer fallback label
- optionally reverse-geocode a nearby street/address
- optionally use a nearby portal name if the point was placed near one

Design caution:

- reverse geocoding may require API keys, quota management, or another external
  service

### Hover and touch behavior

Touch devices do not have reliable hover behavior.

Possible improvements:

- make important labels/actions available through tap or long-press
- avoid relying on hover-only affordances
- test row/context menus on mobile browsers

## Small polish candidates

- Clearer selected-waypoint state.
- Explicit Set Start and Set End actions.
- Better duplicate handling when adding or importing route points.
- Better empty-state text in Route List and Route Library.
- Better confirmation wording for destructive actions.
- Better status text after Save, Load, Push, Pull, Import, and Export.
- Better explanation when route data is stale.
- Better default names for Home and manual points.

## Things to avoid

- Do not add controls everywhere just because an action exists.
- Do not make the IITC portal/details section fight IITC’s own scrolling/sidebar behavior.
- Do not rely on hover for mobile-critical actions.
- Do not make shared storage feel like live sync unless conflict behavior is designed.
- Do not hide route failure details behind a generic “failed” message.

## Completed usability improvements

Keep this short. Details belong in `CHANGELOG.md`.

- Automatic route recalculation replaced Plot/Replot as the normal workflow.
- Mini control was simplified for mobile use.
- Route List, Route Library, and Settings were split into focused panels.
- Route List rows became easier to edit, reorder, and manage.
- Route Library added named saves, import/export, and shared storage support.
- Long panel action bars were pinned so buttons stay reachable.
- Home location support was added.
- Route line color, thickness, and style settings were added.
- Loop, Fit, Reverse, Print, Save, Load, and Menu controls were made easier to reach.
