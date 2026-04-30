  pr.markRouteStale = function(options) {
    options = options || {};
    var hadRouteState = !!pr.state.route || !!pr.state.routeDirty;
    pr.state.routeDirty = hadRouteState;

    if (options.clearRoute) {
      pr.state.route = null;
      pr.clearRouteLine();
    } else if (pr.state.route && pr.state.route.legs) {
      pr.state.route.totals = pr.calculateTotals(pr.state.route.legs);
    }

    pr.saveRoute();
  };

  pr.markRouteCurrent = function() {
    pr.state.routeDirty = false;
    pr.saveRoute();
  };

  pr.isManagedStartStop = function(stop) {
    return !!(stop && stop.startOnMe && pr.state.settings.startOnCurrentLocation);
  };

  pr.isManagedStartIndex = function(index) {
    return pr.isManagedStartStop(pr.state.stops[index]);
  };

  pr.findStartOnMeIndex = function() {
    for (var i = 0; i < pr.state.stops.length; i++) {
      if (pr.state.stops[i] && pr.state.stops[i].startOnMe) return i;
    }
    return -1;
  };

  pr.makeLoopStop = function() {
    if (!pr.state.settings.includeReturnToStart) return null;
    if (!pr.state.stops.length) return null;

    var first = pr.state.stops[0];
    return {
      guid: first.guid || null,
      type: 'loop',
      title: first.title || 'Start',
      lat: first.lat,
      lng: first.lng,
      stopMinutes: 0,
      generatedLoop: true,
      linkedStopIndex: 0,
      linkedStopGuid: first.guid || null
    };
  };

  pr.getRouteStops = function() {
    var stops = pr.state.stops.slice();
    var loopStop = pr.makeLoopStop();
    if (loopStop && stops.length > 1) stops.push(loopStop);
    return stops;
  };

  pr.getRouteStop = function(index) {
    return pr.getRouteStops()[index] || null;
  };

  pr.currentLocationStopFromPosition = function(position, options) {
    options = options || {};
    var coords = position && position.coords;
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') return null;

    return {
      guid: null,
      type: 'map',
      title: options.title || 'Current location',
      lat: coords.latitude,
      lng: coords.longitude,
      stopMinutes: options.startOnMe ? 0 : null,
      startOnMe: !!options.startOnMe,
      accuracy: typeof coords.accuracy === 'number' ? coords.accuracy : null,
      updatedAt: new Date().toISOString()
    };
  };

  pr.getCurrentLocation = function(onSuccess, onError) {
    if (!window.navigator || !navigator.geolocation) {
      if (onError) onError(new Error('Geolocation is not available.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) { onSuccess(position); },
      function(error) {
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  pr.applyStartOnCurrentLocation = function(position) {
    var stop = pr.currentLocationStopFromPosition(position, { startOnMe: true });
    if (!stop) {
      pr.showMessage('Could not read current location.');
      return false;
    }

    var selectedIndex = pr.state.selectedMapPointIndex;
    var selectedStop = typeof selectedIndex === 'number' ? pr.state.stops[selectedIndex] : null;
    var existingIndex = pr.findStartOnMeIndex();
    var existingStop = existingIndex >= 0 ? pr.state.stops[existingIndex] : null;

    if (existingStop) {
      Object.assign(existingStop, stop);
      pr.state.stops.splice(existingIndex, 1);
      pr.state.stops.unshift(existingStop);
    } else {
      pr.state.stops.unshift(stop);
    }

    if (selectedStop) {
      var newSelectedIndex = pr.state.stops.indexOf(selectedStop);
      pr.state.selectedMapPointIndex = newSelectedIndex >= 0 ? newSelectedIndex : null;
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    return true;
  };

  pr.setStartOnCurrentLocation = function(enabled) {
    pr.state.settings.startOnCurrentLocation = !!enabled;
    pr.saveSettings();

    if (!enabled) {
      pr.renderPanel();
      return;
    }

    pr.showMessage('Getting current location...');
    pr.getCurrentLocation(
      function(position) {
        if (!pr.state.settings.startOnCurrentLocation) return;
        if (pr.applyStartOnCurrentLocation(position)) {
          pr.showMessage('Start set to current location.');
        }
      },
      function(error) {
        pr.state.settings.startOnCurrentLocation = false;
        pr.saveSettings();
        pr.renderPanel();
        pr.showMessage('Could not get current location' + (error && error.message ? ': ' + error.message : '.'));
      }
    );
  };

  pr.setLoopBackToStart = function(enabled) {
    pr.state.settings.includeReturnToStart = !!enabled;
    pr.saveSettings();
    pr.markRouteStale({ clearRoute: true });
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
  };

  pr.toggleLoopBackToStart = function() {
    pr.setLoopBackToStart(!pr.state.settings.includeReturnToStart);
  };

  pr.addCurrentLocation = function() {
    pr.showMessage('Getting current location...');
    pr.getCurrentLocation(
      function(position) {
        var stop = pr.currentLocationStopFromPosition(position, { title: 'Current location' });
        if (!stop) {
          pr.showMessage('Could not read current location.');
          return;
        }
        delete stop.startOnMe;
        pr.addStop(stop);
        pr.showMessage('Current location added.');
      },
      function(error) {
        pr.showMessage('Could not get current location' + (error && error.message ? ': ' + error.message : '.'));
      }
    );
  };

  pr.addStop = function(stop) {
    if (!stop || typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return;

    var stopType = stop.type || (stop.guid ? 'portal' : 'map');
    var title = stop.title || (stopType === 'map' ? 'Map point' : 'Unnamed portal');

    if (stop.guid && pr.state.stops.some(function(existing) { return existing.guid === stop.guid; })) {
      pr.showMessage('Already in route: ' + title);
      return;
    }

    pr.state.stops.push({
      guid: stop.guid || null,
      type: stopType,
      title: title,
      lat: stop.lat,
      lng: stop.lng,
      stopMinutes: typeof stop.stopMinutes === 'number' ? stop.stopMinutes : null,
      startOnMe: !!stop.startOnMe,
      accuracy: typeof stop.accuracy === 'number' ? stop.accuracy : null,
      updatedAt: stop.updatedAt || null
    });

    if (stopType === 'map') {
      pr.state.selectedMapPointIndex = pr.state.stops.length - 1;
      if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
  };

  pr.nextMapPointTitle = function() {
    var count = pr.state.stops.filter(function(stop) {
      return stop && stop.type === 'map' && !stop.startOnMe;
    }).length + 1;
    return 'Map point ' + count;
  };

  pr.addMapPointAtLatLng = function(latlng) {
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') return;

    pr.addStop({
      type: 'map',
      title: pr.nextMapPointTitle(),
      lat: latlng.lat,
      lng: latlng.lng
    });
  };

  pr.setAddPointMode = function(enabled) {
    pr.state.addPointMode = !!enabled;
    pr.renderPanel();
    pr.renderMiniControl();
    pr.showMessage(pr.state.addPointMode ? 'Tap the map to add a point.' : 'Add point canceled.');
  };

  pr.removeStop = function(index) {
    if (index < 0 || index >= pr.state.stops.length) return;
    if (pr.isManagedStartIndex(index)) {
      pr.showMessage('Untick Start on me before removing that point.');
      return;
    }

    if (pr.state.selectedMapPointIndex === index) {
      pr.state.selectedMapPointIndex = null;
    } else if (pr.state.selectedMapPointIndex > index) {
      pr.state.selectedMapPointIndex -= 1;
    }

    pr.state.stops.splice(index, 1);
    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
  };

  pr.clearStops = function() {
    var restoreStartOnMe = !!pr.state.settings.startOnCurrentLocation;

    pr.state.stops = [];
    pr.state.route = null;
    pr.state.routeDirty = false;
    pr.state.selectedMapPointIndex = null;
    pr.saveStops();
    pr.saveRoute();
    pr.clearRouteLine();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();

    if (restoreStartOnMe) {
      pr.setStartOnCurrentLocation(true);
    }
  };

  pr.moveStop = function(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= pr.state.stops.length) return;
    if (toIndex < 0 || toIndex >= pr.state.stops.length) return;
    if (fromIndex === toIndex) return;
    if (pr.isManagedStartIndex(fromIndex)) return;
    if (pr.state.settings.startOnCurrentLocation && toIndex === 0) toIndex = 1;
    if (fromIndex === toIndex) return;

    var selectedIndex = pr.state.selectedMapPointIndex;
    var item = pr.state.stops.splice(fromIndex, 1)[0];
    pr.state.stops.splice(toIndex, 0, item);

    if (selectedIndex === fromIndex) {
      pr.state.selectedMapPointIndex = toIndex;
    } else if (selectedIndex !== null && selectedIndex !== undefined) {
      if (fromIndex < selectedIndex && selectedIndex <= toIndex) {
        pr.state.selectedMapPointIndex -= 1;
      } else if (toIndex <= selectedIndex && selectedIndex < fromIndex) {
        pr.state.selectedMapPointIndex += 1;
      }
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
  };


  pr.setStopTitle = function(index, title) {
    if (index < 0 || index >= pr.state.stops.length) return;

    var stop = pr.state.stops[index];
    if (!stop || stop.type !== 'map') return;
    if (pr.isManagedStartStop(stop)) return;

    var cleanTitle = String(title == null ? '' : title).trim();
    if (!cleanTitle) cleanTitle = pr.nextMapPointTitle();

    stop.title = cleanTitle;
    pr.saveStops();
    pr.redrawLabels();
    pr.redrawSegmentTimeLabels();
    pr.renderPanel();
  };


  pr.setStopMinutes = function(index, minutes) {
    if (index < 0 || index >= pr.state.stops.length) return;
    if (pr.isManagedStartIndex(index)) return;
    if (typeof minutes !== 'number' || !isFinite(minutes) || minutes < 0) return;

    pr.state.stops[index].stopMinutes = Math.round(minutes);
    pr.markRouteStale();
    pr.saveStops();
    pr.renderPanel();
  };

  pr.parseDurationMinutes = function(text) {
    var match = String(text == null ? '' : text).trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([mhd]?)$/);
    if (!match) return null;

    var value = Number(match[1]);
    var unit = match[2] || 'm';

    if (!isFinite(value) || value < 0) return null;

    if (unit === 'm') return Math.round(value);
    if (unit === 'h') return Math.round(value * 60);
    if (unit === 'd') return Math.round(value * 24 * 60);

    return null;
  };

  pr.formatDurationInput = function(minutes) {
    minutes = Math.max(0, Math.round(Number(minutes || 0)));

    if (minutes && minutes % 1440 === 0) return (minutes / 1440) + 'd';
    if (minutes && minutes % 60 === 0) return (minutes / 60) + 'h';
    return minutes + 'm';
  };

  pr.selectStopPortal = function(index, center) {
    var stop = pr.getRouteStop(index);
    if (!stop) return;

    if (stop.generatedLoop) {
      if (center && window.map) {
        window.map.setView([stop.lat, stop.lng], window.map.getZoom());
      }
      pr.showMessage('Loop endpoint returns to the first waypoint.');
      return;
    }

    if (!stop.guid) {
      pr.state.selectedMapPointIndex = index;
      if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
      if (center && window.map) {
        window.map.setView([stop.lat, stop.lng], window.map.getZoom());
      }
      pr.redrawLabels();
      pr.renderPanel();
      pr.renderMiniControl();
      return;
    }

    pr.state.selectedMapPointIndex = null;

    var portal = window.portals && window.portals[stop.guid];
    if (center && portal && portal.getLatLng && window.map) {
      window.map.setView(portal.getLatLng(), window.map.getZoom());
    }

    if (typeof window.renderPortalDetails === 'function') {
      window.renderPortalDetails(stop.guid);
    } else {
      window.selectedPortal = stop.guid;
    }

    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
  };


  pr.calculateTotals = function(legs) {
    var driveSeconds = 0;
    var distanceMeters = 0;

    legs.forEach(function(leg) {
      driveSeconds += leg.durationSeconds || 0;
      distanceMeters += leg.distanceMeters || 0;
    });

    var stopSeconds = pr.state.stops.reduce(function(sum, stop) {
      return sum + pr.getEffectiveStopMinutes(stop) * 60;
    }, 0);

    return {
      driveSeconds: driveSeconds,
      stopSeconds: stopSeconds,
      tripSeconds: driveSeconds + stopSeconds,
      distanceMeters: distanceMeters
    };
  };
