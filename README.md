# IITC plugin: Portal Route

Portal Route is an IITC plugin for planning a driving route through selected Ingress portals and manual map points.

It is built for mobile-first use, but works on desktop IITC too. Build a stop list, account for stop time, export to Google Maps, or print a route summary.

## Status

Current release: `1.0.0`

This is the first stable release.

**Install:** [`portal-route.user.js`](https://github.com/mdiehn/iitc-plugin-portal-route/raw/refs/heads/feat/v1.1.0/dist/portal-route.user.js)

## Quick start

1. Select a portal in IITC.
2. Click **Add**.
3. Add more portals, manual points, or your current location.
4. Adjust stop times if needed.
5. Use **Maps**, **Print**, **Export**, or **Import** as needed.

## Main panel

![Portal Route main panel](docs/images/mainpanel.png)

The main panel is where you manage the route.

### Stop list

The stop list shows the current route order. Drag rows to reorder stops. Right-click or long-press a row to delete, rename, or move it to the start or end.

**Default stop time** applies to stops that do not have their own stop time.

### Settings

- **Show segment times on map** shows per-leg labels on the route line when route data is available.

### Add

- **Add** starts with your current location for an empty route, adds the selected portal when one is selected, or lets you place a manual map point.
- Right-click or long-press **Add** for Add current location, Add selected portal, Add point, Loop/Unloop, Reverse route, and Clear route.

### Route

- Routes calculate automatically after changes.
- **Maps** opens the route in Google Maps. Long routes are split into stage links.
- **Print** opens a printable route summary.

When route data is available, the panel shows drive time, stop time, trip time, and distance.

![Portal Route panel with route data](docs/images/mainpanel-with-route-data.png)

### Data

- **Save** stores the current route in this browser's route library.
- **Load** opens saved routes from this browser and loads the selected route.
- Saved routes can be renamed, updated from the current route, deleted, exported, and imported.
- Multiple saved routes can be selected for export or delete.
- The local route library can be exported or imported as JSON.
- **Export** downloads the current route as JSON.
- **Import** loads a route from JSON.

## Mini control

The mini control is for quick route actions while mostly staying on the map.

<img src="docs/images/minicontrol.png" alt="Portal Route mini control" width="82">

- **M** opens the current route in Google Maps.
- **+ / -** adds to the route or removes the selected portal or manual point. Right-click or long-press for the Add menu.
- **count button** opens the route list.
- **=** opens settings.

## Location notes

Browser location can be very accurate on a phone and very wrong on a desktop. Desktop browsers may report the location of a network exit point instead of your real position.

Use **Add current location** when you are on the device you will actually navigate from.

## Map views

Picked stops appear as numbered markers before routing.

![Portal Route with picked stops](docs/images/iitc-with-points-picked.png)

After you add enough stops, Portal Route draws the route line and fills in drive time, trip time, and distance. With **Loop** enabled, the generated loop endpoint is labeled `L`.

![Portal Route with route plotted and loop enabled](docs/images/iitc-with-route-plotted-and-loop-enabled.png)

## Empty route

After clearing the list, the panel keeps the route controls available and shows that there are no waypoints.

![Portal Route empty panel](docs/images/mainpanel-cleared.png)

## Main features

- Add selected portals as route stops.
- Add manual map points.
- Add your current location as a route stop.
- Optionally loop back to the first stop.
- Edit, remove, and reorder stops.
- Set a default stop time.
- Override stop time per stop.
- Use flexible stop times like `15m`, `1.5h`, and `2d`.
- Calculate a route through the stop list automatically.
- Show total drive time, stop time, trip time, and distance.
- Show per-leg time and distance in the stop list.
- Mark route data as updating after edits.
- Persist waypoints and calculated route data across IITC reloads.
- Optionally show segment time labels on the map.
- Export the route to Google Maps, with staged links for long routes.
- Export and import route JSON.
- Open a printable route summary.

## Known limits

### Google Maps waypoint limit

Google Maps appears to plot the first point, final point, and up to 9 intermediate stops. That means routes with more than 11 total points may export incompletely.

Portal Route splits longer routes into multiple Google Maps stage links. Open the stages in order.

### Browser/device location

Current location depends on browser geolocation. On desktop, this may be coarse or wrong.

### Mobile hover behavior

Hover labels are limited on mobile because touch devices do not have reliable hover.

### Updating route data

Changing stops or stop times recalculates the route automatically. Totals and segment data may lag briefly while the route updates.

## Build

From the repo root:

```bash
npm run build
```

Or directly:

```bash
node build.js
```

The built userscript and metadata file are written to:

```text
dist/portal-route.user.js
dist/portal-route.meta.js
```

Syntax check:

```bash
npm run check
```

or:

```bash
node --check dist/portal-route.user.js
```

## Repository layout

```text
dist/                 built userscript files
docs/                 design notes and images
src/                  plugin source files
CHANGELOG.md          changes by milestone
README.md             this file
VERSION               current release version
build.js              build script
package.json          npm scripts and package info
```

Source changes should be made in `src/`. Files in `dist/` are build output.

For now, keep these versions in sync by hand:

```text
VERSION
src/banner.js
src/constants.js
package.json
```

## More docs

- [Design overview](docs/design.md)
- [Phase 1 design](docs/design-phase-1.md)
- [Usability notes](docs/usability-notes.md)

## Credits

Portal Route is a separate implementation inspired in part by the IITC plugins [Map Route Planner](https://softspot.nl/ingress/plugins/documentation/iitc-plugin-maps-route-planner.user.js.html), by DanielOnDiordona, and [Traveling Agent](https://github.com/yavidor/traveling-agent-plugin), by yavidor.
