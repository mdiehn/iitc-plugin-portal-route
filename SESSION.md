# Session Notes

This file is a short handoff note for agents working in this repo.

## Current branch

`dev/v1.6.0`

## Current release target

`1.6.0-dev`

## Current work

- v1.6.0 development started after the v1.5.0 release.
- First pass implemented: configurable route line color, thickness, and style settings.
- First pass implemented: saved Home location with name, latitude, and longitude. Home can be saved from a selected portal or picked from the map. Either path adds or updates the interactive Home waypoint immediately.
- First pass implemented: Add Home uses the saved Home coordinates like Add me uses current location.
- First pass implemented: Add Home selects the newly added Home point so existing route actions can immediately use Set as start or Set as end.
- Route list panel action order is Del, Undo, Loop, Fit, Reverse, Print, Save, Load, Menu.
- Route List, Settings, and Route Library panels use fixed action bars with scrolling content areas. Do not change IITC portal-details/sidebar scrolling for this feature.

## Current expectations

- Keep changes small and incremental.
- Preserve current travel-mode, Google routing, ORS beta, and export splitting behavior unless explicitly changing them.
- Keep route appearance and Home settings in global settings.
- Keep Add Home in the shared Menu near Add me.
- Update `README.md` and `CHANGELOG.md` for user-visible changes when appropriate.
- Include a suggested commit message with changes unless the user clearly does not want one.

## Not in scope unless explicitly requested

- Per-leg travel modes
- OSRM routing/export providers
- Distinct line styles or textures by travel mode
- Multi-modal summaries
- Broad refactors
