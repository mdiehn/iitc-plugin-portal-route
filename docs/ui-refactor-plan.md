# IITC Portal Route – UI Simplification Plan (Revised)

Status: mostly implemented in `1.1.0-dev`; keep this as historical UI-plan context plus a checklist for remaining polish.

## Goal

Reduce UI clutter, unify behavior across mobile/desktop, and make routing implicit.

---

## UI Model (authoritative)

The app consists of:

- **Mini control** (always visible, primary mobile control)
- **Settings panel** (primary full panel; no separate “main panel”)
- **Route list**
- **Library panel**
- **Info/details panel section**

Notes:

- Settings panel replaces what was previously referred to as “main panel”
- No separate “main panel” exists
- Library remains a separate panel with current design

---

## Phase 1 – Autoroute (foundation)

### 1. Remove Plot/Replot

Delete all Plot / Replot buttons:

- mini control
- settings panel
- anywhere else

### 2. Make routing automatic

Recompute route on:

- add point
- remove point
- move point (drag)

Optional:

- debounce during dragging

---

## Phase 2 – Smart Add (core behavior)

Implement shared function:

```js
function smartAdd() {
  if (route.length === 0) {
    tryAddCurrentLocationOrFallback();
  } else if (selectedPortal) {
    addPortal(selectedPortal);
  } else {
    enterPointPlacementMode();
  }
}
```

Fallback:

- If geolocation fails:
  - enter point mode
  - show message

---

## Phase 3 – Add context menu (desktop + mobile)

### Trigger

- Mobile: long-press
- Desktop: right-click (`contextmenu`)

### Menu

```text
Add current location
Add selected portal (if available)
Add point
—
Loop / Unloop
Reverse route
—
Clear route (confirm)
```

Implementation notes:

- Prevent default browser context menu
- Reuse same handler across:
  - settings panel Add
  - mini control Add
  - info panel Add

---

## Phase 4 – Mini control cleanup

### Target layout

```text
M   L   +/-   [#]   =
```

### Behavior

- `+/-`
  - Tap → `smartAdd()`
  - Long-press / right-click → open Add menu

- `[#]`
  - Open route list

- `M`
  - Open route in Google Maps

- `L`
  - Toggle loop back to start

- `⚙`
  - Open settings panel

### Removed

- Plot (`P`)
- Any duplicate controls

---

## Phase 5 – Settings panel cleanup

Settings panel replaces “main panel”.

### Remove

- Plot / Replot
- Separate Add Portal / Add Point buttons
- Loop toggle
- Clear button

### Current role

- Holds general configuration.
- Opens Route list and Route Library.
- Offers manual Recalc Route as a fallback.

---

## Phase 6 – Route list improvements

### Remove

- Per-row buttons (delete/edit/etc.)

### Add interactions

Tap row:

- Select waypoint

Right-click / long-press row:

```text
Delete
Rename
Set as start
Set as end
```

---

## Phase 7 – Info/details panel redesign

### Primary action button (context-sensitive)

```text
If selected item is in route:
  Label: Remove
  Action: remove waypoint

Else:
  Label: Add
  Action:
    - portal selected → add portal
    - no selection → close panel + enter point mode
```

### Button row

```text
[ Add / Remove ]   [#]   M   ⚙   📚
```

- `[#]` → open route list
- `M` → open in Google Maps
- `⚙` → open settings panel
- `📚` → open library

Notes:

- Info panel is a richer control surface than mini control
- Library button is acceptable here even if not in mini control

---

## Phase 8 – Library + Maps separation

### Library panel

Keep current design conceptually:

- Save route
- Load route
- Import
- Optional file export

### Maps button

Separate concept from Library.

Exists in:

- mini control
- info panel

Behavior:

- Tap → open in Google Maps

Optional future:

- travel mode selection

---

## Phase 9 – Settings panel as navigation hub

Settings panel should provide access to:

```text
Settings
- Route list (optional redundancy)
- Library
- Other settings
```

Notes:

- Route list is also directly accessible via mini control
- Including it here is optional but acceptable

---

## Phase 10 – Optional enhancements later

- Map right-click / long-press:
  - Add point here
  - Add nearby portal

- Route optimization:
  - “Optimize order” context menu item

- Export enhancements:
  - Travel mode selection for Maps

---

## Implementation order

1. Autoroute + remove plot buttons
2. `smartAdd()`
3. Add context menu
4. Mini control update
5. Settings panel cleanup
6. Route list interaction changes
7. Info panel redesign
8. Library / Maps separation

Each step should leave the plugin functional.

---

## Result

- Minimal visible controls
- Consistent interaction model:
  - tap = fast action
  - long-press/right-click = full menu
  - selection = context
- Faster route building
- Clean separation of:
  - building (Add)
  - managing (Library)
  - using (Maps)

Implemented notes:

- Mini control is `M`, `L`, add/remove, route count, and settings.
- Settings panel keeps general preferences, Route List, Route Library, and manual Recalc Route.
- Route list is the working console.
- Route-list rows use tap to select and right-click/long-press for Delete, Rename, Set as start, and Set as end.
- Info panel uses text links styled like other portal details plugins.
- Route calculation is automatic after edits, with Recalc Route as a manual fallback.
