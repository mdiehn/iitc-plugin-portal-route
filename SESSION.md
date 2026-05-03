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

## Current Google Drive work

Started after commit `3bfa200`.

IITC Sync source inspected:

- Source path: IITC CE `plugins/sync.js`.
- It loads Google's `gapi` client and uses Drive API v3.
- Scope is `drive.file`.
- It creates a visible folder named `IITC-SYNC-DATA-V3`.
- It stores one file per registered plugin field.
- Plugins register syncable maps with `plugin.sync.registerMapForSync(...)`.
- It polls every 3 minutes.
- Remote updates replace local maps if the update UUID belongs to another client.

Portal Route decision:

- Do not use IITC Sync registration for the first slice.
- Follow its known-good assumptions: `gapi`, Drive v3, `drive.file`, cached folder/file IDs.
- Use a visible folder named by the user, defaulting to `IITC Portal Route`.
- Store a human-readable `route-library.json`.
- Add manual Connect, Pull, and Push controls.
- Avoid polling/live sync and hidden `appDataFolder`.

Current implementation:

- Added `src/drive-storage.js`.
- Added Drive route-library local cache and Drive folder/file ID storage keys.
- Added `googleDrive` storage backend.
- Added Route Library storage selector.
- Added Drive Connect, Pull, and Push actions in the Route Library panel.
- Drive writes are action-driven and cached locally.

Verification:

- `node --check build.js`
- assembled source syntax check at `/tmp/portal-route-check.js`
- `node --check src/drive-storage.js`

Commit message notes:

- Add Google Drive route-library backend
- Add manual Drive Connect/Pull/Push controls
- Cache Drive route library locally
- Show Route Library action messages in the panel
- Document IITC Sync findings
- Credit IITC Sync/xelio in README

## Open questions from design docs

- Should route records include only route-relevant settings? Current implementation does that.
- Should loading a route restore map center/zoom? Current behavior: yes.
- Should there be a separate Save As action, or is unchecked Save enough?
- Should Load remain in the Route Library panel when Drive storage is added?
- Can Portal Route keep using IITC Sync's public Google client ID safely long term?
- What is the safest initial conflict behavior for Drive writes from phone and desktop?
- Should shared current-map handoff use `current-map.json` later? Treat as later than route-library storage.
