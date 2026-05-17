# Session Notes

This file is a short handoff note for agents working in this repo.

## Current branch

`main` after the v1.6.0 release merge.

## Current release

`1.6.0`

## v1.6.0 release summary

- Added configurable route line color, thickness, and style settings.
- Added saved Home location with name, latitude, and longitude.
- Home can be saved from a selected portal or picked from the map.
- Add Home adds or updates an interactive Home waypoint.
- Added a distinct Home marker while keeping Home waypoints editable like other map points.
- Added Loop/Unloop beside Fit in the route controls.
- Moved Reverse Route into the Route List controls.
- Route List, Settings, and Route Library panels use fixed action bars with scrolling content areas.
- IITC portal-details/sidebar scrolling was intentionally left unchanged.

## Current expectations

- Keep changes small and incremental.
- Preserve current travel-mode, Google routing, ORS beta, and export splitting behavior unless explicitly changing them.
- Update `README.md` and `CHANGELOG.md` for user-visible changes when appropriate.
- Include a suggested commit message with changes unless the user clearly does not want one.

## Documentation cleanup notes

After preparing v1.6.0, several docs were found to contain stale v1.1-v1.3
planning language. The cleanup direction is:

- `ROADMAP.md` should be plan-first, not a history lesson.
- Future roadmap items should be organized by feature area, not old release buckets.
- Completed work can be summarized briefly at the bottom of the roadmap.
- `route-library-design.md` should describe the current route library/storage
  model, not old v1.1 implementation slices.
- The old UI simplification plan should become `ui-model-and-interaction-notes.md`.
- The old usability notes should become `usability-and-ux-gaps.md`.
- `CHANGELOG.md` remains the place for release-by-release history.

Important corrections made during review:

- Bulk portal selection is not purely future work. First-pass polygon/circle
  selection, large-selection warnings, external route import API, and Fan Fields 2
  handoff already exist.
- Selected-waypoint editing is mostly already available through existing flows.
  The missing convenience actions are explicit Set Start and Set End.
- Home is an editable waypoint with distinct marker styling, not a locked special
  object.
- Google Drive shared storage is no longer just a future v1.1 target.
- Shared storage should remain explicit/manual unless conflict handling is designed.
- Avoid changing IITC portal/details sidebar behavior unless there is a real bug.

## Next documentation task

Finish replacing stale docs:

1. Replace `docs/ROADMAP.md` with the plan-first version.
2. Replace `docs/route-library-design.md` with the current design version.
3. Rename the old UI simplification doc to `docs/ui-model-and-interaction-notes.md`.
4. Rename the old usability notes to `docs/usability-and-ux-gaps.md`.
5. Update references to the old filenames.
6. Remove stale `1.1.0-dev`, `1.2.0`, and `1.3.1` planning/status language from
   active design docs.

## Not in scope unless explicitly requested

- Per-leg travel modes
- OSRM routing/export providers
- Distinct line styles or textures by travel mode
- Multi-modal summaries
- Broad refactors
