# AGENTS.md

## Project

This repo contains the IITC plugin **Portal Route**.

Current release target: `1.6.0-dev`

Current branch when this note was updated: `dev/v1.6.0`

## Working style

- Keep changes small and focused.
- Do not do broad refactors unless explicitly asked.
- Preserve existing plugin style and IITC compatibility patterns.
- Prefer simple, readable JavaScript over clever abstractions.
- Keep UI text short.
- Docs should be terse, friendly, and non-corporate.
- Do not update generated `dist/` files unless explicitly asked or preparing/rebuilding a release-related change.
- Include a suggested commit message unless the user clearly does not want one.
- Update `CHANGELOG.md` and `README.md` when changes are user-visible or release-relevant, and call out when they were intentionally left unchanged.
- Keep `AGENTS.md` and `SESSION.md` as short handoff docs for agents. Do not turn them into running history logs.

## Current state

- Route library and Google Drive shared storage are already implemented.
- Drive auth now prefers IITC Sync auth when available, with Portal Route OAuth Client ID fallback.
- First-pass route-level travel mode support for `drive`, `bike`, and `walk` is released in v1.5.0.
- OpenRouteService beta routing is released as an opt-in provider in v1.5.0.
- Travel mode and per-mode speed controls belong in the route list / points panel, even though they persist as settings.
- v1.6.0 development has started with route line color and saved Home location polish.

## Current priorities

- Keep route color and saved Home changes incremental.
- Preserve existing Google route calculation geometry, ORS beta behavior, and route splitting behavior unless a change is clearly required.
- Add Home should add the saved Home point and select it so Set as start / Set as end can be used immediately.
- Treat OSRM, per-leg travel modes, multi-modal summaries, and mode-specific line styling as later work.

## Key docs

- `AGENTS.md`
- `SESSION.md`
- `README.md`
- `CHANGELOG.md`
- `docs/design.md`
- `docs/ROADMAP.md`
- `docs/route-library-design.md`
- `docs/ui-refactor-plan.md`
