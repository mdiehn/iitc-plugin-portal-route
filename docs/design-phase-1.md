# IITC Driving Route Plugin - Phase 1 Design

## Purpose

`iitc-plugin-driving-route` helps an IITC user plan a driving route through selected portals.

Phase 1 is a mobile-first manual route planner.

## Phase 1 feature set

- Add portals to an ordered route from the portal details panel.
- Show a collapsible mobile-friendly route panel.
- Label portals on the map by route order.
- Calculate a driving route through selected portals.
- Show drive time and distance for each route segment.
- Show total drive time, stop time, trip time, and distance.
- Support one global stop-time setting, defaulting to 5 minutes.
- Open the current route in Google Maps.

## Mobile-first rules

- No hover-only controls.
- No tiny buttons.
- No wide tables.
- No drag-and-drop dependency.
- Use stacked route cards instead of table rows.
- Keep the map usable while the panel is open.

## Deferred features

- Route optimization.
- Manual reordering.
- Player/map-center start location.
- Return-to-start routing.
- Per-portal stop-time overrides.
- Apple Maps and Waze links.
- Saved named routes.
- Turn-by-turn directions inside IITC.
