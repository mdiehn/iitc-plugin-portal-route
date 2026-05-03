# AGENTS.md

## Project

This repo contains an IITC plugin called **Portal Route**.

Current version: `1.1.0-dev` planning after the `1.0.0` release.

## Working style

- Keep changes small and focused.
- Do not do broad refactors unless explicitly asked.
- Do not update generated `dist/` files unless explicitly asked.
- Preserve existing plugin style and compatibility patterns.
- Prefer simple, readable JavaScript over clever abstractions.
- Keep UI text short.
- Docs should be terse, friendly, and non-corporate.

## Current focus

Plan and implement the **v1.1.0 route library with Google Drive shared storage**.

Start with:

- route record schema
- local save/load of named routes
- local storage backend
- conservative UI wiring for the existing Save and Load buttons
- JSON import/export for saved routes and route libraries

Then add:

- storage backend shape shared by local and external storage
- Google Drive backend using a visible user-selected Drive folder
- `route-library.json` in that folder

Do not start with automatic polling, live sync, or hidden `appDataFolder` storage. Before implementing Drive directly, inspect IITC's existing Google Drive sync code to see whether Portal Route can reuse its auth/session/sync machinery or at least follow its working assumptions.

See `docs/route-library-design.md` for the current design notes and open questions.
