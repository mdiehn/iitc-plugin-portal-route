# AGENTS.md

## Project

This repo contains the IITC plugin **Portal Route**.

Current release target: `1.5.0`

Current branch when this note was updated: `feat/multi-modal-routing`

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
- First-pass route-level travel mode support is in progress for `drive`, `bike`, and `walk`.
- OpenRouteService beta routing is being added as an opt-in provider for v1.5.0.
- Travel mode and per-mode speed controls belong in the route list / points panel, even though they persist as settings.

## Current priorities

- Keep travel-mode changes incremental.
- Preserve existing Google route calculation geometry and route splitting behavior unless a change is clearly required.
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
