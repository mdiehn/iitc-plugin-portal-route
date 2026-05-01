# docs/ROADMAP.md

## Current release: 0.5.0

Main goal: improve route point handling and map interaction.

Already done or mostly done:
- manual map points
- editable manual point names
- selectable manual point handles
- draggable manual point handles and labels
- explicit Fit Route action
- optional auto-replot after route edits
- route panel layout updates
- external route import API
- start-on-me control
- loop-back-to-start control
- Google Maps export warning for the 11-point practical limit
- mobile delete buttons fixed
- input field behavior fixed

Current task:
- polish route editing behavior

Manual dragging expectations:
- manual markers should be draggable
- after drag, the waypoint coordinates should update
- marker and list selection should remain consistent
- route state should update as needed
- visual feedback during drag is desired
- use the thinner marker/handle option

## Later: portal waypoint dragging

Planned behavior:
- dragging a portal waypoint away from portals converts it into a manual/map point
- portal title/details are cleared
- a new manual point name is assigned
- dragging any waypoint near a portal should offer snap-to-portal behavior
- dragging near another portal may convert/snap the waypoint to that portal
- portal details and selection state should follow the snapped portal

Open design questions:
- snap distance threshold
- how to show snap target feedback
- whether snapping happens live during drag or only on drag end

## Later: route splitting / export limits

Google Maps behavior observed:
- first route point is used
- final route point is used
- up to 9 intermediate stops are used
- with more than 11 total points, Google Maps leaves off everything between the ninth stop and final destination

Current state:
- warning already exists

Future work:
- split exports into multiple Google Maps route stages
- possibly generate several links
- keep each link within the practical Google Maps point limit
- make the split understandable in the UI

## Later: route-building from selected portals

Feature idea:
- select portals by bookmarks or bounding box / draw-tools polygon / circle
- designate a start and end
- calculate a route through all selected portals

Open design questions:
- whether to preserve selected order, nearest-neighbor order, or optimized route order
- how to integrate with IITC bookmarks and draw-tools
- how to handle loops
- how to show route preview before committing

## Release path toward 1.0.0

Likely path:
1. Finish manual point dragging.
2. Clean up docs/changelog.
3. Close current dev release.
4. Implement route splitting/export limit handling.
5. Implement portal waypoint dragging/snap behavior.
6. Improve selection/import/export polish.
7. Do a compatibility pass across desktop/mobile IITC.
8. Release 1.0.0 when route creation, editing, dragging, import/export, and mobile use are reliable.

## Release habits

- Do not update generated dist files unless explicitly asked.
- User may ask for tarballs containing only updated source/docs files.
- Changelog entries should go under the correct dev version.
- Release names can use format like `Portal Route 0.4.0`.
