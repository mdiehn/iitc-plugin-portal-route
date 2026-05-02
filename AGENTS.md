# AGENTS.md

## Project

This repo contains an IITC plugin called **Driving Route**.

Current version: `1.0.0`.

## Working style

- Keep changes small and focused.
- Do not do broad refactors unless explicitly asked.
- Do not update generated `dist/` files unless explicitly asked.
- Preserve existing plugin style and compatibility patterns.
- Prefer simple, readable JavaScript over clever abstractions.
- Keep UI text short.
- Docs should be terse, friendly, and non-corporate.

## Current focus

Implement **manual point dragging** on the map.

Manual points currently:
- can be added
- appear in the waypoint list
- are selectable
- have map markers / selectable handles
- do not yet drag properly

Dragging behavior:
- manual point markers should be draggable
- dragging should update the stored point coordinates
- dragging should update marker position and waypoint state
- selection should remain sane after drag
- use thin marker/handle styling
- provide visual feedback while dragging

## Do not get distracted by later portal dragging yet

Portal waypoint dragging is planned, but not part of the current push unless explicitly requested.
