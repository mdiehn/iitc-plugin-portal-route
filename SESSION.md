# Session Notes

Current focus: Portal Route IITC plugin.

Working on:
- Manual point dragging is implemented.
- Next feature direction: portal waypoint dragging.
- Current UI thread: portal details info-panel controls.
- Place the Portal Route section below the History line.
- Make the Portal Route info-panel section visually match Fan Fields 2.

Important constraints:
- Keep changes small and focused.
- Do not update generated `dist/` files unless explicitly asked.
- Preserve existing IITC/plugin compatibility patterns.
- Portal waypoint dragging is now explicitly in scope.

Recent context:
- `src/fanfield2.user.js` is in this repo as a visual/style reference.
- Fan Fields 2 uses a dark teal title strip and compact yellow links in the portal details panel.
- Portal Route had been appearing above `History:` because it injected into `.linkdetails`.

Recent changes:
- Added Portal Route portal-details controls: Add/Remove, Menu, List, Clear.
- Added settings toggles for mini control and info-panel controls.
- Changed Portal Route info-panel injection to target `#portaldetails`.
- Added logic to place Portal Route immediately after the `History:` text when present.
- Styled the Portal Route info-panel block with an FF2-like title strip and compact link layout.
- Restored a thin blue divider above the Portal Route info-panel title.
- Added an initial setup-time injection pass so the section appears without toggling the setting.
- Kept FF2 unchanged; adjusted Portal Route `replaceStops` so the existing `openPanel` import option opens the route list again.

Verification:
- Assembled source syntax checked in memory with Node.
- `dist/` was not rebuilt for the portal-details styling change.

Next:
- Load in IITC and visually confirm the Portal Route section appears below `History:`.
- Adjust spacing/wrapping if the links do not match Fan Fields 2 closely enough.
- Implement portal waypoint dragging without regressing manual point dragging.
