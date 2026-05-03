# Session Notes

Current repo: IITC plugin **Portal Route**.

Current branch: `feat/v1.1.0`.

Current version: `1.1.0-dev`, after the `1.0.0` release.

## Project rules

- Keep changes small and focused.
- Do not update generated `dist/` files unless explicitly asked.
- Preserve IITC/plugin compatibility patterns.
- Prefer simple, readable JavaScript over clever abstractions.
- Docs should stay terse, friendly, and non-corporate.

## Name/context

- User is Mike.
- Assistant name in this workspace is Miri.
- A power outage interrupted the previous session; the dirty worktree includes intended work from that session.

## Git history reviewed

Recent v1.1.0 branch work:

- `c48527d` Planning docs updates for v1.1.0
- `bb2ad28` Add local route library foundation
- `d435743` Move route actions into the route list workflow
- `f9abc32` Add route library management and JSON portability
- `ca077a8` Update README install link during build
- `15daf72` Add UI Refactoring plan
- `0dbd13a` Simplify route controls around smart add
- `c59a062` Refine route library save and import actions
- `c680d63` Polish desktop route controls and library panels
- `19764a0` Doc update

Earlier stable milestone:

- `62ddcc9` / tag `v1.0.0` released the main route-planning loop.

## 1.0.0 completed

- Portal and manual map stops.
- Editable manual point names.
- Manual point dragging and waypoint replacement dragging.
- Waypoint row drag reorder and row context actions.
- Per-stop wait times and default stop time.
- Start on me, Add Current Location, and loop back to start.
- Compact mini control and portal details controls.
- Route calculation, stale route tracking, Fit, Google Maps export with staged links.
- Current route JSON import/export.
- Printable route summary.
- Persistent current route state across IITC reloads.
- External route import API used by Fan Fields 2.

## v1.1.0 current focus

Theme: route library with Google Drive shared storage.

Authoritative docs:

- `AGENTS.md`
- `docs/route-library-design.md`
- `docs/ROADMAP.md`
- `docs/ui-refactor-plan.md`

Do first:

- route record schema
- local save/load of named routes
- local storage backend
- conservative UI wiring for Save and Load
- JSON import/export for saved routes and route libraries

Then:

- shared storage backend shape
- inspect IITC Google Drive sync code
- Google Drive backend using a visible user-selected Drive folder
- `route-library.json` in that folder

Do not start with automatic polling, live sync, or hidden `appDataFolder`.

## v1.1.0 already implemented locally

In `src/route-library.js`:

- `schemaVersion: 1` saved route records.
- Saved route metadata: id, name, created/updated timestamps, plugin version.
- Saved stops, route-relevant settings, and map center/zoom.
- Local route library in `localStorage`.
- Save current route as a named route.
- Save from the Route Library panel:
  - no checked route creates a new saved route
  - one checked route overwrites after confirmation
  - multiple checked routes disables Save/Load
- Load one selected saved route.
- Inline rename.
- Delete one or multiple selected routes.
- Export one route, multiple selected routes, or the whole library as JSON.
- Import one route or merge a route library JSON file.
- Duplicate imported route IDs become new route copies instead of silently overwriting.
- Loading a saved route restores stops/settings/map view and queues route calculation.

UI state:

- Route Library is a separate panel.
- Top row has whole-library Import/Export.
- Bottom row has Save, Load, Import, Export, Delete for selected routes.
- Rows use checkboxes and inline name inputs.
- The list shows stop count and updated timestamp.
- Source label currently shows `Stored in: This browser`.

## Current uncommitted worktree

Known dirty files at session refresh:

- `AGENTS.md`
- `CHANGELOG.md`
- `build.js`
- `dist/portal-route.meta.js`
- `dist/portal-route.user.js`
- `docs/route-library-design.md`
- `src/route-library.js`
- `src/state.js`
- `src/ui.js`

Important uncommitted changes:

- `AGENTS.md` says the plugin is Portal Route instead of Driving Route.
- Route library storage calls now go through `pr.routeLibraryStorage()`.
- Added `pr.storageBackends.local`, `loadLibrary()`, and `saveLibrary()` shape.
- Added `pr.state.routeLibraryBackendId = 'local'`.
- Route Library source label uses backend label.
- Build now stamps dev userscript versions when `@version` contains `-dev`.
- Stamp format is `YYYYMMDDHHMMSS`, e.g. `1.1.0-dev.20260503143022`.
- `CHANGELOG.md` has entries for backend helper and dev build stamping.

Note: `dist/` is dirty from a previous build. Do not refresh/generated-update `dist/` unless Mike asks.

## Verification already done this session

- `node --check build.js` passed after changing dev build stamps to `YYYYMMDDHHMMSS`.

## Next likely work

1. Review the uncommitted route-library storage adapter changes and decide whether they are ready to commit.
2. Run source syntax/build checks only if Mike wants generated `dist/` touched, or check assembled source without writing `dist/`.
3. Field-test local route library and smart Add on desktop/mobile IITC.
4. Inspect IITC's existing Google Drive sync implementation before writing Drive code.
5. Document whether Portal Route can reuse IITC auth/session/sync machinery.
6. Add a Google Drive backend only after local route library behavior and adapter shape feel stable.

## Open questions from design docs

- Should route records include only route-relevant settings? Current implementation does that.
- Should loading a route restore map center/zoom? Current behavior: yes.
- Should there be a separate Save As action, or is unchecked Save enough?
- Should Load remain in the Route Library panel when Drive storage is added?
- Can Portal Route reuse IITC's Google Drive sync credentials or registration hooks?
- What is the safest initial conflict behavior for Drive writes from phone and desktop?
- Should shared current-map handoff use `current-map.json` later? Treat as later than route-library storage.
