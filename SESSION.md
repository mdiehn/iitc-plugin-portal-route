# Session Notes

This file is a short handoff note for agents working in this repo.

## Current branch

`feat/multi-modal-routing`

## Current release target

`1.5.0`

## Current work

- First-pass route-level travel mode support for `drive`, `bike`, and `walk`
- Default travel mode and per-mode average speed settings
- Google Maps export mode mapping through a small provider abstraction
- OpenRouteService beta routing provider, with API key/base URL settings

## Current expectations

- Keep changes small and incremental.
- Preserve current Google route geometry and export splitting behavior unless explicitly changing them.
- Keep stop/wait time behavior unchanged.
- Keep travel mode and speed controls in the route list / points panel, not the small settings panel.
- Update `README.md` and `CHANGELOG.md` for user-visible changes when appropriate.
- Include a suggested commit message with changes unless the user clearly does not want one.

## Not in scope unless explicitly requested

- Per-leg travel modes
- OSRM routing/export providers
- Distinct line styles or textures by travel mode
- Multi-modal summaries
- Broad refactors
