# AGENTS.md

## Project

This repo contains the IITC plugin **Portal Route**.

Current release: `1.6.0`

Current branch after release merge: `main`

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
- v1.6.0 is released with route line appearance settings, saved Home support, improved route controls, and pinned standalone panel action bars.

## Current priorities

- Preserve existing Google route calculation geometry, ORS beta behavior, and route splitting behavior unless a change is clearly required.
- Keep Home waypoints editable like normal route points.
- Keep standalone panel action bars pinned while long lists/settings scroll.
- Treat OSRM, per-leg travel modes, multi-modal summaries, and mode-specific line styling as later work.

## Key docs

- `AGENTS.md`
- `SESSION.md`
- `README.md`
- `CHANGELOG.md`
- `docs/design.md`
- `docs/ROADMAP.md`
- `docs/route-library-design.md`
- `docs/ui-model-and-interaction-notes.md`
- `docs/usability-and-ux-gaps.md`

## Documentation roles

Keep project docs focused on their current job:

- `CHANGELOG.md`: release history and user-visible changes.
- `docs/ROADMAP.md`: forward-looking plan, organized by feature area.
- `docs/route-library-design.md`: current route library, storage, schema, and shared-storage design.
- `docs/ui-model-and-interaction-notes.md`: current UI surfaces, interaction rules, and control placement.
- `docs/usability-and-ux-gaps.md`: current rough edges, small UX gaps, and field-test notes.

Avoid preserving stale implementation phases in active planning docs. If a plan has
shipped, move the useful summary to a completed section or to `CHANGELOG.md`.

Do not describe already-shipped work as future work. Check the current code,
`CHANGELOG.md`, and recent session notes before editing roadmap/design docs.

## Current documentation cleanup direction

The v1.6.0 documentation cleanup is moving old phase-plan docs into current
guidance docs:

- old UI simplification plan -> `docs/ui-model-and-interaction-notes.md`
- old usability notes -> `docs/usability-and-ux-gaps.md`
- old route library v1.1 planning -> current `docs/route-library-design.md`

When updating these files, prefer current state, active gaps, and design rules.
Put release chronology in `CHANGELOG.md`, not in design docs.
