# Session Notes

This file is a short handoff note for agents working in this repo.

## Current branch

`dev/v1.6.0`

## Current release target

`1.6.0-dev`

## Current work

- Start v1.6.0 development after the v1.5.0 release.
- Add a configurable route line color setting.
- Add a saved Home location.
- Add Home should use the saved Home coordinates like Add me uses current location.
- After Add Home, select the newly added Home point so existing route actions can immediately use Set as start or Set as end.

## Current expectations

- Keep changes small and incremental.
- Preserve current travel-mode, Google routing, ORS beta, and export splitting behavior unless explicitly changing them.
- Keep route color and Home settings in global settings.
- Keep Add Home in the shared Menu near Add me.
- Update `README.md` and `CHANGELOG.md` for user-visible changes when appropriate.
- Include a suggested commit message with changes unless the user clearly does not want one.

## Not in scope unless explicitly requested

- Per-leg travel modes
- OSRM routing/export providers
- Distinct line styles or textures by travel mode
- Multi-modal summaries
- Broad refactors
