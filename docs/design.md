# IITC Driving Route Plugin Design

## Overview

`iitc-plugin-driving-route` is a mobile-first IITC plugin for planning driving routes through selected portals.

The plugin is intended to help users:

- add portals to an ordered driving route
- label stops on the map
- show drive time and distance for each segment
- include expected stop time at each portal
- calculate total trip time
- open the route in an external navigation app

## Design documents

- [Phase 1 Design](design-phase-1.md) - mobile-first MVP route planner

## Phase summary

### Phase 1: Mobile-first MVP

Phase 1 focuses on a practical manual route planner:

- add portals to a route
- preserve manual order
- label stops on the map
- calculate driving route
- show per-leg drive time and distance
- show total drive time, stop time, trip time, and distance
- provide a Google Maps directions link

### Later phases

Later phases may add:

- route optimization
- manual reordering
- saved routes
- per-portal stop-time overrides
- Apple Maps and Waze links
- route export
- turn-by-turn directions inside IITC

## Credit

This plugin is a separate implementation inspired in part by the IITC Traveling Agent plugin by yavidor.
